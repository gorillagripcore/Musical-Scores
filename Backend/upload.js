/* document.getElementById('upload_score_button').addEventListener('click', function() {
    console.log('Search button clicked');  // Log to confirm button click
    uploadToDataBase();
}); */

/*async function uploadToDataBase(){

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


}*/

async function showUploadFields() {

    var uploadType = document.getElementById("upload_type").value;
    var scoreFields = document.getElementById("upload_score_fields");
    var programFields = document.getElementById("upload_program_fields");
    var uploadScoreButton = document.getElementById("upload_score_button");
    var uploadProgramButton = document.getElementById("upload_program_button");

    if (uploadType === "score") {
        scoreFields.style.display = "block";
        uploadScoreButton.style.display = "block";
        programFields.style.display = "none";
        uploadProgramButton.style.display = "none";
    } else if(uploadType === "program") {
        programFields.style.display = "block";
        scoreFields.style.display = "none";
        uploadProgramButton.style.display = "block";
        uploadScoreButton.style.display = "none";
    }
    
}


async function uploadScoreButton() {

    console.log('upload score button clicked');  // Log to confirm button click

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

async function uploadProgramButton() {

    console.log('upload program button clicked');  // Log to confirm button click

    var uploadData = {
        title: document.getElementById("title").value,
        location: document.getElementById("location").value,
        date: document.getElementById("date").value,
        notes: document.getElementById("notes").value,
        filelink: document.getElementById("filelink").value,
        conductor: document.getElementById("conductor").value,
        orchestra: document.getElementById("orchestra").value,
        soloist: document.getElementById("soloist").value
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