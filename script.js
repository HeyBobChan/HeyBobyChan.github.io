document.getElementById('processButton').addEventListener('click', () => {
    const text = document.getElementById('inputText').value.trim();
    if (!text) {
        alert('Please enter some text or upload a file.');
        return;
    }

    fetch('/.netlify/functions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: text })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            document.getElementById('outputContainer').innerHTML = data.output;
        }
    })
    .catch(error => {
        console.error('Error:', error);
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
