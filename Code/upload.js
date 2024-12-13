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

    const programData = {
        title: document.getElementById("programTitle").value,
        location: document.getElementById("programLocation").value,
        season: document.getElementById("programSeason").value,
        notes: document.getElementById("programNotes").value,
        filelink: document.getElementById("programFilelink").value,
        conductor: document.getElementById("programConductor").value,
        orchestra: document.getElementById("programOrchestra").value,
        soloist: document.getElementById("programSoloist").value // läggs in i array med , som separator
    };
    
    console.log(JSON.stringify(programData));

    try {
    
        const response = await fetch('https://13.61.87.232:5001/uploadProgram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(programData)
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

async function uploadDocumentButton() {

    console.log('upload document button clicked');  // Log to confirm button click

    const documentData = {
        title: document.getElementById("documentTitle").value,
        notes: document.getElementById("documentNotes").value,
        year: document.getElementById("documentYear").value,
        filelink: document.getElementById("documentFilelink").value
    };
    
    console.log(JSON.stringify(documentData));

    try {
    
        const response = await fetch('https://13.61.87.232:5001/uploadDocument', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(documentData)
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

async function uploadImageButton() {

    console.log('upload image button clicked');  // Log to confirm button click

    const imageData = {
        description: document.getElementById("imageDescription").value,
        filelink: document.getElementById("imageFilelink").value
    };
    
    console.log(JSON.stringify(imageData));

    try {
    
        const response = await fetch('https://13.61.87.232:5001/uploadImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(imageData)
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