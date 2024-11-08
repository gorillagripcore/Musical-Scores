//This is just mock code to get the filter page to look as it should. Put the actual code here later. 

// replace with real data fetching
const mockResults = [
    "Symphony No. 5 - Sixten Ehrling's Notes",
    "Piano Concerto No. 21 - Program from 1965",
    "Opera Rehearsal - Notes on 'The Magic Flute'",
    "Festival Program - Sixten Ehrling, 1978",
    "String Quartet Performance - 1980",
];

// search preview js 
const searchInput = document.querySelector('.search-bar input');
const searchPreview = document.getElementById('search-preview');

searchInput.addEventListener('input', function() {
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


document.addEventListener('click', function(event) {
    if (!searchInput.contains(event.target)) {
        searchPreview.style.display = 'none';
    }
});

async function fetchData() {
        try {
            const searchQuery = document.querySelector('.search-bar input').value;
            console.log("Searched for " + searchQuery);
            // Get-request till servern med query-parametern
            const response = await fetch(`http://localhost:5000/fetchData?myString=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            console.log(data); // Skriv ut resultatet i konsolen
            populateResultContainer(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

function populateResultContainer(data) {
    const resultContainer = document.querySelector('.result');
    resultContainer.innerHTML = '';
    data.forEach(result => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.classList.add('thumbnail');
        itemDiv.appendChild(thumbnailDiv);
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info');
        const p = document.createElement('p');
        p.textContent = result.name;
        infoDiv.appendChild(p);
        itemDiv.appendChild(infoDiv);
        resultContainer.appendChild(itemDiv);
    });
}

document.getElementById('search-button').addEventListener('click', function() {
    console.log('Search button clicked');  // Log to confirm button click
    fetchData();
});
