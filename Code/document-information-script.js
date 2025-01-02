const actualUrl = new URLSearchParams(window.location.search);
const fileName = urlParams.get('fileLink');
const actualFolder = urlParams.get('folder');

const environmentUrl = getEnvironmentUrl();
fetchData();

async function fetchData() {
  try {
    const data = await fetch(`${environmentUrl}/fetchRelevantDocumentData?folder=${actualFolder}&url=${fileName}`);
    const jsonData = await data.json();
    console.log(jsonData); // Log the fetched data for debugging

    if (actualFolder === 'scores') {
      populateScoreData(jsonData);
    } else if (actualFolder === 'programs') {
      populateProgramData(jsonData);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}




function populateProgramData(jsonData) {
  if (jsonData.data && jsonData.data.length > 0) {
    const programData = jsonData.data[0];
    const conductorData = jsonData.data[1];
    const orchestraData = jsonData.data[2];
    if (programData && programData.length > 0) {

      if (programData[0].season === null || programData[0].season === undefined || programData[0].season === 0) {
        document.getElementById('date').textContent = '';
      } else {
        document.getElementById('date').textContent = programData[0].season;
      }

      document.getElementById('location').textContent = programData[0].location;
      document.getElementById('program-title').textContent = programData[0].title;
      document.getElementById('orchestra').textContent = orchestraData[0].name;
      document.getElementById('interpreter').textContent = conductorData[0].name;
      document.getElementById('additional-info').textContent = programData[0].notes;
    }
  }
}

function populateScoreData(jsonData) {
  if (jsonData.data && jsonData.data.length > 0) {
    const interpretationData = jsonData.data[0];
    const scoreData = jsonData.data[1];
    const conductorData = jsonData.data[2];
    if (scoreData && scoreData.length > 0) {

      if (interpretationData[0].year === null || interpretationData[0].year === undefined || interpretationData[0].year === 0) {
        document.getElementById('date').textContent = '';
      } else {
        document.getElementById('date').textContent = interpretationData[0].year;
      }

      if (interpretationData[0].opusNumber === null || interpretationData[0].opusNumber === '') {
        document.getElementById('opus').textContent = 'Opus number not available';
      } else {
        document.getElementById('opus').textContent = interpretationData[0].opusNumber;
      }
      document.getElementById('publisher').textContent = interpretationData[0].publisher;
      document.getElementById('score-title').textContent = scoreData[0].title;
      document.getElementById('original-composer').textContent = scoreData[0].composer;
      document.getElementById('interpreter').textContent = conductorData[0].name;
      document.getElementById('additional-info').textContent = conductorData[0].name + "'s interpretation of " + scoreData[0].title + " by " + scoreData[0].composer;
    }
  }
}

function getEnvironmentUrl() {
  if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
    return "http://127.0.0.1:5001/api";
  } else {
    return "/api";
  }
}