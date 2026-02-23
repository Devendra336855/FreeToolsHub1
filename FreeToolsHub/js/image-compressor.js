// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get all DOM elements
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const targetSize = document.getElementById('targetSize');
  const compressionLevel = document.getElementById('compressionLevel');
  const resizeWidth = document.getElementById('resizeWidth');
  const maintainAspect = document.getElementById('maintainAspect');
  const compressBtn = document.getElementById('compressBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  const resultCard = document.getElementById('resultCard');
  const previewImage = document.getElementById('previewImage');
  const originalSizeSpan = document.getElementById('originalSize');
  const compressedSizeSpan = document.getElementById('compressedSize');
  const reductionPercentSpan = document.getElementById('reductionPercent');
  const downloadLink = document.getElementById('downloadLink');
  const compressAnother = document.getElementById('compressAnother');
  const selectedFileInfo = document.getElementById('selectedFileInfo');

  // Check if all required elements exist
  if (!uploadArea || !fileInput || !uploadBtn || !targetSize || !compressionLevel || !resizeWidth ||
      !maintainAspect || !compressBtn || !progressContainer || !progressFill || !progressPercent ||
      !resultCard || !previewImage || !originalSizeSpan || !compressedSizeSpan ||
      !reductionPercentSpan || !downloadLink || !compressAnother || !selectedFileInfo) {
    console.error('Required elements missing in image compressor page.');
    return;
  }

  // Quality mapping based on compression level (initial quality hint)
  const qualityMap = {
    low: 0.9,
    medium: 0.7,
    high: 0.4
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
    if (file && file.type.startsWith('image/')) {
      if (file.size <= 10 * 1024 * 1024) { // 10MB limit
        setSelectedFile(file);
      } else {
        alert('File exceeds 10MB limit. Please choose a smaller file.');
      }
    } else {
      alert('Please drop a valid image file.');
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
      <span>📷</span>
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
      compressedBlob = await compressImage(file);
      clearInterval(interval);
      progressFill.style.width = '100%';
      progressPercent.textContent = '100%';

      // Slight delay before showing result
      setTimeout(() => {
        progressContainer.style.display = 'none';
        displayResult(file, compressedBlob);
        compressBtn.disabled = false; // Re-enable (though we hide it)
      }, 500);
    } catch (error) {
      clearInterval(interval);
      progressContainer.style.display = 'none';
      compressBtn.disabled = false;
      alert('Compression failed: ' + error.message);
      console.error(error);
    }
  }

  async function compressImage(file) {
    const targetMB = parseFloat(targetSize.value);
    const level = compressionLevel.value;
    const quality = qualityMap[level] || 0.7;

    const options = {
      maxSizeMB: targetMB,
      maxWidthOrHeight: resizeWidth.value ? parseInt(resizeWidth.value) : undefined,
      useWebWorker: true,
      initialQuality: quality,
      fileType: 'image/jpeg', // force JPEG for smaller size (could be dynamic)
    };

    // If user set a resize width and maintain aspect is true, the library will auto-calc height
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  }

  function displayResult(originalFile, compressedBlob) {
    const originalKB = originalFile.size / 1024;
    const compressedKB = compressedBlob.size / 1024;
    const reduction = ((originalKB - compressedKB) / originalKB * 100).toFixed(1);

    originalSizeSpan.textContent = originalKB.toFixed(2) + ' KB';
    compressedSizeSpan.textContent = compressedKB.toFixed(2) + ' KB';
    reductionPercentSpan.textContent = reduction + '%';

    // Show preview
    const objectUrl = URL.createObjectURL(compressedBlob);
    previewImage.src = objectUrl;

    // Create download URL and set link
    const url = URL.createObjectURL(compressedBlob);
    downloadLink.href = url;
    // Determine file extension
    const ext = compressedBlob.type.split('/')[1] || 'jpg';
    downloadLink.download = `compressed.${ext}`;

    resultCard.style.display = 'block';

    // Update upload area to show success (optional)
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
    previewImage.src = '';
  }
});