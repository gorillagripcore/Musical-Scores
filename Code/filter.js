const mockResults = [];

const searchInput = document.querySelector(".search-bar input");
randomSuggestionsOnStartup();

document.getElementById("search-button").addEventListener("click", function () {
  searchDatabase();
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
      window.location.href = `program-page.html?folder=${folder}&fileLink=${encodeURIComponent(
        fileLink
      )}`;
      break;
    case "Interpretation":
      folder = "scores";
      window.location.href = `score-page.html?folder=${folder}&fileLink=${encodeURIComponent(
        fileLink
      )}`;
      break;
    case "Document":
      folder = "documents";
      window.location.href = `document-page.html?folder=${folder}&fileLink=${encodeURIComponent(
        fileLink
      )}`;
      break;
    default:
      console.error("Unknown item type:", itemType);
      return;
  }
}

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
  if (event.target.tagName === "IMG") {
    const fileLink = event.target.getAttribute("data-filelink");

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
        window.location.href = `program-page.html?folder=${folder}&fileLink=${encodeURIComponent(
          fileLink
        )}`;
        break;
      case "Interpretation":
        folder = "scores";
        window.location.href = `score-page.html?folder=${folder}&fileLink=${encodeURIComponent(
          fileLink
        )}`;
        break;
      case "Document":
        folder = "documents";
        window.location.href = `document-page.html?folder=${folder}&fileLink=${encodeURIComponent(
          fileLink
        )}`;
        break;
      default:
        console.error("Unknown item type:", itemType);
        return;
    }
  }
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
