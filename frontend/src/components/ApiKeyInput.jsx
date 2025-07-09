import React, { useState } from 'react';

function ApiKeyInput({ onApiKeySubmit, loading, error }) {
    const [apiKey, setApiKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey);
        }
    };

    return (
        <div className="api-key-input">
            <h2>Enter Apify API Key</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Your Apify API Key"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
            {error && <p className="error-message">Error: {error}</p>}
        </div>
    );
}

export default ApiKeyInput; 