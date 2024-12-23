let loginState = false;

function pageCheck() {
    const blur = document.querySelector(".blur");
    const popup = document.querySelector(".popup");
    blur.style.display = "block";
    popup.style.display = "block";
}

document.getElementById("check").addEventListener("click", e => {
    e.preventDefault();
    const textBox = document.getElementById("pwd");
    const blur = document.querySelector(".blur");
    const popup = document.querySelector(".popup");
    if (textBox.value == "123") {
        blur.style.display = "none";
        popup.style.display = "none";

        const uploadType = document.getElementById("upload_type");
        uploadType.disabled = false;
        loginState = true;
    }
    else {
        alert("Wrong password");
    }
})

document.addEventListener("DOMContentLoaded", () => {
  const uploadTypeElement = document.getElementById("upload_type");
  uploadTypeElement.addEventListener("change", showUploadFields);
});

async function showUploadFields() {

    if (!loginState) {
        alert("You need to enter the password")
        return
    }

    const uploadType = document.getElementById("upload_type").value;
    const typeMappings = {
    score: ["upload_score_fields", "upload_score_button"],
    program: ["upload_program_fields", "upload_program_button"],
    document: ["upload_document_fields", "upload_document_button"],
    image: ["upload_image_fields", "upload_image_button"],
  };

  for (const [type, [fieldsID, buttonID]] of Object.entries(typeMappings)) {
    const fields = document.getElementById(fieldsID);
    const button = document.getElementById(buttonID);

    if (uploadType === type) {
      fields.style.display = "block";
      button.style.display = "block";
    } else {
      fields.style.display = "none";
      button.style.display = "none";
    }
  }
}

async function uploadScoreButton() {
  console.log("upload score button clicked");

  const fileInput = document.getElementById("scoreFile");
  const file = fileInput.files[0];

  const interpretationData = {
    title: document.getElementById("scoreTitle").value,
    composer: document.getElementById("scoreComposer").value,
    conductor: document.getElementById("interpretationConductor").value,
    interpreter: document.getElementById("interpretationInterpreter").value,
    opusNumber: document.getElementById("interpretationOpusNumber").value,
    year: document.getElementById("interpretationYear").value,
    filelink: file.name,
  };

  console.log(JSON.stringify(interpretationData));
  await uploadToS3(fileInput);

  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(`${apiUrl}/uploadInterpretation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(interpretationData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error when inserting data:", error);
  }
}

async function uploadProgramButton() {
  console.log("upload program button clicked");

  const fileInput = document.getElementById("programFile");
  const file = fileInput.files[0];

  const programData = {
    title: document.getElementById("programTitle").value,
    location: document.getElementById("programLocation").value,
    season: document.getElementById("programSeason").value,
    notes: document.getElementById("programNotes").value,
    filelink: file.name,
    conductor: document.getElementById("programConductor").value,
    orchestra: document.getElementById("programOrchestra").value,
    soloist: document.getElementById("programSoloist").value, // läggs in i array med , som separator
  };

  await uploadToS3(fileInput);
  console.log(JSON.stringify(programData));

  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(`${apiUrl}/uploadProgram`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(programData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error when inserting data:", error);
  }
}

async function uploadDocumentButton() {
  console.log("upload document button clicked");

  const fileInput = document.getElementById("documentFile");
  const file = fileInput.files[0];

  const documentData = {
    title: document.getElementById("documentTitle").value,
    notes: document.getElementById("documentNotes").value,
    year: document.getElementById("documentYear").value,
    filelink: file.name,
  };

  console.log(JSON.stringify(documentData));
  await uploadToS3(fileInput);

  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(`${apiUrl}/uploadDocument`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error when inserting data:", error);
  }
}

async function uploadImageButton() {
  console.log("upload image button clicked");

  const fileInput = document.getElementById("imageFile");
  const file = fileInput.files[0];

  const imageData = {
    description: document.getElementById("imageDescription").value,
    filelink: file.name,
  };

  console.log(JSON.stringify(imageData));
  await uploadToS3(fileInput);

  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(`${apiUrl}/uploadImage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(imageData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error when inserting data:", error);
  }
}

async function uploadToS3(fileInput) {
  const folderName = document.getElementById("upload_type").value;
  const lowerCaseFolderName = folderName.toLowerCase();

  if (!fileInput) {
    console.error(`File input with ID "${fileInput}" not found in DOM.`);
    return;
  }

  if (!fileInput.files || fileInput.files.length === 0) {
    console.error(`No file selected for "${folderName}".`);
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const apiUrl = getEnvironmentUrl();
    const response = await fetch(
      `${apiUrl}/${lowerCaseFolderName + "s"}/uploadToS3`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error when uploading file:", error);
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

function clearFields() {
  const textInputs = document.querySelectorAll('input[type="text"]');
  textInputs.forEach((input) => (input.value = ""));

  const fileInputs = document.querySelectorAll('input[type="file"]');
  fileInputs.forEach((input) => (input.value = ""));

  const select = document.querySelector("#upload_type");
  select.selectedIndex = 0;

  const sections = document.querySelectorAll(
    "#upload_score_fields, #upload_program_fields, #upload_document_fields, #upload_image_fields"
  );
  sections.forEach((section) => (section.style.display = "none"));
}
