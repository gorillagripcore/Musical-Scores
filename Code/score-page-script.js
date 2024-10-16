pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const url =  '/test-score.pdf';

let pdfDoc = null,
pageNum = 1,
pageIsRendering = false,
pageNumIsPending = null;

const scale = 1.5,
canvas = document.querySelector("#pdf-render"),
ctx = canvas.getContext('2d');

//Render page
const renderPage = num => {
    pageIsRendering = true;

    //Get page
    pdfDoc.getPage(num).then(page => {
        console.log(page)
        
        //Set scale
        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then (() => {
            pageIsRendering = false;
            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        });

        //Output current page
        document.querySelector('#page-num').textContent = num;
        
    });
    
};



// Get document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector("#page-count").textContent = pdfDoc.numPages;
    
    renderPage(pageNum)
})








/*var data = sessionStorage.getItem('key');



function getCurrentPageNumber() {
    let pdf = document.getElementById("score-page").src;
    let currentPage = pdf.match(/page=(\d+)/)[1];
    return parseInt(currentPage);
}

function prevPage() {
    let currentPage = getCurrentPageNumber();
    let newPageNumber = currentPage - 1;
    if (currentPage > 1) {
        updateSrc(newPageNumber);
    }
}

function nextPage() {
    let currentPage = getCurrentPageNumber();
    let newPageNumber = currentPage + 1;
    updateSrc(newPageNumber);
}

function updateSrc(newPage) {
    let embedElement = document.getElementById("score-page");
    let newSrc = embedElement.src.replace(/page=\d+/, 'page=' + newPage);
    embedElement.src = newSrc;
    sessionStorage.setItem('page', newPage);
    hey = document.getElementById("score-page").src;
}*/