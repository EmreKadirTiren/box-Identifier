document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/sharebox-auth.html';
        return;
    }
});

document.getElementById('shareBoxForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const boxId = document.getElementById('boxId').value;
    const boxPassword = document.getElementById('boxPassword').value;

    console.log('Sending request with', { boxId, boxPassword });

    try {
        const response = await fetch('/share-box-unauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boxId, boxPassword })
        });

        console.log('Received response:', response);

        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);

            if (data.token) {
                const shareLink = `http://${window.location.host}/validate-sharebox-unauth?token=${data.token}`;
                document.getElementById('result').innerHTML = `<p>Share Link: <a href="${shareLink}" target="_blank">${shareLink}</a></p>`;
            } else {
                document.getElementById('result').innerHTML = `<p>Error: ${data.message}</p>`;
            }
        } else {
            const errorData = await response.json();
            document.getElementById('result').innerHTML = `<p>Error: ${errorData.message}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
    }
});