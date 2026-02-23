(function() {
  console.log('PDF to Word script started.');

  // Check pdf.js
  if (typeof pdfjsLib === 'undefined') {
    console.error('pdf.js library failed to load.');
    alert('Error: PDF library failed to load. Please refresh and try again.');
    return;
  }
  console.log('pdf.js loaded successfully.');

  // Configure pdf.js worker to avoid CSP issues (use blob)
  const workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  fetch(workerSrc)
    .then(response => response.text())
    .then(workerText => {
      const blob = new Blob([workerText], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      pdfjsLib.GlobalWorkerOptions.workerSrc = blobUrl;
      console.log('pdf.js worker configured via blob');
    })
    .catch(err => {
      console.warn('Failed to load pdf worker via blob, falling back to direct src');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    });

  // Get all DOM elements
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const convertBtn = document.getElementById('convertBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressMessage = document.getElementById('progressMessage');
  const progressPercent = document.getElementById('progressPercent');
  const resultCard = document.getElementById('resultCard');
  const originalFileNameSpan = document.getElementById('originalFileName');
  const pageCountSpan = document.getElementById('pageCount');
  const downloadLink = document.getElementById('downloadLink');
  const convertAnother = document.getElementById('convertAnother');
  const selectedFileInfo = document.getElementById('selectedFileInfo');

  if (!uploadArea || !fileInput || !convertBtn || !progressContainer || !resultCard || !selectedFileInfo) {
    console.error('Some required elements are missing.');
    alert('Page error: some elements are missing. Please refresh.');
    return;
  }

  let currentFile = null;
  let convertedBlob = null;
  let pageCount = 0;
  let progressInterval = null;

  // ---- Event Listeners ----
  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 25 * 1024 * 1024) {
        setSelectedFile(file);
      } else {
        alert('File exceeds 25MB limit. Please choose a smaller file.');
      }
    } else {
      alert('Please drop a valid PDF file.');
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  });

  convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    await handleConversion(currentFile);
  });

  convertAnother.addEventListener('click', resetUI);

  // ---- Helper Functions ----
  function setSelectedFile(file) {
    currentFile = file;
    uploadArea.classList.add('has-file');
    selectedFileInfo.style.display = 'flex';
    selectedFileInfo.innerHTML = `
      <span>📄</span>
      <span class="file-name">${file.name}</span>
      <span style="color: #64748b;">(${(file.size / 1024).toFixed(2)} KB)</span>
      <button id="removeFile" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;">✕</button>
    `;
    convertBtn.disabled = false;

    document.getElementById('removeFile')?.addEventListener('click', (e) => {
      e.stopPropagation();
      resetFileSelection();
    });
  }

  function resetFileSelection() {
    currentFile = null;
    fileInput.value = '';
    uploadArea.classList.remove('has-file');
    selectedFileInfo.style.display = 'none';
    selectedFileInfo.innerHTML = '';
    convertBtn.disabled = true;
  }

  async function handleConversion(file) {
    if (progressInterval) clearInterval(progressInterval);

    resultCard.style.display = 'none';
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    progressMessage.textContent = 'Uploading…';
    convertBtn.disabled = true;

    let progress = 0;
    progressInterval = setInterval(() => {
      if (progress < 30) {
        progress += 5;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = progress + '%';
      }
    }, 200);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      progressMessage.textContent = 'Converting…';

      const progressInterval2 = setInterval(() => {
        if (progress < 80) {
          progress += 5;
          progressFill.style.width = progress + '%';
          progressPercent.textContent = progress + '%';
        } else {
          clearInterval(progressInterval2);
        }
      }, 300);

      const { blob, pages } = await convertPDFToWord(file);

      clearInterval(progressInterval);
      clearInterval(progressInterval2);
      progressInterval = null;

      progressFill.style.width = '100%';
      progressPercent.textContent = '100%';
      progressMessage.textContent = 'Preparing download…';

      convertedBlob = blob;
      pageCount = pages;

      setTimeout(() => {
        progressContainer.style.display = 'none';
        displayResult(file, blob, pages);
        convertBtn.disabled = false;
      }, 500);
    } catch (error) {
      console.error('Conversion error:', error);
      if (progressInterval) clearInterval(progressInterval);
      progressInterval = null;
      progressContainer.style.display = 'none';
      convertBtn.disabled = false;
      alert('Conversion failed: ' + error.message);
    }
  }

  async function convertPDFToWord(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      fullText += strings.join(' ') + '\n\n';
    }

    if (!fullText.trim()) {
      console.warn('No text extracted from PDF. It might be a scanned image.');
    }

    // Create a simple HTML document that Word can open
    const htmlContent = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Converted from PDF</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            p { margin: 0 0 1em 0; }
          </style>
        </head>
        <body>
          ${fullText.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('')}
        </body>
      </html>
    `;

    // If no text, provide a fallback message
    const finalHtml = fullText.trim() ? htmlContent : `
      <html>
        <body>
          <p>No text could be extracted from this PDF. It may be a scanned image.</p>
        </body>
      </html>
    `;

    // Create a blob with .doc extension – Word will open it as HTML
    const blob = new Blob([finalHtml], { type: 'application/msword' });
    return { blob, pages: numPages };
  }

  function displayResult(originalFile, blob, pages) {
    originalFileNameSpan.textContent = originalFile.name;
    pageCountSpan.textContent = pages;

    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = originalFile.name.replace('.pdf', '.doc');

    resultCard.style.display = 'block';

    selectedFileInfo.innerHTML = `
      <span>✅</span>
      <span class="file-name">${originalFile.name}</span>
      <span style="color: #22c55e;">Converted!</span>
    `;
  }

  function resetUI() {
    resultCard.style.display = 'none';
    progressContainer.style.display = 'none';
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    resetFileSelection();
    convertedBlob = null;
  }
})();