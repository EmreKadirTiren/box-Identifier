// document.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         window.location.href = '/sharebox-auth.html';
//         return;
//     }
// });

document.getElementById('shareBoxForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const boxId = document.getElementById('boxId').value;
    const boxPassword = document.getElementById('boxPassword').value;

    try {
        const response = await fetch('/share-box-unauth-to-unauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boxId, boxPassword })
        });

        if (response.ok) {
            const data = await response.json();
            const shareLink = `http://${window.location.host}/validate-sharebox-unauth?token=${data.token}`;
            document.getElementById('result').innerHTML = `<p>Share Link: <a href="${shareLink}" target="_blank">${shareLink}</a></p>`;
        } else {
            const error = await response.text();
            document.getElementById('result').innerHTML = `<p style="color: red;">Error: ${error}</p>`;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});