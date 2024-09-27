const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    try {
        const { input } = JSON.parse(event.body);
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'asst_2vlvMDmmXDZb5ubcndDKNyCL' },
                    { role: 'user', content: input }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: data.error.message })
            };
        }

        const assistantResponse = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ output: assistantResponse })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
