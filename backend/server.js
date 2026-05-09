const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI Client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const delay = ms => new Promise(res => setTimeout(res, ms));

app.post('/api/fact-check', upload.single('pdf'), async (req, res) => {
    try {
        console.log("Starting full document processing with OpenAI GPT-4o...");
        if (!req.file) return res.status(400).send('No file uploaded.');

        const dataBuffer = req.file.buffer;
        const parser = new PDFParse({ data: dataBuffer });
        const pdfData = await parser.getText();
        const text = pdfData.text;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from PDF.' });
        }

        // 1. Extract All Claims
        console.log("Extracting all claims...");
        const extractionPrompt = `Identify and extract every specific factual claim (stats, dates, names, figures, technical specs) found in the following text. 
        Do not limit the number of claims; extract all of them.
        Format strictly as a JSON object with a "claims" key containing an array of strings.
        
        Text: ${text.substring(0, 15000)}`;

        let claims = [];
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [{ role: "user", content: extractionPrompt }],
                response_format: { type: "json_object" }
            });
            const content = JSON.parse(response.choices[0].message.content);
            claims = content.claims || Object.values(content)[0] || [];
            console.log(`Successfully extracted ${claims.length} claims.`);
        } catch (e) {
            console.error("OpenAI extraction failed:", e.message);
            return res.status(500).json({ error: 'Failed to extract claims using OpenAI.' });
        }

        // 2. Verify All Claims
        const report = [];
        for (const claim of claims) {
            console.log(`Verifying: ${claim}`);
            
            const verificationPrompt = `Critically evaluate this claim: "${claim}". 
            
            Status must be:
            - "Verified": 100% accurate.
            - "Inaccurate": Partially true or outdated.
            - "False": Incorrect or myth.
            
            Instructions:
            1. Be strict and thorough.
            2. Provide the absolute truth in "correct_fact".
            3. Provide evidence/reasoning in "details".

            Format strictly as JSON: { "claim": "${claim}", "status": "Verified/Inaccurate/False", "details": "...", "correct_fact": "..." }`;

            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: verificationPrompt }],
                    response_format: { type: "json_object" }
                });
                const verifiedData = JSON.parse(response.choices[0].message.content);
                report.push({ ...verifiedData, source: "OpenAI GPT-4o" });
                console.log(`Verified: ${claim} [${verifiedData.status}]`);
            } catch (e) {
                console.error(`Verification failed for "${claim}":`, e.message);
                report.push({ 
                    claim, 
                    status: "Error", 
                    details: "Verification failed due to high load.", 
                    correct_fact: "N/A",
                    source: "OpenAI Error"
                });
            }
            // Minimal delay to prevent socket exhaustion while maintaining high speed
            await delay(100); 
        }

        console.log("Full report generated.");
        res.json({ text: text.substring(0, 5000), claims: report });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`OpenAI Fact-Check Server running on port ${port}`);
});
