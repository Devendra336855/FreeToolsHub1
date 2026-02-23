document.addEventListener('DOMContentLoaded', function() {
  // ----- DOM Elements -----
  const templateCards = document.querySelectorAll('.template-card');
  const templateSection = document.getElementById('templateSection');
  const stepProgress = document.getElementById('stepProgress');
  const builderContainer = document.getElementById('builderContainer');
  const strengthMeter = document.getElementById('strengthMeter');
  const downloadOptions = document.getElementById('downloadOptions');
  const nextToFormBtn = document.getElementById('nextToForm');
  const createResumeBtn = document.getElementById('createResumeBtn');
  const prevStepBtn = document.getElementById('prevStep');
  const nextStepBtn = document.getElementById('nextStep');
  const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3'),
    document.getElementById('step4'),
    document.getElementById('step5'),
    document.getElementById('step6'),
    document.getElementById('step7'),
    document.getElementById('step8')
  ];
  const stepIndicators = document.querySelectorAll('.step');

  // Form inputs
  const fullName = document.getElementById('fullName');
  const jobTitle = document.getElementById('jobTitle');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const linkedin = document.getElementById('linkedin');
  const portfolio = document.getElementById('portfolio');
  const address = document.getElementById('address');
  const photo = document.getElementById('photo');
  const summary = document.getElementById('summary');
  const eduContainer = document.getElementById('eduContainer');
  const expContainer = document.getElementById('expContainer');
  const projectContainer = document.getElementById('projectContainer');
  const certContainer = document.getElementById('certContainer');
  const addEdu = document.getElementById('addEdu');
  const addExp = document.getElementById('addExp');
  const addProject = document.getElementById('addProject');
  const addCert = document.getElementById('addCert');
  const skillInput = document.getElementById('skillInput');
  const skillsContainer = document.getElementById('skillsContainer');
  const showLanguages = document.getElementById('showLanguages');
  const languagesSection = document.getElementById('languagesSection');
  const languages = document.getElementById('languages');
  const showHobbies = document.getElementById('showHobbies');
  const hobbiesSection = document.getElementById('hobbiesSection');
  const hobbies = document.getElementById('hobbies');
  const showVolunteer = document.getElementById('showVolunteer');
  const volunteerSection = document.getElementById('volunteerSection');
  const volunteer = document.getElementById('volunteer');

  // Download buttons
  const downloadPdf = document.getElementById('downloadPdf');
  const downloadDoc = document.getElementById('downloadDoc');
  const printResume = document.getElementById('printResume');

  // Zoom controls
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  const zoomLevel = document.getElementById('zoomLevel');
  const resumePreview = document.getElementById('resumePreview');

  // ----- State -----
  let currentStep = 1;
  let selectedTemplate = 'modern';
  let skills = [];
  let eduCount = 0, expCount = 0, projectCount = 0, certCount = 0;
  let currentZoom = 1;

  // Resume data object
  let resumeData = {
    personal: { fullName: '', jobTitle: '', phone: '', email: '', linkedin: '', portfolio: '', address: '', photo: null },
    summary: '',
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    extras: { languages: '', hobbies: '', volunteer: '' }
  };

  // Auto-save key
  const STORAGE_KEY = 'resumeBuilderData';

  // ----- Load from localStorage -----
  function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        resumeData = JSON.parse(saved);
        // Restore form fields
        fullName.value = resumeData.personal.fullName || '';
        jobTitle.value = resumeData.personal.jobTitle || '';
        phone.value = resumeData.personal.phone || '';
        email.value = resumeData.personal.email || '';
        linkedin.value = resumeData.personal.linkedin || '';
        portfolio.value = resumeData.personal.portfolio || '';
        address.value = resumeData.personal.address || '';
        summary.value = resumeData.summary || '';
        skills = resumeData.skills || [];
        renderSkills();
        // Restore dynamic sections
        restoreEducation();
        restoreExperience();
        restoreProjects();
        restoreCertifications();
        // Extras
        languages.value = resumeData.extras.languages || '';
        hobbies.value = resumeData.extras.hobbies || '';
        volunteer.value = resumeData.extras.volunteer || '';
      } catch (e) {
        console.warn('Failed to load saved data', e);
      }
    }
  }

  // Save to localStorage
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
  }

  // ----- Template Selection -----
  templateCards.forEach(card => {
    card.addEventListener('click', () => {
      templateCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedTemplate = card.dataset.template;
    });
  });

  createResumeBtn.addEventListener('click', () => {
    templateSection.scrollIntoView({ behavior: 'smooth' });
  });

  nextToFormBtn.addEventListener('click', () => {
    templateSection.style.display = 'none';
    stepProgress.style.display = 'flex';
    builderContainer.style.display = 'grid';
    strengthMeter.style.display = 'block';
    loadFromStorage();
    updateStepDisplay();
    updatePreview();
  });

  // ----- Step Navigation -----
  function updateStepDisplay() {
    steps.forEach((step, index) => {
      if (step) step.style.display = index + 1 === currentStep ? 'block' : 'none';
    });

    stepIndicators.forEach((ind, index) => {
      if (index + 1 < currentStep) {
        ind.classList.add('completed');
        ind.classList.remove('active');
      } else if (index + 1 === currentStep) {
        ind.classList.add('active');
        ind.classList.remove('completed');
      } else {
        ind.classList.remove('active', 'completed');
      }
    });

    prevStepBtn.style.display = currentStep === 1 ? 'none' : 'inline-block';
    nextStepBtn.textContent = currentStep === 8 ? 'Finish' : 'Next';
  }

  nextStepBtn.addEventListener('click', () => {
    saveCurrentStep();
    if (currentStep < 8) {
      currentStep++;
      updateStepDisplay();
    } else {
      downloadOptions.style.display = 'flex';
      builderContainer.scrollIntoView({ behavior: 'smooth' });
      alert('🎉 Congratulations! Your resume is ready to download.');
    }
  });

  prevStepBtn.addEventListener('click', () => {
    saveCurrentStep();
    if (currentStep > 1) {
      currentStep--;
      updateStepDisplay();
    }
  });

  function saveCurrentStep() {
    if (currentStep === 1) {
      resumeData.personal = {
        fullName: fullName.value,
        jobTitle: jobTitle.value,
        phone: phone.value,
        email: email.value,
        linkedin: linkedin.value,
        portfolio: portfolio.value,
        address: address.value,
        photo: null
      };
    } else if (currentStep === 2) {
      resumeData.summary = summary.value;
    } else if (currentStep === 5) {
      resumeData.skills = skills;
    } else if (currentStep === 8) {
      resumeData.extras = {
        languages: languages.value,
        hobbies: hobbies.value,
        volunteer: volunteer.value
      };
    }
    saveToStorage();
    updatePreview();
    updateATSScore();
  }

  // ----- Dynamic Education -----
  function addEducation() {
    eduCount++;
    const eduDiv = document.createElement('div');
    eduDiv.className = 'dynamic-item';
    eduDiv.innerHTML = `
      <input type="text" placeholder="Degree/Course" class="edu-degree">
      <input type="text" placeholder="School/College" class="edu-school">
      <input type="text" placeholder="Board/University" class="edu-board">
      <div style="display:flex; gap:0.5rem;">
        <input type="text" placeholder="Year" class="edu-year" style="flex:1;">
        <input type="text" placeholder="CGPA/Percentage" class="edu-percent" style="flex:1;">
      </div>
      <button class="remove-edu btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
    `;
    eduContainer.appendChild(eduDiv);
    eduDiv.querySelector('.remove-edu').addEventListener('click', () => {
      eduDiv.remove();
      collectEducation();
      updatePreview();
      saveToStorage();
    });
    eduDiv.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        collectEducation();
        updatePreview();
        saveToStorage();
      });
    });
  }

  function collectEducation() {
    const items = document.querySelectorAll('#eduContainer .dynamic-item');
    resumeData.education = [];
    items.forEach(item => {
      const degree = item.querySelector('.edu-degree')?.value || '';
      const school = item.querySelector('.edu-school')?.value || '';
      const board = item.querySelector('.edu-board')?.value || '';
      const year = item.querySelector('.edu-year')?.value || '';
      const percent = item.querySelector('.edu-percent')?.value || '';
      if (degree || school || board || year || percent) {
        resumeData.education.push({ degree, school, board, year, percent });
      }
    });
  }

  function restoreEducation() {
    eduContainer.innerHTML = '';
    resumeData.education.forEach((edu, index) => {
      eduCount++;
      const eduDiv = document.createElement('div');
      eduDiv.className = 'dynamic-item';
      eduDiv.innerHTML = `
        <input type="text" placeholder="Degree/Course" class="edu-degree" value="${edu.degree || ''}">
        <input type="text" placeholder="School/College" class="edu-school" value="${edu.school || ''}">
        <input type="text" placeholder="Board/University" class="edu-board" value="${edu.board || ''}">
        <div style="display:flex; gap:0.5rem;">
          <input type="text" placeholder="Year" class="edu-year" value="${edu.year || ''}" style="flex:1;">
          <input type="text" placeholder="CGPA/Percentage" class="edu-percent" value="${edu.percent || ''}" style="flex:1;">
        </div>
        <button class="remove-edu btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
      `;
      eduContainer.appendChild(eduDiv);
      eduDiv.querySelector('.remove-edu').addEventListener('click', () => {
        eduDiv.remove();
        collectEducation();
        updatePreview();
        saveToStorage();
      });
      eduDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          collectEducation();
          updatePreview();
          saveToStorage();
        });
      });
    });
  }

  addEdu.addEventListener('click', addEducation);

  // ----- Dynamic Experience -----
  function addExperience() {
    expCount++;
    const expDiv = document.createElement('div');
    expDiv.className = 'dynamic-item';
    expDiv.innerHTML = `
      <input type="text" placeholder="Job Title" class="exp-title">
      <input type="text" placeholder="Company" class="exp-company">
      <div style="display:flex; gap:0.5rem;">
        <input type="text" placeholder="Start Date" class="exp-start" style="flex:1;">
        <input type="text" placeholder="End Date" class="exp-end" style="flex:1;">
      </div>
      <textarea placeholder="Responsibilities (bullet points)" class="exp-desc" rows="2"></textarea>
      <button class="remove-exp btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
    `;
    expContainer.appendChild(expDiv);
    expDiv.querySelector('.remove-exp').addEventListener('click', () => {
      expDiv.remove();
      collectExperience();
      updatePreview();
      saveToStorage();
    });
    expDiv.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        collectExperience();
        updatePreview();
        saveToStorage();
      });
    });
  }

  function collectExperience() {
    const items = document.querySelectorAll('#expContainer .dynamic-item');
    resumeData.experience = [];
    items.forEach(item => {
      const title = item.querySelector('.exp-title')?.value || '';
      const company = item.querySelector('.exp-company')?.value || '';
      const start = item.querySelector('.exp-start')?.value || '';
      const end = item.querySelector('.exp-end')?.value || '';
      const desc = item.querySelector('.exp-desc')?.value || '';
      if (title || company || start || end || desc) {
        resumeData.experience.push({ title, company, start, end, desc });
      }
    });
  }

  function restoreExperience() {
    expContainer.innerHTML = '';
    resumeData.experience.forEach((exp, index) => {
      expCount++;
      const expDiv = document.createElement('div');
      expDiv.className = 'dynamic-item';
      expDiv.innerHTML = `
        <input type="text" placeholder="Job Title" class="exp-title" value="${exp.title || ''}">
        <input type="text" placeholder="Company" class="exp-company" value="${exp.company || ''}">
        <div style="display:flex; gap:0.5rem;">
          <input type="text" placeholder="Start Date" class="exp-start" value="${exp.start || ''}" style="flex:1;">
          <input type="text" placeholder="End Date" class="exp-end" value="${exp.end || ''}" style="flex:1;">
        </div>
        <textarea placeholder="Responsibilities (bullet points)" class="exp-desc" rows="2">${exp.desc || ''}</textarea>
        <button class="remove-exp btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
      `;
      expContainer.appendChild(expDiv);
      expDiv.querySelector('.remove-exp').addEventListener('click', () => {
        expDiv.remove();
        collectExperience();
        updatePreview();
        saveToStorage();
      });
      expDiv.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          collectExperience();
          updatePreview();
          saveToStorage();
        });
      });
    });
  }

  addExp.addEventListener('click', addExperience);

  // ----- Dynamic Projects -----
  function addProject() {
    projectCount++;
    const projDiv = document.createElement('div');
    projDiv.className = 'dynamic-item';
    projDiv.innerHTML = `
      <input type="text" placeholder="Project Title" class="proj-title">
      <textarea placeholder="Description" class="proj-desc" rows="2"></textarea>
      <input type="text" placeholder="Technologies used" class="proj-tech">
      <input type="url" placeholder="GitHub/Demo Link" class="proj-link">
      <button class="remove-proj btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
    `;
    projectContainer.appendChild(projDiv);
    projDiv.querySelector('.remove-proj').addEventListener('click', () => {
      projDiv.remove();
      collectProjects();
      updatePreview();
      saveToStorage();
    });
    projDiv.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => {
        collectProjects();
        updatePreview();
        saveToStorage();
      });
    });
  }

  function collectProjects() {
    const items = document.querySelectorAll('#projectContainer .dynamic-item');
    resumeData.projects = [];
    items.forEach(item => {
      const title = item.querySelector('.proj-title')?.value || '';
      const desc = item.querySelector('.proj-desc')?.value || '';
      const tech = item.querySelector('.proj-tech')?.value || '';
      const link = item.querySelector('.proj-link')?.value || '';
      if (title || desc || tech || link) {
        resumeData.projects.push({ title, desc, tech, link });
      }
    });
  }

  function restoreProjects() {
    projectContainer.innerHTML = '';
    resumeData.projects.forEach((proj, index) => {
      projectCount++;
      const projDiv = document.createElement('div');
      projDiv.className = 'dynamic-item';
      projDiv.innerHTML = `
        <input type="text" placeholder="Project Title" class="proj-title" value="${proj.title || ''}">
        <textarea placeholder="Description" class="proj-desc" rows="2">${proj.desc || ''}</textarea>
        <input type="text" placeholder="Technologies used" class="proj-tech" value="${proj.tech || ''}">
        <input type="url" placeholder="GitHub/Demo Link" class="proj-link" value="${proj.link || ''}">
        <button class="remove-proj btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
      `;
      projectContainer.appendChild(projDiv);
      projDiv.querySelector('.remove-proj').addEventListener('click', () => {
        projDiv.remove();
        collectProjects();
        updatePreview();
        saveToStorage();
      });
      projDiv.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => {
          collectProjects();
          updatePreview();
          saveToStorage();
        });
      });
    });
  }

  addProject.addEventListener('click', addProject);

  // ----- Dynamic Certifications -----
  function addCert() {
    certCount++;
    const certDiv = document.createElement('div');
    certDiv.className = 'dynamic-item';
    certDiv.innerHTML = `
      <input type="text" placeholder="Certificate Name" class="cert-name">
      <input type="text" placeholder="Organization" class="cert-org">
      <input type="text" placeholder="Year" class="cert-year">
      <button class="remove-cert btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
    `;
    certContainer.appendChild(certDiv);
    certDiv.querySelector('.remove-cert').addEventListener('click', () => {
      certDiv.remove();
      collectCertifications();
      updatePreview();
      saveToStorage();
    });
    certDiv.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        collectCertifications();
        updatePreview();
        saveToStorage();
      });
    });
  }

  function collectCertifications() {
    const items = document.querySelectorAll('#certContainer .dynamic-item');
    resumeData.certifications = [];
    items.forEach(item => {
      const name = item.querySelector('.cert-name')?.value || '';
      const org = item.querySelector('.cert-org')?.value || '';
      const year = item.querySelector('.cert-year')?.value || '';
      if (name || org || year) {
        resumeData.certifications.push({ name, org, year });
      }
    });
  }

  function restoreCertifications() {
    certContainer.innerHTML = '';
    resumeData.certifications.forEach((cert, index) => {
      certCount++;
      const certDiv = document.createElement('div');
      certDiv.className = 'dynamic-item';
      certDiv.innerHTML = `
        <input type="text" placeholder="Certificate Name" class="cert-name" value="${cert.name || ''}">
        <input type="text" placeholder="Organization" class="cert-org" value="${cert.org || ''}">
        <input type="text" placeholder="Year" class="cert-year" value="${cert.year || ''}">
        <button class="remove-cert btn btn-secondary" style="margin-top:0.5rem;">Remove</button>
      `;
      certContainer.appendChild(certDiv);
      certDiv.querySelector('.remove-cert').addEventListener('click', () => {
        certDiv.remove();
        collectCertifications();
        updatePreview();
        saveToStorage();
      });
      certDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
          collectCertifications();
          updatePreview();
          saveToStorage();
        });
      });
    });
  }

  addCert.addEventListener('click', addCert);

  // ----- Skills (tag input) -----
  function renderSkills() {
    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tag.addEventListener('click', () => {
        skills = skills.filter(s => s !== skill);
        renderSkills();
        saveCurrentStep();
        updatePreview();
      });
      skillsContainer.appendChild(tag);
    });
  }

  skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && skillInput.value.trim()) {
      e.preventDefault();
      const newSkill = skillInput.value.trim();
      if (!skills.includes(newSkill)) {
        skills.push(newSkill);
        renderSkills();
        skillInput.value = '';
        saveCurrentStep();
        updatePreview();
      }
    }
  });

  document.querySelectorAll('.skill-suggestion').forEach(btn => {
    btn.addEventListener('click', () => {
      const skill = btn.dataset.skill;
      if (!skills.includes(skill)) {
        skills.push(skill);
        renderSkills();
        saveCurrentStep();
        updatePreview();
      }
    });
  });

  // ----- Extra sections toggle -----
  showLanguages.addEventListener('change', () => {
    languagesSection.style.display = showLanguages.checked ? 'block' : 'none';
    updatePreview();
  });
  showHobbies.addEventListener('change', () => {
    hobbiesSection.style.display = showHobbies.checked ? 'block' : 'none';
    updatePreview();
  });
  showVolunteer.addEventListener('change', () => {
    volunteerSection.style.display = showVolunteer.checked ? 'block' : 'none';
    updatePreview();
  });

  [languages, hobbies, volunteer].forEach(input => {
    input.addEventListener('input', () => {
      saveCurrentStep();
      updatePreview();
    });
  });

  // ----- Live Preview -----
  function updatePreview() {
    const previewDiv = document.getElementById('resumePreview');
    const data = resumeData;
    const template = selectedTemplate;

    let html = `<h1>${data.personal.fullName || 'Your Name'}</h1>`;
    if (data.personal.jobTitle) html += `<div class="job-title">${data.personal.jobTitle}</div>`;

    html += `<div class="contact-info" style="display:flex; flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">`;
    if (data.personal.phone) html += `<span>📞 ${data.personal.phone}</span>`;
    if (data.personal.email) html += `<span>✉️ ${data.personal.email}</span>`;
    if (data.personal.linkedin) html += `<span>🔗 <a href="${data.personal.linkedin}">LinkedIn</a></span>`;
    if (data.personal.portfolio) html += `<span>🌐 <a href="${data.personal.portfolio}">Portfolio</a></span>`;
    if (data.personal.address) html += `<span>📍 ${data.personal.address}</span>`;
    html += `</div>`;

    // Summary
    if (data.summary) {
      html += `<div class="section"><div class="section-title">Professional Summary</div><p>${data.summary}</p></div>`;
    }

    // Education
    if (data.education.length > 0) {
      html += `<div class="section"><div class="section-title">Education</div>`;
      data.education.forEach(edu => {
        html += `<div class="item">`;
        if (edu.degree) html += `<div class="item-header">${edu.degree}</div>`;
        if (edu.school) html += `<div>${edu.school}${edu.board ? ', ' + edu.board : ''}</div>`;
        if (edu.year || edu.percent) html += `<div class="item-sub">${edu.year || ''} ${edu.percent ? '| ' + edu.percent : ''}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Experience
    if (data.experience.length > 0) {
      html += `<div class="section"><div class="section-title">Experience</div>`;
      data.experience.forEach(exp => {
        html += `<div class="item">`;
        html += `<div class="item-header">${exp.title || ''} at ${exp.company || ''}</div>`;
        if (exp.start || exp.end) html += `<div class="item-sub">${exp.start || ''} - ${exp.end || ''}</div>`;
        if (exp.desc) html += `<p>${exp.desc.replace(/\n/g, '<br>')}</p>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Skills
    if (skills.length > 0) {
      html += `<div class="section"><div class="section-title">Skills</div><p>`;
      skills.forEach(skill => {
        html += `<span class="skill-tag">${skill}</span> `;
      });
      html += `</p></div>`;
    }

    // Projects
    if (data.projects.length > 0) {
      html += `<div class="section"><div class="section-title">Projects</div>`;
      data.projects.forEach(proj => {
        html += `<div class="item">`;
        if (proj.title) html += `<div class="item-header">${proj.title}</div>`;
        if (proj.desc) html += `<p>${proj.desc.replace(/\n/g, '<br>')}</p>`;
        if (proj.tech) html += `<div class="item-sub">Technologies: ${proj.tech}</div>`;
        if (proj.link) html += `<div><a href="${proj.link}">Project Link</a></div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Certifications
    if (data.certifications.length > 0) {
      html += `<div class="section"><div class="section-title">Certifications</div>`;
      data.certifications.forEach(cert => {
        html += `<div class="item">`;
        if (cert.name) html += `<div class="item-header">${cert.name}</div>`;
        if (cert.org || cert.year) html += `<div class="item-sub">${cert.org || ''} ${cert.year ? '· ' + cert.year : ''}</div>`;
        html += `</div>`;
      });
      html += `</div>`;
    }

    // Extras
    if (showLanguages.checked && data.extras.languages) {
      html += `<div class="section"><div class="section-title">Languages</div><p>${data.extras.languages}</p></div>`;
    }
    if (showHobbies.checked && data.extras.hobbies) {
      html += `<div class="section"><div class="section-title">Hobbies</div><p>${data.extras.hobbies}</p></div>`;
    }
    if (showVolunteer.checked && data.extras.volunteer) {
      html += `<div class="section"><div class="section-title">Volunteer</div><p>${data.extras.volunteer}</p></div>`;
    }

    // Apply template styles
    if (template === 'modern') {
      // default
    } else if (template === 'minimal') {
      html = html.replace(/<h1>/g, '<h1 style="font-weight:400;">');
    } else if (template === 'fresher') {
      html = html.replace(/<h1>/g, '<h1 style="color:var(--deep-blue);">');
    } else if (template === 'creative') {
      html = '<div style="background:#f0f9ff; padding:1rem; border-radius:0.5rem;">' + html + '</div>';
    } else if (template === 'executive') {
      html = html.replace(/<div class="section-title">/g, '<div class="section-title" style="color:#F59E0B;">');
    }

    previewDiv.innerHTML = html;
  }

  // ----- ATS Score Calculation -----
  function updateATSScore() {
    let score = 50; // base
    if (resumeData.personal.fullName) score += 5;
    if (resumeData.summary) score += 10;
    if (resumeData.education.length > 0) score += 10;
    if (skills.length > 0) score += 10;
    if (resumeData.experience.length > 0) score += 15;
    if (resumeData.projects.length > 0) score += 5;
    if (resumeData.certifications.length > 0) score += 5;
    score = Math.min(100, score);

    const meterFill = document.getElementById('meterFill');
    const atsScoreSpan = document.getElementById('atsScore');
    const tipSpan = document.getElementById('improvementTip');
    if (meterFill) meterFill.style.width = score + '%';
    if (atsScoreSpan) atsScoreSpan.textContent = score + '%';

    // Improvement tips
    if (score < 60) {
      tipSpan.textContent = 'Tip: Add more sections (skills, projects, certifications) to improve your score.';
    } else if (score < 80) {
      tipSpan.textContent = 'Tip: Add detailed work experience and a professional summary.';
    } else {
      tipSpan.textContent = 'Great! Your resume is well-optimized.';
    }
  }

  // ----- Download PDF -----
  downloadPdf.addEventListener('click', () => {
    const element = document.getElementById('resumePreview');
    const opt = {
      margin:       0.5,
      filename:     'resume.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  });

  // ----- Download DOC (HTML format) -----
  downloadDoc.addEventListener('click', () => {
    const content = document.getElementById('resumePreview').innerHTML;
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1E3A8A; }
        .skill-tag { display: inline-block; background: #10B981; color: white; padding: 0.2rem 0.5rem; border-radius: 2rem; margin: 0.1rem; }
        .contact-info { margin-bottom: 1rem; }
        .section-title { font-weight: 600; border-bottom: 1px solid #ccc; margin-bottom: 0.5rem; }
      </style>
    `;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title>${style}</head><body>${content}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.doc';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ----- Print -----
  printResume.addEventListener('click', () => {
    window.print();
  });

  // ----- Zoom controls -----
  if (zoomIn && zoomOut && zoomLevel && resumePreview) {
    zoomIn.addEventListener('click', () => {
      currentZoom = Math.min(1.5, currentZoom + 0.1);
      resumePreview.style.transform = `scale(${currentZoom})`;
      zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    });
    zoomOut.addEventListener('click', () => {
      currentZoom = Math.max(0.5, currentZoom - 0.1);
      resumePreview.style.transform = `scale(${currentZoom})`;
      zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    });
  }

  // ----- Auto-save on input -----
  [fullName, jobTitle, phone, email, linkedin, portfolio, address, summary].forEach(input => {
    if (input) input.addEventListener('input', () => {
      saveCurrentStep();
      updatePreview();
    });
  });

  // ----- Initialize first items -----
  addEducation();
  addExperience();
  addProject();
  addCert();

  // ----- Drag & Drop reorder (SortableJS) -----
  new Sortable(eduContainer, {
    animation: 150,
    onEnd: () => {
      collectEducation();
      updatePreview();
      saveToStorage();
    }
  });
  new Sortable(expContainer, {
    animation: 150,
    onEnd: () => {
      collectExperience();
      updatePreview();
      saveToStorage();
    }
  });
  new Sortable(projectContainer, {
    animation: 150,
    onEnd: () => {
      collectProjects();
      updatePreview();
      saveToStorage();
    }
  });
  new Sortable(certContainer, {
    animation: 150,
    onEnd: () => {
      collectCertifications();
      updatePreview();
      saveToStorage();
    }
  });

  // Initial update
  updatePreview();
});