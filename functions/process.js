const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // Replace with your actual front-end domain
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { input } = JSON.parse(event.body);
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        if (!input) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'No input provided.' })
            };
        }

        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY
        });

        const assistantId = 'asst_2vlvMDmmXDZb5ubcndDKNyCL'; // Your Assistant ID

        console.time('AssistantResponseTime');

        // Create a Thread
        const thread = await openai.beta.threads.create();
        console.log('Thread created:', thread.id);

        // Add the User's Message to the Thread
        const userMessage = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: input
        });
        console.log('User message added:', userMessage.id);

        // Run the Assistant on the Thread
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
        });
        console.log('Assistant run created:', run.id);

        // Wait for the run to complete
        // Poll the run status until it's finished
        let runStatus = run.status;
        while (runStatus !== 'succeeded' && runStatus !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            runStatus = updatedRun.status;
            console.log('Run status:', runStatus);
        }

        if (runStatus === 'failed') {
            console.error('Assistant run failed.');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Assistant failed to generate a response.' })
            };
        }

        // Retrieve Messages from the Thread
        const messages = await openai.beta.threads.messages.list(thread.id);
        console.log('Messages in thread:', messages.data.length);

        // Find the Assistant's Response
        const assistantMessages = messages.data.filter(message => message.role === 'assistant');
        if (assistantMessages.length === 0) {
            console.error('No assistant messages found.');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Assistant did not generate a response.' })
            };
        }

        const assistantResponse = assistantMessages[assistantMessages.length - 1].content;
        console.log('Assistant response:', assistantResponse);

        console.timeEnd('AssistantResponseTime');

        // Ensure assistantResponse is a string
        const assistantResponseContent = typeof assistantResponse === 'object' ? JSON.stringify(assistantResponse) : assistantResponse;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ output: assistantResponseContent })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Internal Server Error' })
        };
    }
};
