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