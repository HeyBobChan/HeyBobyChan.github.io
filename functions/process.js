const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
    try {
        const { input } = JSON.parse(event.body);
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        const openai = new OpenAI({
            apiKey: OPENAI_API_KEY
        });

        const assistantId = 'asst_2vlvMDmmXDZb5ubcndDKNyCL'; // Your Assistant ID

        // Create a Thread
        const thread = await openai.beta.threads.create();

        // Add the User's Message to the Thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: input
        });

        // Run the Assistant on the Thread
        await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
        });

        // Retrieve Messages from the Thread
        const messages = await openai.beta.threads.messages.list(thread.id);

        // Find the Assistant's Response
        const assistantMessages = messages.data.filter(message => message.role === 'assistant');
        const assistantResponse = assistantMessages[assistantMessages.length - 1]?.content || "No response";

        return {
            statusCode: 200,
            body: JSON.stringify({ output: assistantResponse })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
