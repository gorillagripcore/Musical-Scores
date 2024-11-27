document.getElementById('upload_button').addEventListener('click', function() {
    console.log('Search button clicked');  // Log to confirm button click
    uploadToDataBase();
});

async function uploadToDataBase(){

    var uploadData = {
        title: document.getElementById("title").value,
        composer: document.getElementById("composer").value,
        conductor: document.getElementById("conductor").value,
        interpreter: document.getElementById("interpreter").value,
        type: document.getElementById("type").value,
        year: document.getElementById("year").value,
        filelink: document.getElementById("filelink").value
    };
    
    console.log(JSON.stringify(uploadData));


    try {
    
        const response = await fetch('http://localhost:5001/uploadToDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Skriv ut resultatet i konsolen

    } catch (error) {
        console.error('Error when inserting data:', error);
    }


}