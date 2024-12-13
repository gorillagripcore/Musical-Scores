async function showUploadFields() {

    const uploadType = document.getElementById("upload_type").value;

    // dela upp kategorier enligt typ

    const typeMappings = {
        score: ["upload_score_fields", "upload_score_button"],
        program: ["upload_program_fields", "upload_program_button"],
        document: ["upload_document_fields", "upload_document_button"],
        image: ["upload_image_fields", "upload_image_button"]
    };

    // loopa igenom kategorier & ändra utseende av fields

    for(const [type, [fieldsID, buttonID]] of Object.entries(typeMappings)) {
        const fields = document.getElementById(fieldsID);
        const button = document.getElementById(buttonID);

        if(uploadType === type) {
            fields.style.display = "block";
            button.style.display = "block";
        } else {
            fields.style.display = "none";
            button.style.display = "none";
        }

    }
    
}


async function uploadScoreButton() {

    console.log('upload score button clicked');  // Log to confirm button click

    const uploadData = {
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
    
        const response = await fetch('https://13.61.87.232:5001/uploadToDatabase', {
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

    const uploadData = {
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
    
        const response = await fetch('https://13.61.87.232:5001/uploadToDatabase', {
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