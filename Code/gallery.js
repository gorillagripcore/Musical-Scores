fetch("../Code/Temp-JSON/img.json")
  .then((response) => response.json())
  .then((data) => {
    const gallery = document.getElementById("gallery");

    data.forEach((item) => {
      const container = document.createElement("div");
      container.classList.add("image-container");

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt;

      const description = document.createElement("p");
      description.textContent = item.description;

      container.appendChild(img);
      container.appendChild(description);

      gallery.appendChild(container);
    });
  })
  .catch((error) => console.error("Error loading gallery:", error));
