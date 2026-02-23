document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const textarea = document.getElementById('textInput');
  const wordCountSpan = document.getElementById('wordCount');
  const charCountSpan = document.getElementById('charCount');
  const charNoSpaceSpan = document.getElementById('charNoSpace');
  const sentenceCountSpan = document.getElementById('sentenceCount');
  const paragraphCountSpan = document.getElementById('paragraphCount');
  const readingTimeSpan = document.getElementById('readingTime');
  const speakingTimeSpan = document.getElementById('speakingTime');
  const avgWordLengthSpan = document.getElementById('avgWordLength');
  const mostUsedWordSpan = document.getElementById('mostUsedWord');
  const readingLevelSpan = document.getElementById('readingLevel');
  const keywordsDiv = document.getElementById('keywords');

  // Buttons
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  // Toggles
  const darkModeToggle = document.getElementById('darkModeToggle');
  const focusModeToggle = document.getElementById('focusModeToggle');
  const fullScreenToggle = document.getElementById('fullScreenToggle');

  // State
  let text = '';

  // ---- Counting functions ----
  function countWords(str) {
    return str.trim().split(/\s+/).filter(Boolean).length;
  }

  function countSentences(str) {
    return (str.match(/[.!?]+/g) || []).length;
  }

  function countParagraphs(str) {
    return str.split(/\n\s*\n/).filter(Boolean).length;
  }

  function countCharactersNoSpaces(str) {
    return str.replace(/\s+/g, '').length;
  }

  function avgWordLength(str) {
    const words = str.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 0;
    const totalChars = words.reduce((sum, w) => sum + w.length, 0);
    return (totalChars / words.length).toFixed(1);
  }

  function mostUsedWord(str) {
    const words = str.toLowerCase().match(/\b\w+\b/g);
    if (!words || words.length === 0) return '-';
    const stopwords = ['the','and','for','that','this','with','are','you','your','have','from','was','were','has','had','not','but','what','all','can','get','use','will'];
    const freq = {};
    words.forEach(w => {
      if (!stopwords.includes(w) && w.length > 2) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });
    if (Object.keys(freq).length === 0) return '-';
    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]);
    return sorted[0][0];
  }

  function readingLevel(str) {
    // Simple heuristic: average words per sentence
    const sentences = countSentences(str) || 1;
    const words = countWords(str) || 1;
    const avg = words / sentences;
    if (avg < 10) return 'Easy';
    if (avg < 20) return 'Medium';
    return 'Hard';
  }

  function keywordDensity(str) {
    const words = str.toLowerCase().match(/\b\w{4,}\b/g);
    if (!words) return [];
    const freq = {};
    const stopwords = ['the','and','for','that','this','with','are','you','your','have','from','was','were','has','had','not','but','what','all','can','get','use','will','they','them','their','there','were','been','has','had'];
    words.forEach(w => {
      if (!stopwords.includes(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 10);
    return sorted;
  }

  function updateStats() {
    text = textarea.value;
    const words = countWords(text);
    const chars = text.length;
    const charsNoSpace = countCharactersNoSpaces(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const reading = (words / 200).toFixed(1);
    const speaking = (words / 150).toFixed(1);

    wordCountSpan.textContent = words;
    charCountSpan.textContent = chars;
    charNoSpaceSpan.textContent = charsNoSpace;
    sentenceCountSpan.textContent = sentences;
    paragraphCountSpan.textContent = paragraphs;
    readingTimeSpan.textContent = reading;
    speakingTimeSpan.textContent = speaking;

    // Advanced
    avgWordLengthSpan.textContent = avgWordLength(text);
    mostUsedWordSpan.textContent = mostUsedWord(text);
    readingLevelSpan.textContent = readingLevel(text);

    const keywords = keywordDensity(text);
    keywordsDiv.innerHTML = '';
    keywords.forEach(([word, count]) => {
      const span = document.createElement('span');
      span.className = 'keyword-item';
      span.textContent = `${word} (${count})`;
      keywordsDiv.appendChild(span);
    });
  }

  // ---- Event listeners ----
  textarea.addEventListener('input', updateStats);

  // Clear button
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    updateStats();
  });

  // Copy button
  copyBtn.addEventListener('click', () => {
    textarea.select();
    document.execCommand('copy');
    alert('Text copied to clipboard!');
  });

  // Download as TXT
  downloadTxtBtn.addEventListener('click', () => {
    const blob = new Blob([textarea.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Download as PDF (using simple print/PDF, or we can use html2pdf for better formatting)
  downloadPdfBtn.addEventListener('click', () => {
    // Use browser's print to PDF (quick solution)
    window.print();
    // Alternatively, could use html2pdf to format nicely, but for simplicity we'll use print.
  });

  // Dark mode toggle (simple)
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    darkModeToggle.classList.toggle('active');
    // Add dark mode styles if needed – we can define in style.css or here
    if (document.body.classList.contains('dark-mode')) {
      document.body.style.background = '#1a1a1a';
      document.body.style.color = '#f0f0f0';
      // Override other elements if necessary
    } else {
      document.body.style.background = '#f8fafc';
      document.body.style.color = '#1e293b';
    }
  });

  // Focus mode: hide everything except textarea and stats? Actually we can simplify by adding a class
  focusModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
    focusModeToggle.classList.toggle('active');
    if (document.body.classList.contains('focus-mode')) {
      // Hide header, footer, title, toggles, maybe stats? But we want stats visible.
      // We'll hide header and footer and title, keep main area.
      document.querySelector('header').style.display = 'none';
      document.querySelector('.tool-title').style.display = 'none';
      document.querySelector('.feature-toggle').style.display = 'none';
      document.querySelector('footer').style.display = 'none';
      document.querySelector('.seo-section').style.display = 'none'; // if present
    } else {
      document.querySelector('header').style.display = 'block';
      document.querySelector('.tool-title').style.display = 'block';
      document.querySelector('.feature-toggle').style.display = 'flex';
      document.querySelector('footer').style.display = 'block';
      document.querySelector('.seo-section').style.display = 'block';
    }
  });

  // Full screen toggle: request fullscreen on main area
  fullScreenToggle.addEventListener('click', () => {
    const main = document.querySelector('main');
    if (!document.fullscreenElement) {
      main.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // Auto-save to localStorage (optional)
  const savedText = localStorage.getItem('wordCounterText');
  if (savedText) {
    textarea.value = savedText;
  }
  textarea.addEventListener('input', () => {
    localStorage.setItem('wordCounterText', textarea.value);
  });

  // Initial update
  updateStats();

  // For download PDF, we might want better formatting; but for now it's fine.
  // If we want to use html2pdf, we need to include the library. But for simplicity, we use print.
});