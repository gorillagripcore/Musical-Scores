  searchDatabase();

  async function searchDatabase() {
    try {
      const cachedData = localStorage.getItem('galleryData');
      if (cachedData) {
        populateGallery(JSON.parse(cachedData));
        return;
      }

      const apiUrl = getEnvironmentUrl();
      const response = await fetch(`${apiUrl}/fetchImagesFromS3`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      localStorage.setItem('galleryData', JSON.stringify(data.images || []));
      populateGallery(data.images || []); 
    } catch (error) {
      console.error('Error fetching data:', error);
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = `<p>Error loading gallery. Please try again later.</p>`;
    }
  }

  async function populateGallery(data) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; 

    data.forEach(async (url) => {
      const container = document.createElement("div");
      container.classList.add("image-container");

      const img = document.createElement("img");
      img.src = url;  
      img.alt = "Image from S3"; 
      
      const descriptionUrl = getEnvironmentUrl();

      const description = document.createElement("p");
      try {
        const response = await fetch(`${descriptionUrl}/fetchImageDescription?url=${url}`);
        const result = await response.json();
        description.textContent = result.description; 
    } catch (error) {
        console.error('Error fetching image description:', error);
        description.textContent = "Description not available";
    }
      container.appendChild(img);
      container.appendChild(description);

      gallery.appendChild(container);
    });
  }

  function getEnvironmentUrl(){
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      return 'http://127.0.0.1:5001/api' 
    } else {
      return '/api'
    }
  }