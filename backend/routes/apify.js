const express = require('express');
const { ApifyClient } = require('apify-client');

console.log('apify.js: Router file loaded'); // Add this line

const router = express.Router();

// Helper to get ApifyClient instance
const getApifyClient = (apiKey) => {
    if (!apiKey) {
        throw new Error('Apify API key is missing.');
    }
    return new ApifyClient({
        token: apiKey,
    });
};

// Route to list actors
router.post('/actors', async (req, res) => {
    const { apiKey } = req.body;
    try {
        const apifyClient = getApifyClient(apiKey);
        const actors = await apifyClient.actors().list();
        res.json(actors.items.map(actor => ({
            id: actor.id,
            name: actor.name,
            description: actor.description,
        })));
    } catch (error) {
        console.error('Error listing actors:', error);
        res.status(500).json({ message: 'Failed to list actors', error: error.message });
    }
});

// Route to fetch actor schema
router.post('/actor-schema/:actorId', async (req, res) => {
    const { actorId } = req.params;
    const { apiKey } = req.body;
    try {
        const apifyClient = getApifyClient(apiKey);
        const actor = await apifyClient.actor(actorId).get();
        console.log('apify.js: Full actor object:', actor); // Added for debugging
        if (!actor) {
            return res.status(404).json({ message: 'Actor not found' });
        }

        let inputSchema = actor.inputSchema;

        // If inputSchema is undefined, try to derive it from exampleRunInput
        if (!inputSchema && actor.exampleRunInput && actor.exampleRunInput.body) {
            try {
                // Attempt to parse the exampleRunInput.body as JSON
                const parsedExampleInput = JSON.parse(actor.exampleRunInput.body);
                // Create a basic schema structure from the parsed example input
                inputSchema = {
                    type: 'object',
                    properties: {},
                };
                for (const key in parsedExampleInput) {
                    if (Object.hasOwnProperty.call(parsedExampleInput, key)) {
                        const value = parsedExampleInput[key];
                        // Infer type based on JavaScript type, with special handling for 'helloWorld'
                        let inferredType;
                        if (key === 'helloWorld') {
                            inferredType = 'string'; // Force 'helloWorld' to be string
                        } else if (Array.isArray(value)) {
                            inferredType = 'array';
                        } else if (typeof value === 'boolean') {
                            inferredType = 'boolean';
                        } else if (typeof value === 'number') {
                            inferredType = 'number';
                        } else {
                            inferredType = 'string';
                        }
                        inputSchema.properties[key] = { type: inferredType };
                    }
                }
            } catch (parseError) {
                console.error('Error parsing exampleRunInput.body:', parseError);
                // Fallback to empty schema if parsing fails
                inputSchema = {};
            }
        }

        res.json(inputSchema || {});
    } catch (error) {
        console.error(`Error fetching schema for actor ${actorId}:`, error);
        res.status(500).json({ message: `Failed to fetch schema for actor ${actorId}`, error: error.message });
    }
});

// Route to run an actor
router.post('/run-actor/:actorId', async (req, res) => {
    const { actorId } = req.params;
    const { apiKey, input } = req.body;
    try {
        const apifyClient = getApifyClient(apiKey);
        const run = await apifyClient.actor(actorId).call(input, {
            contentType: 'application/json',
        });
        res.json({ runId: run.id, status: run.status });
    } catch (error) {
        console.error(`Error running actor ${actorId}:`, error);
        res.status(500).json({ message: `Failed to run actor ${actorId}`, error: error.message });
    }
});

// Route to get actor run status
router.post('/run-status/:runId', async (req, res) => {
    const { runId } = req.params;
    const { apiKey } = req.body;
    try {
        const apifyClient = getApifyClient(apiKey);
        const run = await apifyClient.run(runId).get();
        if (!run) {
            return res.status(404).json({ message: 'Run not found' });
        }
        res.json({ id: run.id, status: run.status, statusMessage: run.statusMessage });
    } catch (error) {
        console.error(`Error fetching run status for ${runId}:`, error);
        res.status(500).json({ message: `Failed to fetch run status for ${runId}`, error: error.message });
    }
});

// Route to get actor run results
router.post('/run-results/:runId', async (req, res) => {
    const { runId } = req.params;
    const { apiKey } = req.body;
    try {
        const apifyClient = getApifyClient(apiKey);
        const dataset = await apifyClient.run(runId).dataset();
        const { items } = await dataset.listItems();
        res.json(items);
    } catch (error) {
        console.error(`Error fetching run results for ${runId}:`, error);
        res.status(500).json({ message: `Failed to fetch run results for ${runId}`, error: error.message });
    }
});

module.exports = router; 