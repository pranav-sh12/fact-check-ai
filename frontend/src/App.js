import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState('');

    const steps = [
        "Uploading PDF...",
        "Extracting text content...",
        "Identifying key factual claims...",
        "Verifying claims against AI knowledge...",
        "Finalizing report..."
    ];

    useEffect(() => {
        let interval;
        if (loading) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
            }, 3000);
        } else {
            setLoadingStep(0);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', file);

        const API_URL = process.env.BACKEND_URL || 'http://localhost:5001';

        setLoading(true);
        setError('');
        try {
            const response = await axios.post(`${API_URL}/api/fact-check`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResults(response.data);
        } catch (err) {
            setError('Failed to process PDF. Make sure the backend is running and your API key is valid.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logo}>🛡️ FactCheck AI</div>
                <p style={styles.subtitle}>Verify document claims with advanced grounding</p>
            </header>

            <main style={styles.main}>
                {/* Upload Section */}
                <div style={styles.card}>
                    <div style={styles.uploadArea}>
                        <div style={styles.iconContainer}>📄</div>
                        <h3 style={{ margin: '10px 0' }}>{file ? file.name : 'Choose a PDF to verify'}</h3>
                        <input 
                            type="file" 
                            accept="application/pdf" 
                            onChange={handleFileChange} 
                            style={styles.fileInput}
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" style={styles.fileLabel}>
                            {file ? 'Change File' : 'Select Document'}
                        </label>
                    </div>
                    
                    <button 
                        onClick={handleUpload} 
                        disabled={loading || !file} 
                        style={{
                            ...styles.button,
                            backgroundColor: (loading || !file) ? '#ccc' : '#4F46E5'
                        }}
                    >
                        {loading ? 'Processing...' : 'Run Fact-Check'}
                    </button>

                    {loading && (
                        <div style={styles.loadingContainer}>
                            <div style={styles.spinner}></div>
                            <p style={styles.loadingText}>{steps[loadingStep]}</p>
                            <div style={styles.progressBar}>
                                <div style={{...styles.progressFill, width: `${((loadingStep + 1) / steps.length) * 100}%`}}></div>
                            </div>
                            <p style={styles.waitMessage}>
                                ⏱️ Please wait at least 15-30 seconds for deep analysis...
                            </p>
                        </div>
                    )}

                    {error && <div style={styles.errorBox}>{error}</div>}
                </div>

                {/* Results Section */}
                {results && (
                    <div style={{...styles.card, marginTop: '30px', animation: 'fadeIn 0.5s ease-in'}}>
                        <h2 style={styles.resultTitle}>Analysis Report</h2>
                        <div style={styles.statsRow}>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Claims Found</span>
                                <span style={styles.statValue}>{results.claims.length}</span>
                            </div>
                            <div style={styles.statItem}>
                                <span style={styles.statLabel}>Model</span>
                                <span style={styles.statValue}>Gemini 3.1</span>
                            </div>
                        </div>

                        <div style={styles.claimsGrid}>
                            {results.claims.map((c, i) => (
                                <div key={i} style={styles.claimCard}>
                                    <div style={styles.claimHeader}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: c.status === 'Verified' ? '#DCFCE7' : 
                                                            c.status === 'Inaccurate' ? '#FEF3C7' : '#FEE2E2',
                                            color: c.status === 'Verified' ? '#166534' : 
                                                   c.status === 'Inaccurate' ? '#92400E' : '#991B1B'
                                        }}>
                                            {c.status}
                                        </span>
                                        <span style={styles.sourceTag}>{c.source}</span>
                                    </div>
                                    <p style={styles.claimText}>"{c.claim}"</p>
                                    
                                    {(c.status === 'False' || c.status === 'Inaccurate') && (
                                        <div style={styles.correctionBox}>
                                            <span style={styles.correctionLabel}>Correct Fact:</span>
                                            <p style={styles.correctionText}>{c.correct_fact}</p>
                                        </div>
                                    )}

                                    <div style={styles.divider}></div>
                                    <p style={styles.detailText}>{c.details}</p>
                                </div>
                            ))}
                        </div>

                        <details style={styles.details}>
                            <summary style={styles.summary}>View Extracted Raw Text</summary>
                            <div style={styles.rawText}>
                                {results.text}...
                            </div>
                        </details>
                    </div>
                )}
            </main>

            <footer style={styles.footer}>
                Powered by Gemini AI Grounding • 2026
            </footer>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1E293B',
        padding: '0 20px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    header: {
        textAlign: 'center',
        padding: '60px 0 40px 0'
    },
    logo: {
        fontSize: '2.5rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '10px'
    },
    subtitle: {
        color: '#64748B',
        fontSize: '1.1rem'
    },
    main: {
        width: '100%',
        maxWidth: '800px'
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #F1F5F9'
    },
    uploadArea: {
        border: '2px dashed #E2E8F0',
        borderRadius: '16px',
        padding: '40px 20px',
        textAlign: 'center',
        marginBottom: '20px',
        backgroundColor: '#FBFDFF',
        transition: 'all 0.2s ease'
    },
    iconContainer: {
        fontSize: '40px',
        marginBottom: '15px'
    },
    fileInput: {
        display: 'none'
    },
    fileLabel: {
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#F1F5F9',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        color: '#475569',
        fontSize: '0.9rem',
        transition: 'background 0.2s'
    },
    button: {
        width: '100%',
        padding: '16px',
        borderRadius: '12px',
        border: 'none',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'transform 0.1s active, opacity 0.2s',
        boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
    },
    loadingContainer: {
        marginTop: '25px',
        textAlign: 'center'
    },
    spinner: {
        width: '30px',
        height: '30px',
        border: '3px solid #F1F5F9',
        borderTop: '3px solid #4F46E5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px auto'
    },
    loadingText: {
        fontSize: '0.95rem',
        color: '#4F46E5',
        fontWeight: '500',
        marginBottom: '12px'
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#F1F5F9',
        borderRadius: '10px',
        overflow: 'hidden'
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4F46E5',
        transition: 'width: 0.5s ease-in-out'
    },
    waitMessage: {
        marginTop: '15px',
        fontSize: '0.85rem',
        color: '#64748B',
        fontStyle: 'italic',
        animation: 'pulse 2s infinite'
    },
    errorBox: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FEE2E2',
        borderRadius: '12px',
        color: '#B91C1C',
        fontSize: '0.9rem',
        textAlign: 'center'
    },
    resultTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '20px'
    },
    statsRow: {
        display: 'flex',
        gap: '20px',
        marginBottom: '25px'
    },
    statItem: {
        backgroundColor: '#F8FAFC',
        padding: '12px 20px',
        borderRadius: '12px',
        flex: 1
    },
    statLabel: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#64748B',
        textTransform: 'uppercase',
        fontWeight: '700',
        letterSpacing: '0.05em'
    },
    statValue: {
        fontSize: '1.1rem',
        fontWeight: '800',
        color: '#1E293B'
    },
    claimsGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    claimCard: {
        border: '1px solid #F1F5F9',
        borderRadius: '16px',
        padding: '20px',
        transition: 'transform 0.2s ease'
    },
    claimHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: '700'
    },
    sourceTag: {
        fontSize: '0.7rem',
        color: '#94A3B8',
        fontWeight: '500'
    },
    claimText: {
        fontSize: '1.05rem',
        fontWeight: '600',
        lineHeight: '1.5',
        marginBottom: '12px'
    },
    divider: {
        height: '1px',
        backgroundColor: '#F1F5F9',
        marginBottom: '12px'
    },
    detailText: {
        fontSize: '0.95rem',
        color: '#475569',
        lineHeight: '1.6'
    },
    correctionBox: {
        backgroundColor: '#FFFBEB',
        borderLeft: '4px solid #F59E0B',
        padding: '12px 15px',
        borderRadius: '8px',
        marginBottom: '12px'
    },
    correctionLabel: {
        display: 'block',
        fontSize: '0.7rem',
        fontWeight: '800',
        color: '#92400E',
        textTransform: 'uppercase',
        marginBottom: '4px'
    },
    correctionText: {
        fontSize: '0.95rem',
        fontWeight: '700',
        color: '#1E293B',
        margin: 0
    },
    details: {
        marginTop: '25px',
        cursor: 'pointer'
    },
    summary: {
        fontSize: '0.9rem',
        color: '#64748B',
        fontWeight: '600',
        outline: 'none'
    },
    rawText: {
        marginTop: '15px',
        padding: '15px',
        backgroundColor: '#F8FAFC',
        borderRadius: '12px',
        fontSize: '0.85rem',
        color: '#64748B',
        whiteSpace: 'pre-wrap',
        maxHeight: '200px',
        overflowY: 'auto'
    },
    footer: {
        marginTop: 'auto',
        padding: '40px 0',
        fontSize: '0.85rem',
        color: '#94A3B8'
    }
};

// Add keyframe for spinner
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
`;
document.head.appendChild(styleSheet);

export default App;
