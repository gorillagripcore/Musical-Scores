//This is just mock code to get the filter page to look as it should. Put the actual code here later. 

//import { searchDatabase } from "../Backend/database.mjs";

// replace with real data fetching
const mockResults = [
    "Symphony No. 5 - Sixten Ehrling's Notes",
    "Piano Concerto No. 21 - Program from 1965",
    "Opera Rehearsal - Notes on 'The Magic Flute'",
    "Festival Program - Sixten Ehrling, 1978",
    "String Quartet Performance - 1980",
    "Mattias Malm",
    "Frida Malm",
    "Noa Malm",
    "Daniel Hansson",
    "Careless Whisper",
    "Jonnie",
    "Sixten Ehrling",
];

// search preview js 
const searchInput = document.querySelector('.search-bar input');
const searchPreview = document.getElementById('search-preview');

document.addEventListener('click', function (event) {
    if (!searchInput.contains(event.target)) {
        searchPreview.style.display = 'none';
    }
});

document.getElementById('search-button').addEventListener('click', function () {
    console.log('Search button clicked');  // Log to confirm button click
    //fetchData();
    searchDatabase();
});

searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase().trim();


    searchPreview.innerHTML = '';

    if (query.length > 0) {

        const filteredResults = mockResults.filter(item => item.toLowerCase().includes(query));


        if (filteredResults.length > 0) {
            filteredResults.forEach(result => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.textContent = result;
                searchPreview.appendChild(div);
            });
            searchPreview.style.display = 'block';
        } else {
            searchPreview.style.display = 'none';
        }
    } else {
        searchPreview.style.display = 'none';
    }
});

async function fetchData() {
    try {
        const searchQuery = document.querySelector('.search-bar input').value;
        // Get-request till servern med query-parametern
        const response = await fetch(`http://localhost:5001/fetchData?myString=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        console.log(data); // Skriv ut resultatet i konsolen
        populateResultContainer(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function searchDatabase() {
    try {
        const searchQuery = document.querySelector('.search-bar input').value;
        // Get-request till servern med query-parametern
        const response = await fetch(`http://localhost:5001/searchDatabase?myString=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        console.log(data); // Skriv ut resultatet i konsolen
        populateResultContainer(data);
    } catch (error) {
        console.error('Error searching data:', error);
    }
}

function populateResultContainer(data) {
    const resultContainer = document.querySelector('.result');
    resultContainer.innerHTML = '';

    data.forEach(result => {
        if(result.type === 'Interpretation') {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = '../Design/img/Conductors/Sixten_test.jpg'; //When debugging, change to '/img/Conductors/Sixten_test.jpg' and move file to filter.js to design folder
            thumbnailDiv.appendChild(thumbnailImg);
            itemDiv.appendChild(thumbnailDiv);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');

            const scoreTypeP = document.createElement('p');
            scoreTypeP.textContent = `Type: ${result.type}`;
            infoDiv.appendChild(scoreTypeP);

            const scoreTitleP = document.createElement('p');
            scoreTitleP.textContent = `Title: ${result.score_title}`;
            infoDiv.appendChild(scoreTitleP);

            const scoreComposerP = document.createElement('p');
            scoreComposerP.textContent = `Composer: ${result.score_composer}`;
            infoDiv.appendChild(scoreComposerP);

            const scoreConductorP = document.createElement('p');
            scoreConductorP.textContent = `Conductor: ${result.conductor_name}`;
            infoDiv.appendChild(scoreConductorP);

            itemDiv.appendChild(infoDiv);
            resultContainer.appendChild(itemDiv);
        } else if(result.type === 'Program') {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = '../Design/img/Conductors/Sixten_test.jpg'; //When debugging, change to '/img/Conductors/Sixten_test.jpg' and move file to filter.js to design folder
            thumbnailDiv.appendChild(thumbnailImg);
            itemDiv.appendChild(thumbnailDiv);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');

            const programTypeP = document.createElement('p');
            programTypeP.textContent = `Type: ${result.type}`;
            infoDiv.appendChild(programTypeP);

            const programTitleP = document.createElement('p');
            programTitleP.textContent = `Title: ${result.program_title}`;
            infoDiv.appendChild(programTitleP);

            const programSeasonP = document.createElement('p');
            programSeasonP.textContent = `Season: ${result.season}`;
            infoDiv.appendChild(programSeasonP);

            const programConductorP = document.createElement('p');
            programConductorP.textContent = `Conductor: ${result.conductor_name}`;
            infoDiv.appendChild(programConductorP);

            const programLocationP = document.createElement('p');
            programLocationP.textContent = `Location: ${result.location}`;
            infoDiv.appendChild(programLocationP);

            const programOrchestraP = document.createElement('p');
            programOrchestraP.textContent = `Orchestra: ${result.orchestra}`;
            infoDiv.appendChild(programOrchestraP);

            const programSoloistsP = document.createElement('p');
            programSoloistsP.textContent = `Soloists: ${result.soloists}`;
            infoDiv.appendChild(programSoloistsP);

            itemDiv.appendChild(infoDiv);
            resultContainer.appendChild(itemDiv);
        } else if(result.type === 'Document') {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');

            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = '../Design/img/Conductors/Sixten_test.jpg'; //When debugging, change to '/img/Conductors/Sixten_test.jpg' and move file to filter.js to design folder
            thumbnailDiv.appendChild(thumbnailImg);
            itemDiv.appendChild(thumbnailDiv);

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');

            const documentTypeP = document.createElement('p');
            documentTypeP.textContent = `Type: ${result.type}`;
            infoDiv.appendChild(documentTypeP);

            const documentTitleP = document.createElement('p');
            documentTitleP.textContent = `Title: ${result.document_title}`;
            infoDiv.appendChild(documentTitleP);

            const documentYearP = document.createElement('p');
            documentYearP.textContent = `Year: ${result.document_year}`;
            infoDiv.appendChild(documentYearP);

            itemDiv.appendChild(infoDiv);
            resultContainer.appendChild(itemDiv);
        }
    });
}

