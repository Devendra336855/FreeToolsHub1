// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get all DOM elements
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const compressionLevel = document.getElementById('compressionLevel');
  const targetSize = document.getElementById('targetSize');
  const reduceResolution = document.getElementById('reduceResolution');
  const compressBtn = document.getElementById('compressBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const resultCard = document.getElementById('resultCard');
  const originalSizeSpan = document.getElementById('originalSize');
  const compressedSizeSpan = document.getElementById('compressedSize');
  const reductionPercentSpan = document.getElementById('reductionPercent');
  const downloadLink = document.getElementById('downloadLink');
  const compressAnother = document.getElementById('compressAnother');
  const selectedFileInfo = document.getElementById('selectedFileInfo');

  // Check if all required elements exist
  if (!uploadArea || !fileInput || !uploadBtn || !compressionLevel || !targetSize ||
      !reduceResolution || !compressBtn || !progressContainer || !progressFill || !progressPercent ||
      !resultCard || !originalSizeSpan || !compressedSizeSpan || !reductionPercentSpan ||
      !downloadLink || !compressAnother || !selectedFileInfo) {
    console.error('Required elements missing in PDF compressor page.');
    return;
  }

  // Quality mapping based on compression level
  const qualityMap = {
    low: 0.4,
    medium: 0.7,
    high: 0.9
  };

  let currentFile = null;
  let compressedBlob = null;

  // ---- Event Listeners ----

  // Click on upload area triggers file input
  uploadArea.addEventListener('click', () => fileInput.click());

  // Drag & drop events
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
      if (file.size <= 50 * 1024 * 1024) { // 50MB limit
        setSelectedFile(file);
      } else {
        alert('File exceeds 50MB limit. Please choose a smaller file.');
      }
    } else {
      alert('Please drop a valid PDF file.');
    }
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  });

  // Compress button click
  compressBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    await handleFile(currentFile);
  });

  // "Compress Another" button
  compressAnother.addEventListener('click', resetUI);

  // ---- Helper Functions ----

  function setSelectedFile(file) {
    currentFile = file;
    // Update UI to show selected file
    uploadArea.classList.add('has-file');
    selectedFileInfo.style.display = 'flex';
    selectedFileInfo.innerHTML = `
      <span>📄</span>
      <span class="file-name">${file.name}</span>
      <span style="color: #64748b;">(${(file.size / 1024).toFixed(2)} KB)</span>
      <button id="removeFile" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:1.2rem;">✕</button>
    `;
    // Enable compress button
    compressBtn.disabled = false;

    // Add event listener to remove button
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
    compressBtn.disabled = true;
  }

  async function handleFile(file) {
    // Hide result card if visible
    resultCard.style.display = 'none';
    // Show progress bar
    progressContainer.style.display = 'block';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    compressBtn.disabled = true; // Disable while processing

    // Simulate progress steps (real compression doesn't provide progress)
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 90) {
        progress += 10;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = progress + '%';
      }
    }, 200);

    try {
      // Perform actual compression
      compressedBlob = await compressPDF(file);
      clearInterval(interval);
      progressFill.style.width = '100%';
      progressPercent.textContent = '100%';

      // Slight delay before showing result
      setTimeout(() => {
        progressContainer.style.display = 'none';
        displayResult(file, compressedBlob);
        compressBtn.disabled = false; // Re-enable for next compression (though we hide it)
      }, 500);
    } catch (error) {
      clearInterval(interval);
      progressContainer.style.display = 'none';
      compressBtn.disabled = false;
      alert('Compression failed: ' + error.message);
      console.error(error);
    }
  }

  async function compressPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    // Get user-selected quality
    const level = compressionLevel.value;
    const quality = qualityMap[level] || 0.7;

    // For now, we use pdf-lib's built-in save with compression.
    // This removes unused objects and compresses streams, but does NOT recompress images.
    // A more advanced version would extract and recompress images (future enhancement).
    const compressedPdf = await pdfDoc.save({ useObjectStreams: true, compress: true });

    return new Blob([compressedPdf], { type: 'application/pdf' });
  }

  function displayResult(originalFile, compressedBlob) {
    const originalKB = originalFile.size / 1024;
    const compressedKB = compressedBlob.size / 1024;
    const reduction = ((originalKB - compressedKB) / originalKB * 100).toFixed(1);

    originalSizeSpan.textContent = originalKB.toFixed(2) + ' KB';
    compressedSizeSpan.textContent = compressedKB.toFixed(2) + ' KB';
    reductionPercentSpan.textContent = reduction + '%';

    // Create download URL and set link
    const url = URL.createObjectURL(compressedBlob);
    downloadLink.href = url;
    downloadLink.download = 'compressed.pdf';

    resultCard.style.display = 'block';

    // Also update upload area to show success (optional)
    selectedFileInfo.innerHTML = `
      <span>✅</span>
      <span class="file-name">${originalFile.name}</span>
      <span style="color: #22c55e;">Compressed!</span>
    `;
  }

  function resetUI() {
    resultCard.style.display = 'none';
    progressContainer.style.display = 'none';
    resetFileSelection();
    compressedBlob = null;
  }
});