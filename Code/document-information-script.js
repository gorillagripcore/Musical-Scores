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
    const soloistData = jsonData.data[3];
    if (programData && programData.length > 0) {
      document.getElementById('program-title').textContent = programData[0].title;

      if (programData[0].season === null || programData[0].season === undefined || programData[0].season === 0) {
        document.getElementById('date').textContent = '';
      } else {
        document.getElementById('date').textContent = programData[0].season;
      }

      if (programData[0].location === null || programData[0].location === undefined || programData[0].location === '') {
        document.getElementById('location').textContent = 'No specified location';
      } else {
        document.getElementById('location').textContent = programData[0].location;
      }
      
      if (orchestraData[0].name === null || orchestraData[0].name === undefined || orchestraData[0].name === '') {
        document.getElementById('orchestra').textContent = 'No specified orchestra';
      } else {
        document.getElementById('orchestra').textContent = orchestraData[0].name;
      }

      if (conductorData[0].name === null || conductorData[0].name === undefined || conductorData[0].name === '') {
        document.getElementById('interpreter').textContent = 'No specified conductor';
      } else {
        document.getElementById('interpreter').textContent = conductorData[0].name;
      }

      if (programData[0].notes === null || programData[0].notes === undefined || programData[0].notes === '') {
        document.getElementById('additional-info').textContent = 'No additional information available';
      } else {
      document.getElementById('additional-info').textContent = programData[0].notes;
      }
      
      if (soloistData[0].name === undefined || soloistData[0].name === null || soloistData[0].name === '') {
        document.getElementById('soloist').textContent = 'No specified soloist';
      } else {
        document.getElementById('soloist').textContent = soloistData.map(soloist => soloist.name).join(', ');
      }
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

      if (interpretationData[0].publisher === null || interpretationData[0].publisher === undefined || interpretationData[0].publisher === '') {
        document.getElementById('publisher').textContent = 'No specified publisher';
      } else {
        document.getElementById('publisher').textContent = interpretationData[0].publisher;
      }
      document.getElementById('score-title').textContent = scoreData[0].title;
      document.getElementById('original-composer').textContent = scoreData[0].composer;
      document.getElementById('interpreter').textContent = conductorData[0].name;

      if (interpretationData[0].notes === null || interpretationData[0].notes === undefined || interpretationData[0].notes === '') {
        document.getElementById('additional-info').textContent = 'No additional information';
      } else {
        document.getElementById('additional-info').textContent = (conductorData[0].name + "'s interpretation of " + scoreData[0].title + " by " + scoreData[0].composer).trim();
      }

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