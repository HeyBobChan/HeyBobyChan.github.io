document.getElementById('processButton').addEventListener('click', () => {
    // Show loading indicator
    document.getElementById('loading').style.display = 'block';
    // Hide previous output
    document.getElementById('outputContainer').innerHTML = '';

    const text = document.getElementById('inputText').value.trim();
    if (!text) {
        alert('Please enter some text or upload a file.');
        document.getElementById('loading').style.display = 'none';
        return;
    }

    fetch('https://celadon-salmiakki-9c10f8.netlify.app/.netlify/functions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        document.getElementById('loading').style.display = 'none';
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            console.log('Data output:', data.output);
            // Sanitize the HTML content
            const sanitizedHTML = DOMPurify.sanitize(data.output);
            // Render the sanitized HTML
            document.getElementById('outputContainer').innerHTML = sanitizedHTML;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('loading').style.display = 'none';
        alert('An error occurred while processing your request.');
    });
});

document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function() {
            document.getElementById('inputText').value = reader.result;
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid .txt file.');
    }
});
