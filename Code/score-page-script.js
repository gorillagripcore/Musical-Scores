//For performance & browser compatability
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

//This is the currently displayed pdf url
const url = '../test-score.pdf';

let pdfDoc = null,
pageNum = 1,
pageRendering = false,
pageNumPending = null,
//Change this value to change scale of pdf (if we want to zoom in the page or something)
scale = 0.98;

const canvas = document.querySelector("#pdf-render"),
ctx = canvas.getContext('2d');

//Render page
const renderPage = num => {
    pageRendering = true;

    //Get page
    pdfDoc.getPage(num).then(page => {
        console.log(page)
        
        //Set scale
        const viewport = page.getViewport({ scale: scale, })
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then (() => {
            pageRendering = false;
            if(pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });

        //Output current page
        document.querySelector('#page-num').textContent = num;
        
    });
};

//check for pages rendering
const queueRenderPage = num => {
    if(pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

//Prev page
const showPrevPage = () => {
    if(pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

document.querySelector('#prev-page').addEventListener('click', showPrevPage);

//Next page
const showNextPage = () => {
    if(pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

document.querySelector('#next-page').addEventListener('click', showNextPage);


// Get document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.querySelector("#page-count").textContent = pdfDoc.numPages;
    
    renderPage(pageNum)
})

// Turn off right click
document.addEventListener('contextmenu', (event) => {
    if (event.target.tagName === 'CANVAS') {
        event.preventDefault();
    }
});

function getEnvironmentUrl(){
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return 'http://127.0.0.1:5001/api' 
    } else {
        return '/api'
    }
}