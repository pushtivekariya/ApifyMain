import React, { useState, useEffect, useRef } from 'react';
import styles from './ApifyIntegration.module.css'; // Import the CSS module

const ApifyIntegration = () => {
    const [apiKey, setApiKey] = useState('');
    const [actors, setActors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // New state for success messages
    const [selectedActor, setSelectedActor] = useState(null);
    const [actorSchema, setActorSchema] = useState(null);
    const [schemaLoading, setSchemaLoading] = useState(false);
    const [schemaError, setSchemaError] = useState(null);
    const [mappedInputs, setMappedInputs] = useState({});
    const [executionLoading, setExecutionLoading] = useState(false);
    const [executionError, setExecutionError] = useState(null);
    const [executionResult, setExecutionResult] = useState(null);
    const [runId, setRunId] = useState(null);
    const pollingIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
        setSchemaError(null);
        setExecutionError(null);
    };

    const handleApiKeySubmit = async () => {
        setLoading(true);
        clearMessages(); // Clear messages on new submission
        setActors([]);
        setSelectedActor(null);
        setActorSchema(null);
        setMappedInputs({});
        setExecutionResult(null);
        setRunId(null);
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        try {
            const response = await fetch('http://localhost:3000/api/apify/actors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch actors');
            }
            setActors(data);
            console.log('ApifyIntegration: Fetched actors:', data); // Add this line
            setSuccessMessage('Actors loaded successfully!'); // Set success message
        } catch (err) {
            setError('Failed to fetch actors: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActorSelect = (actor) => {
        setSelectedActor(actor);
        console.log('ApifyIntegration: Selected actor:', actor); // Add this line
        setActorSchema(null);
        setMappedInputs({});
        setExecutionResult(null);
        setRunId(null);
        clearMessages(); // Clear messages on actor change
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };

    const fetchActorSchema = async () => {
        if (!selectedActor) return;

        setSchemaLoading(true);
        clearMessages(); // Clear messages on new schema fetch
        setActorSchema(null);
        setMappedInputs({});

        try {
            const response = await fetch(`http://localhost:3000/api/apify/actor-schema/${selectedActor.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch actor schema');
            }
            setActorSchema(data);
            setSuccessMessage('Actor schema loaded successfully!'); // Set success message
            const initialInputs = {};
            if (data && data.properties) {
                Object.keys(data.properties).forEach(key => {
                    initialInputs[key] = data.properties[key].default || '';
                });
            } else if (selectedActor.id === 'Mm5IqNZeGf4LmgjIP') {
                // Special handling for Mixcloud Audio Downloader if schema is not provided
                initialInputs.links = ''; // Initialize as empty string, will be parsed later
            }
            setMappedInputs(initialInputs);

        } catch (err) {
            setSchemaError('Failed to fetch schema: ' + err.message);
        } finally {
            setSchemaLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMappedInputs(prevInputs => {
            if (name === 'links') {
                // Split links by newline or comma and trim whitespace for Mixcloud actor
                const linksArray = value.split(/[,\n]/).map(link => link.trim()).filter(link => link !== '');
                return {
                    ...prevInputs,
                    [name]: linksArray,
                };
            }
            return {
                ...prevInputs,
                [name]: type === 'checkbox' ? checked : value
            };
        });
    };

    const pollRunStatus = async (currentRunId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/apify/run-status/${currentRunId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiKey })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get run status');
            }

            setExecutionResult(data);

            if (data.status === 'SUCCEEDED') {
                clearInterval(pollingIntervalRef.current);
                setExecutionLoading(false);
                setSuccessMessage('Actor run completed successfully!');
                fetchRunResults(currentRunId);
            } else if (data.status === 'FAILED' || data.status === 'ABORTED') {
                clearInterval(pollingIntervalRef.current);
                setExecutionLoading(false);
                setExecutionError(`Actor run ${data.status.toLowerCase()}. Message: ${data.statusMessage || 'N/A'}`);
            }
        } catch (err) {
            clearInterval(pollingIntervalRef.current);
            setExecutionLoading(false);
            setExecutionError('Error polling run status: ' + err.message);
        }
    };

    const fetchRunResults = async (currentRunId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/apify/run-results/${currentRunId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiKey })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get run results');
            }
            setExecutionResult(prev => ({ ...prev, finalResults: data }));
        } catch (err) {
            setExecutionError('Error fetching run results: ' + err.message);
        }
    };

    const handleExecuteActor = async () => {
        if (!selectedActor || !actorSchema) return;

        setExecutionLoading(true);
        clearMessages(); // Clear messages on new execution
        setExecutionResult(null);
        setRunId(null);
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        try {
            const response = await fetch(`http://localhost:3000/api/apify/run-actor/${selectedActor.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey,
                    input: mappedInputs
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to execute actor');
            }

            setRunId(data.runId);
            setExecutionResult({ status: 'STARTING', runId: data.runId });
            pollingIntervalRef.current = setInterval(() => pollRunStatus(data.runId), 3000);

        } catch (err) {
            setExecutionLoading(false);
            setExecutionError('Failed to execute actor: ' + err.message);
        }
    };

    const renderSchemaInputs = (schemaProperties) => {
        if (!schemaProperties) return null;

        return Object.keys(schemaProperties).map((key) => {
            const prop = schemaProperties[key];
            let inputElement = null;

            // Special handling for Mixcloud Audio Downloader 'links' input
            if (selectedActor.id === 'Mm5IqNZeGf4LmgjIP' && key === 'links') {
                inputElement = (
                    <textarea
                        name={key}
                        value={Array.isArray(mappedInputs[key]) ? mappedInputs[key].join('\n') : ''}
                        onChange={handleInputChange}
                        placeholder="Enter Mixcloud URLs, one per line or comma-separated"
                        rows="5"
                        className={styles.schemaInput} // Apply schemaInput class
                    ></textarea>
                );
            } else {
                switch (prop.type) {
                    case 'string':
                        inputElement = (
                            <input
                                type="text"
                                name={key}
                                value={mappedInputs[key] || ''}
                                onChange={handleInputChange}
                                placeholder={prop.description || key}
                                className={styles.schemaInput} // Apply schemaInput class
                            />
                        );
                        break;
                    case 'integer':
                    case 'number':
                        inputElement = (
                            <input
                                type="number"
                                name={key}
                                value={mappedInputs[key] || ''}
                                onChange={handleInputChange}
                                placeholder={prop.description || key}
                                className={styles.schemaInput} // Apply schemaInput class
                            />
                        );
                        break;
                    case 'boolean':
                        inputElement = (
                            <input
                                type="checkbox"
                                name={key}
                                checked={mappedInputs[key] || false}
                                onChange={handleInputChange}
                                className={styles.schemaInput} // Apply schemaInput class
                            />
                        );
                        break;
                    default:
                        inputElement = <p>Unsupported type: {prop.type}</p>;
                        break;
                }
            }

            return (
                <div key={key} className={styles.schemaField}>
                    <label className={styles.schemaLabel}>
                        {key} ({prop.type})
                        {prop.description && <span className={styles.schemaDescription}>: {prop.description}</span>}:
                        {inputElement}
                    </label>
                </div>
            );
        });
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Apify Integration</h1>

            {(error || schemaError || executionError) && <p className={`${styles.message} ${styles.error}`}>Error: {error || schemaError || executionError}</p>}
            {successMessage && <p className={`${styles.message} ${styles.success}`}>{successMessage}</p>}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>API Key Input</h2>
                <div className={styles.inputGroup}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Apify API Key"
                        className={styles.textInput}
                    />
                    <button
                        onClick={handleApiKeySubmit}
                        disabled={loading || apiKey.length === 0}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                        {loading ? 'Loading Actors...' : 'Load Actors'}
                    </button>
                </div>
            </section>

            {actors.length > 0 && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Available Actors</h2>
                    <ul className={styles.actorList}>
                        {actors.map((actor) => (
                            <li
                                key={actor.id}
                                onClick={() => handleActorSelect(actor)}
                                className={`${styles.actorItem} ${selectedActor && selectedActor.id === actor.id ? styles.selected : ''}`}
                            >
                                <h3 className={styles.actorName}>{actor.name}</h3>
                                <p className={styles.actorDescription}>{actor.description}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {selectedActor && (
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Selected Actor: {selectedActor.name}</h2>
                    <p className={styles.actorDescription}>{selectedActor.description}</p>
                    <button
                        onClick={fetchActorSchema}
                        disabled={schemaLoading}
                        className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                        {schemaLoading ? 'Loading Schema...' : 'Load Actor Schema'}
                    </button>

                    {actorSchema && (
                        <div className={styles.schemaInputGroup}>
                            <h3 className={styles.sectionTitle}>Actor Input</h3>
                            <div style={{ marginBottom: '15px' }}>
                                {renderSchemaInputs(actorSchema.properties)}
                            </div>
                            <button
                                onClick={handleExecuteActor}
                                disabled={executionLoading}
                                className={`${styles.button} ${styles.buttonWarning}`}
                            >
                                {executionLoading ? 'Executing...' : 'Execute Actor'}
                            </button>
                            {executionResult && (
                                <div className={styles.executionResult}>
                                    <h3 className={styles.resultTitle}>Execution Status: {executionResult.status}</h3>
                                    {executionResult.runId && <p className={styles.resultDetail}>Run ID: {executionResult.runId}</p>}
                                    {executionResult.finalResults && (
                                        <div>
                                            <h4 className={styles.resultTitle}>Final Results</h4>
                                            <pre className={styles.codeBlock}>{JSON.stringify(executionResult.finalResults, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default ApifyIntegration; 