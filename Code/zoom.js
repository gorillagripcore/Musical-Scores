pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const url = '../test-score.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1;

const canvas = document.querySelector("#pdf-render"),
  ctx = canvas.getContext("2d");

const renderPage = (num) => {
  pageRendering = true;
  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: scale });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderCtx = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderCtx).promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    document.querySelector("#page-num").textContent = num;
  });
};

const queueRenderPage = (num) => {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

const zoomIn = () => {
  scale += 0.1;
  renderPage(pageNum);
};

const zoomOut = () => {
  if (scale > 0.5) {
    scale -= 0.1;
    renderPage(pageNum);
  }
};

document.querySelector("#prev-page").addEventListener("click", showPrevPage);
document.querySelector("#next-page").addEventListener("click", showNextPage);
document.querySelector("#zoom-in").addEventListener("click", zoomIn);
document.querySelector("#zoom-out").addEventListener("click", zoomOut);

pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
  pdfDoc = pdfDoc_;
  document.querySelector("#page-count").textContent = pdfDoc.numPages;
  renderPage(pageNum);
});

// Turn off right click
document.addEventListener('contextmenu', (event) => {
  if (event.target.tagName === 'CANVAS') {
    event.preventDefault();
  }
});
