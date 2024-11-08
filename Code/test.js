document.getElementById('search-button').addEventListener('click', async () => {
    try {
        const searchQuery = document.querySelector('.search-bar input').value;
        console.log("Searched for " + searchQuery);
        
        // Get-request till servern med query-parametern
        const response = await fetch(`http://localhost:5000/fetchData?myString=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        console.log(data); // Skriv ut datan i konsolen

        // Hämta result-diven
        const resultContainer = document.querySelector('.result');

        // Töm resultatbehållaren innan du lägger till nya resultat
        resultContainer.innerHTML = '';

        // Loop igenom data och skapa ett nytt 'item' för varje resultat
        data.forEach(result => {
            // Skapa huvud 'item'-div
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            // Skapa 'thumbnail'-div och lägg till den i 'item'
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.classList.add('thumbnail');
            itemDiv.appendChild(thumbnailDiv);

            // Skapa 'info'-div och lägg till text
            const infoDiv = document.createElement('div');
            infoDiv.classList.add('info');
            
            // Lägg till text till 'info'-diven
            const p = document.createElement('p');
            p.textContent = result.name;  // Lägg in texten från resultatet
            infoDiv.appendChild(p);

            // Lägg 'info' i 'item'
            itemDiv.appendChild(infoDiv);

            // Lägg till 'item' i resultatbehållaren
            resultContainer.appendChild(itemDiv);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});