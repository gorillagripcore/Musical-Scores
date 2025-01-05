randomSuggestionsOnStartup();
const mockResults = [];
const searchInput = document.querySelector(".search-bar input");
populateConductors();

document.getElementById("search-button").addEventListener("click", function () {
  searchDatabase();
});

document.getElementById("clear-filters").addEventListener("click", function () {
  const timeDropdown = document.getElementById("time");
  const conductorDropdown = document.getElementById("conductor");
  const typeDropdown = document.getElementById("type");

  timeDropdown.selectedIndex = 0;
  conductorDropdown.selectedIndex = 0;
  typeDropdown.selectedIndex = 0;

  const filterContainer = document.getElementById("selected-filters");

  while (filterContainer.firstChild) {
    filterContainer.removeChild(filterContainer.firstChild);
  }

});

document.getElementById("time").addEventListener("change", function () {
  updateSelectedFilters("time");
});

document.getElementById("conductor").addEventListener("change", function () {
  updateSelectedFilters("conductor");
});

document.getElementById("type").addEventListener("change", function () {
  updateSelectedFilters("type");
});

searchInput.addEventListener("input", function () {
  const query = searchInput.value.toLowerCase().trim();

  if (query.length > 0) {
    const filteredResults = mockResults.filter((item) =>
      item.toLowerCase().includes(query)
    );

    if (filteredResults.length > 0) {
      filteredResults.forEach((result) => {
        const div = document.createElement("div");
        div.textContent = result;
      });
    }
  }
});

async function searchDatabase() {
  try {
    const searchQuery = document.querySelector(".search-bar input").value;
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(
      `${apiUrl}/searchDatabase?myString=${encodeURIComponent(searchQuery)}`
    );
    const data = await response.json();
    console.log(data);
    populateResultContainer(data);
  } catch (error) {
    console.error("Error searching data:", error);
  }
}

async function randomSuggestionsOnStartup() {
  try {
    const searchQuery = " ";
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(
      `${apiUrl}/searchDatabase?myString=${encodeURIComponent(searchQuery)}`
    );
    const data = await response.json();
    console.log(data);
    populateResultContainerOnStartup(data);
  } catch (error) {
    console.error("Error searching data:", error);
  }
}

function populateResultContainer(data) {
  const resultContainer = document.querySelector(".result");
  resultContainer.addEventListener("click", function (event) {
    navigateToCorrectPage(event);
  });

resultContainer.innerHTML = "";

data.forEach((result) => {
  if (result.type === "Interpretation") {
    populateInterpretation(result, resultContainer);
  } else if (result.type === "Program") {
    populateProgram(result, resultContainer);
  } else if (result.type === "Document") {
    populateDocument(result, resultContainer);
  }
});
}

function populateInterpretation(result, resultContainer) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");
  itemDiv.setAttribute("data-filelink", result.file_link);

  const thumbnailDiv = document.createElement("div");
  thumbnailDiv.classList.add("thumbnail");

  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = "../Design/img/note.png";
  thumbnailDiv.appendChild(thumbnailImg);
  itemDiv.appendChild(thumbnailDiv);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info");

  const scoreTypeP = document.createElement("p");
  scoreTypeP.textContent = `Type: ${result.type}`;
  infoDiv.appendChild(scoreTypeP);

  const scoreTitleP = document.createElement("p");
  scoreTitleP.textContent = `Title: ${result.score_title}`;
  infoDiv.appendChild(scoreTitleP);

  const scoreComposerP = document.createElement("p");
  scoreComposerP.textContent = `Composer: ${result.score_composer}`;
  infoDiv.appendChild(scoreComposerP);

  const scoreConductorP = document.createElement("p");
  scoreConductorP.textContent = `Conductor: ${result.conductor_name}`;
  infoDiv.appendChild(scoreConductorP);

  itemDiv.appendChild(infoDiv);
  resultContainer.appendChild(itemDiv);
}

function populateProgram(result, resultContainer) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");
  itemDiv.setAttribute("data-filelink", result.file_link);

  const thumbnailDiv = document.createElement("div");
  thumbnailDiv.classList.add("thumbnail");

  const thumbnailImg = document.createElement("img");
  thumbnailImg.src = "../Design/img/Program.png";
  thumbnailDiv.appendChild(thumbnailImg);
  itemDiv.appendChild(thumbnailDiv);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info");

  const programTypeP = document.createElement("p");
  programTypeP.textContent = `Type: ${result.type}`;
  infoDiv.appendChild(programTypeP);

  const programTitleP = document.createElement("p");
  programTitleP.textContent = `Title: ${result.program_title}`;
  infoDiv.appendChild(programTitleP);

  const programSeasonP = document.createElement("p");
  programSeasonP.textContent = `Season: ${result.season}`;
  infoDiv.appendChild(programSeasonP);

  const programConductorP = document.createElement("p");
  programConductorP.textContent = `Conductor: ${result.conductor_name}`;
  infoDiv.appendChild(programConductorP);

  const programLocationP = document.createElement("p");
  programLocationP.textContent = `Location: ${result.location}`;
  infoDiv.appendChild(programLocationP);

  const programOrchestraP = document.createElement("p");
  programOrchestraP.textContent = `Orchestra: ${result.orchestra}`;
  infoDiv.appendChild(programOrchestraP);

  const programSoloistsP = document.createElement("p");
  programSoloistsP.textContent = `Soloists: ${result.soloists}`;
  infoDiv.appendChild(programSoloistsP);

  const programFileLink = document.createElement("p");
  programFileLink.textContent = `File Link: ${result.file_link}`;

  itemDiv.appendChild(infoDiv);
  resultContainer.appendChild(itemDiv);
}

function populateDocument(result, resultContainer) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");
  itemDiv.setAttribute("data-filelink", result.file_link);

  const thumbnailDiv = document.createElement("div");
  thumbnailDiv.classList.add("thumbnail");

  const thumbnailImg = document.createElement("img");

  thumbnailImg.src = "../Design/img/Document.png";
  thumbnailDiv.appendChild(thumbnailImg);
  itemDiv.appendChild(thumbnailDiv);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info");

  const programTypeP = document.createElement("p");
  programTypeP.textContent = `Type: ${result.type}`;
  infoDiv.appendChild(programTypeP);

  const programTitleP = document.createElement("p");
  programTitleP.textContent = `Title: ${result.program_title}`;
  infoDiv.appendChild(programTitleP);

  const programSeasonP = document.createElement("p");
  programSeasonP.textContent = `Season: ${result.season}`;
  infoDiv.appendChild(programSeasonP);

  const programConductorP = document.createElement("p");
  programConductorP.textContent = `Conductor: ${result.conductor_name}`;
  infoDiv.appendChild(programConductorP);

  const programLocationP = document.createElement("p");
  programLocationP.textContent = `Location: ${result.location}`;
  infoDiv.appendChild(programLocationP);

  const programOrchestraP = document.createElement("p");
  programOrchestraP.textContent = `Orchestra: ${result.orchestra}`;
  infoDiv.appendChild(programOrchestraP);

  const programSoloistsP = document.createElement("p");
  programSoloistsP.textContent = `Soloists: ${result.soloists}`;
  infoDiv.appendChild(programSoloistsP);

  const programFileLink = document.createElement("p");
  programFileLink.textContent = `File Link: ${result.file_link}`;

  itemDiv.appendChild(infoDiv);
  resultContainer.appendChild(itemDiv);
}

function populateResultContainerOnStartup(data) {
  const resultContainer = document.querySelector(".result");
  resultContainer.innerHTML = "";

  const randomResults = data.sort(() => 0.5 - Math.random()).slice(0, 3);

  randomResults.forEach((result) => {
    if (result.type === "Interpretation") {
      populateInterpretation(result, resultContainer);
    } else if (result.type === "Program") {
      populateProgram(result, resultContainer);
    } else if (result.type === "Document") {
      populateDocument(result, resultContainer);
    }
  });
  resultContainer.addEventListener("click", function (event) {
    navigateToCorrectPage(event);
  });
}

function navigateToCorrectPage(event) {
if (event.target.closest(".item")) {
    const fileLink = event.target.closest(".item").getAttribute("data-filelink");

    if (!fileLink) {
      console.error("File link not found for the clicked image.");
      return;
    }

    const itemElement = event.target.closest(".item");
    if (!itemElement) {
      console.error("Item element not found.");
      return;
    }

    const itemTypeElement = itemElement.querySelector(".info p");
    if (!itemTypeElement) {
      console.error("Item type not found.");
      return;
    }

    const itemType = itemTypeElement.textContent.split(": ")[1];
    if (!itemType) {
      console.error("Unable to determine item type.");
      return;
    }

    let folder = "";
    switch (itemType) {
      case "Program":
      folder = "programs";
      window.open(`program-page.html?folder=${folder}&fileLink=${encodeURIComponent(fileLink)}`, '_blank');
      break;
      case "Interpretation":
      folder = "scores";
      window.open(`score-page.html?folder=${folder}&fileLink=${encodeURIComponent(fileLink)}`, '_blank');
      break;
      case "Document":
      folder = "documents";
      window.open(`document-page.html?folder=${folder}&fileLink=${encodeURIComponent(fileLink)}`, '_blank');
      break;
      default:
      console.error("Unknown item type:", itemType);
      return;
    }
  }
}

async function getConductors(){
  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(
      `${apiUrl}/getConductors`,
      {
        method: "GET"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    return results;

  } catch (error) {
    console.error("Error when fetching conductors:", error);
  }
}

async function populateConductors(){

  try {

    const conductors = await getConductors();
    const conductorDropdown = document.getElementById('conductor');
  
    conductors.forEach(conductor => {
      const option = document.createElement('option');
      option.value = conductor.name;
      option.textContent = conductor.name;
      conductorDropdown.appendChild(option);
    });

  } catch (error) {
    console.error("Error when populating conductors:", error);
  }

}

function updateSelectedFilters(filterType){

  const selectedTime = document.getElementById('time').value;
  const selectedConductor = document.getElementById('conductor').value;
  const selectedType = document.getElementById('type').value;
  const filterContainer = document.getElementById('selected-filters');

  if(filterType === 'time'){
    const existingTag = filterContainer.querySelector(`.filter-tag[data-value="${selectedTime}"]`);
    if (existingTag) {
      document.getElementById('time').selectedIndex = 0;
      return;
    }
    const timeTag = createTag(selectedTime, selectedTime);
    filterContainer.appendChild(timeTag);
    document.getElementById('time').selectedIndex = 0;
  } else if(filterType === 'conductor'){
    const existingTag = filterContainer.querySelector(`.filter-tag[data-value="${selectedConductor}"]`);
    if (existingTag) {
      document.getElementById('conductor').selectedIndex = 0;
      return;
    }
    const conductorTag = createTag(selectedConductor, selectedConductor);
    filterContainer.appendChild(conductorTag);
    document.getElementById('conductor').selectedIndex = 0;
  } else if(filterType === 'type'){
    const existingTag = filterContainer.querySelector(`.filter-tag[data-value="${selectedType}"]`);
    if (existingTag) {
      document.getElementById('type').selectedIndex = 0;
      return;
    }
    const typeTag = createTag(selectedType, selectedType);
    filterContainer.appendChild(typeTag);
    document.getElementById('type').selectedIndex = 0;
  }

  if(filterContainer.children.length > 0){
    filterContainer.style.display = 'block';
  } else {
    filterContainer.style.display = 'none';
  }

}

function createTag(label, value){
  const tag = document.createElement('div');
  tag.classList.add('filter-tag');
  tag.dataset.value = value;
  tag.innerHTML = `${label}<span class="remove-tag">x</span>`;
  
  const removeSpan = tag.querySelector('.remove-tag');
  removeSpan.addEventListener('click', function() {
    removeTag(value);
  });

  return tag;
}

function removeTag(value){
  const tagToRemove = document.querySelector(`.filter-tag[data-value="${value}"]`);
  tagToRemove.remove();
}

function getEnvironmentUrl() {
  if (
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
  ) {
    return "http://127.0.0.1:5001/api";
  } else {
    return "/api";
  }
}
