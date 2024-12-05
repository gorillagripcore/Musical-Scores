// Fetch the JSON data
fetch('../Code/Temp-JSON/img.json')
    .then(response => response.json())
    .then(data => {
        const gallery = document.getElementById('gallery');

        data.forEach(item => {
            // Create the image element
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.description;

            // Create the description element
            const description = document.createElement('p');
            description.textContent = item.description;

            // Append the image and description to the gallery container
            gallery.appendChild(img);
            gallery.appendChild(description);
        });
    })
    .catch(error => console.error('Error loading gallery:', error));
