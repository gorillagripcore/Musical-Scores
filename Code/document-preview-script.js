let fileBuffer = null;  // Gör fileBuffer till en global variabel

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const urlParams = new URLSearchParams(window.location.search);
const fetchedUrl = urlParams.get('fileLink');
const folder = urlParams.get('folder');
let zoomLevel = 2.0; // Starta med en grundnivå för zoom

if (!fetchedUrl) {
    console.error('Missing fileLink parameter in URL');
} else {
    console.log('fetchedUrl:', fetchedUrl);  
    const fileUrl = `${getEnvironmentUrl()}/fetchFromS3/${folder}/${fetchedUrl}`;
    const CHUNK_SIZE = 10 * 1024 * 1024;

    let currentPage = 1;
    let totalPages = 0;
    let pdfDoc = null;

    let db;
    const request = indexedDB.open('scoreDatabase', 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        if (!db.objectStoreNames.contains('files')) {
            db.createObjectStore('files', { keyPath: 'id' });
        }
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('IndexedDB is ready');
        loadFileFromIndexedDB(fetchedUrl);
    };

    request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
    };

    function loadFileFromIndexedDB(fileId) {
        const transaction = db.transaction(['files'], 'readonly');
        const store = transaction.objectStore('files');

        const request = store.get(fileId);
        request.onsuccess = function(event) {
            const file = event.target.result;
            if (file) {
                console.log('File loaded from IndexedDB:', file);
                fileBuffer = file.buffer;  // Sätt fileBuffer här när filen har laddats
                loadAndRenderPdf(fileBuffer);
            } else {
                console.log('File not found in IndexedDB, fetching from server...');
                fetchFileInChunks(fileId);
            }
        };

        request.onerror = function(event) {
            console.error('Error reading from IndexedDB:', event.target.error);
        };
    }

    async function fetchFileInChunks(fileId) {
        let allChunksReceived = false;
        let fileChunks = [];
        let rangeStart = 0;
        let rangeEnd = CHUNK_SIZE - 1;

        while (!allChunksReceived) {
            const response = await fetch(fileUrl, {
                headers: {
                    "Range": `bytes=${rangeStart}-${rangeEnd}`
                }
            });

            if (response.ok) {
                const data = await response.arrayBuffer();
                fileChunks.push(new Uint8Array(data)); 

                rangeStart = rangeEnd + 1;
                rangeEnd = rangeStart + CHUNK_SIZE - 1;

                if (data.byteLength < CHUNK_SIZE) {
                    allChunksReceived = true;
                    fileBuffer = concatenateChunks(fileChunks);
                    saveFileToIndexedDB(fileId, fileBuffer);
                }
            } else {
                console.error('Error fetching chunk:', response.statusText);
                break;
            }
        }
    }

    function concatenateChunks(chunks) {
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;

        chunks.forEach(chunk => {
            result.set(chunk, offset);
            offset += chunk.length;
        });

        return result.buffer;
    }

    function saveFileToIndexedDB(fileId, fileBuffer) {
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');

        const fileData = { id: fileId, buffer: fileBuffer };

        const request = store.put(fileData);
        request.onsuccess = function(event) {
            console.log('File saved to IndexedDB');
            loadAndRenderPdf(fileBuffer);

            request.onerror = function(event) {
                console.error('Error saving file to IndexedDB:', event.target.error);
            };
        }
    }

    async function loadAndRenderPdf(fileBuffer) {
        try {
            pdfDoc = await pdfjsLib.getDocument(fileBuffer).promise;
            totalPages = pdfDoc.numPages;
            document.getElementById('page-count').textContent = totalPages;
            renderPreViewPage(currentPage);
            document.getElementById('page-num').textContent = currentPage;
        } catch (error) {
            console.error('Error rendering PDF:', error);
        }
    }

    async function renderPreViewPage(pageNum) {
        try {
            const page = await pdfDoc.getPage(pageNum);
            const scale = zoomLevel;
            const viewport = page.getViewport({ scale });

            const canvas = getCorrectCanvasBasedOnUrl();
            const context = canvas.getContext('2d');

            canvas.width = viewport.width * window.devicePixelRatio;
            canvas.height = viewport.height * window.devicePixelRatio;

            context.scale(window.devicePixelRatio, window.devicePixelRatio);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            document.getElementById('page-num').textContent = pageNum;
        } catch (error) {
            console.error('Error rendering page:', error);
        }
    }

    function nextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            renderPreViewPage(currentPage);
        }
    }

    function prevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderPreViewPage(currentPage);
        }
    }

    document.getElementById('next-page').addEventListener('click', nextPage);
    document.getElementById('prev-page').addEventListener('click', prevPage);
    
    function zoomIn() {
        zoomLevel += 0.1;
        renderPreViewPage(currentPage);
    }

    function zoomOut() {
        if (zoomLevel > 0.2) {  
            zoomLevel -= 0.1;
            renderPreViewPage(currentPage); 
        }
    }

    function openZoomPage() {
        const zoomUrl = `zoom.html?folder=${folder}&fileLink=${encodeURIComponent(fetchedUrl)}`;
        const newWindow = window.open(zoomUrl, "_blank");

    
        if (newWindow) {
            newWindow.focus();
        }
    }

    document.addEventListener('contextmenu', (event) => {
        if (event.target.tagName === 'CANVAS') {
            event.preventDefault();
        }
    });

    function getCorrectCanvasBasedOnUrl() {
        const currentFile = window.location.pathname.split('/').pop();
        let canvas = "";
        if (currentFile.includes('zoom')) {   
            console.log('Zoom page');
            canvas = document.getElementById('pdf-zoom-render');
            document.getElementById('zoom-in').addEventListener('click', zoomIn);
            document.getElementById('zoom-out').addEventListener('click', zoomOut); 

        } else {
            document.getElementById('pdf-render').addEventListener('click', openZoomPage);
            canvas = document.getElementById('pdf-render');
        }
        return canvas;
    }

    function getEnvironmentUrl() {
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
            return 'http://127.0.0.1:5001/api';
        } else {
            return '/api';
        }
    }
}
