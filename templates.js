
export function getTemplatesTabHTML() {
  return `
    <div class="space-y-4">
      <div class="info-banner">
        <div class="flex items-start gap-3">
          <div class="info-icon">�</div>
          <div>
            <h4 class="info-title">Template Answers</h4>
            <p class="info-text">Click a question to show answers. Click an answer to use it in a focused text field.</p>
          </div>
        </div>
      </div>
      <div id="templatesList" class="templates-container"></div>
      <div class="add-template-section">
        <h3 class="section-title">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add New Template
        </h3>
        <div class="space-y-3">
          <input type="text" id="newTemplateQuestion" placeholder="Question/Topic (e.g., Why should we hire you?)" class="input-field">
          <textarea id="newTemplateAnswer" placeholder="Template answer..." rows="3" class="input-field resize-none"></textarea>
          <button id="addTemplateBtn" class="btn-primary w-full flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Add Template
          </button>
        </div>
      </div>
    </div>
  `;
}


export function populateTemplates(templates, showNotification, saveData) {
  const container = document.getElementById('templatesList');
  container.innerHTML = '';
  if (!templates || templates.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <p class="text-sm">No templates yet</p>
        <p class="text-xs mt-1">Add your first template below</p>
      </div>
    `;
    return;
  }
  templates.forEach(template => {
    const templateEl = document.createElement('div');
    templateEl.className = 'template-item';
    // Build the question/answers UI without inline event handlers
    templateEl.innerHTML = `
      <div class="template-header">
        <button class="template-question-dropdown" data-template-id="${template.id}">
          <span class="template-question-text">${template.question}</span>
          <span class="dropdown-arrow">
            <svg class="w-4 h-4 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </span>
        </button>
        <div class="template-actions">
          <button class="edit-template-btn" data-template-id="${template.id}" title="Edit template">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          <button class="delete-template-btn" data-template-id="${template.id}" title="Delete template">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="template-answers-dropdown" id="answers-${template.id}" style="display:none;">
        <div class="answers-container">
          ${template.answers.map((answer, index) => `
            <div class="template-answer-item" data-template-id="${template.id}" data-answer-index="${index}">
              <div class="answer-content" title="Click to use this template">
                ${answer.length > 150 ? answer.substring(0, 150) + '...' : answer}
              </div>
              <div class="answer-actions">
                <button class="edit-answer-btn" data-template-id="${template.id}" data-answer-index="${index}" title="Edit answer">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </button>
                <button class="delete-answer-btn" data-template-id="${template.id}" data-answer-index="${index}" title="Delete answer">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="add-answer-btn" data-template-id="${template.id}">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add New Answer
        </button>
      </div>
    `;
    container.appendChild(templateEl);
  });

  // Add dropdown toggle logic
  container.querySelectorAll('.template-question-dropdown').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-template-id');
      const answersDiv = document.getElementById(`answers-${id}`);
      const arrow = btn.querySelector('.dropdown-arrow svg');
      if (answersDiv) {
        const isVisible = answersDiv.style.display !== 'none';
        answersDiv.style.display = isVisible ? 'none' : 'block';
        if (arrow) {
          arrow.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      }
    });
  });

  // Add answer content click logic (for using templates)
  container.querySelectorAll('.answer-content').forEach(answerDiv => {
    answerDiv.addEventListener('click', (e) => {
      const parent = answerDiv.closest('.template-answer-item');
      const templateId = parent.getAttribute('data-template-id');
      const answerIndex = parent.getAttribute('data-answer-index');
      if (window.FillMatePopup && typeof window.FillMatePopup.useTemplate === 'function') {
        window.FillMatePopup.useTemplate(templateId, Number(answerIndex));
      }
    });
  });

  // Add edit template button logic
  container.querySelectorAll('.edit-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.getAttribute('data-template-id');
      if (window.FillMatePopup && typeof window.FillMatePopup.editTemplate === 'function') {
        window.FillMatePopup.editTemplate(templateId);
      }
    });
  });

  // Add delete template button logic
  container.querySelectorAll('.delete-template-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.getAttribute('data-template-id');
      if (window.FillMatePopup && typeof window.FillMatePopup.deleteTemplate === 'function') {
        window.FillMatePopup.deleteTemplate(templateId);
      }
    });
  });

  // Add edit answer button logic
  container.querySelectorAll('.edit-answer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.getAttribute('data-template-id');
      const answerIndex = btn.getAttribute('data-answer-index');
      if (window.FillMatePopup && typeof window.FillMatePopup.editAnswer === 'function') {
        window.FillMatePopup.editAnswer(templateId, Number(answerIndex));
      }
    });
  });

  // Add delete answer button logic
  container.querySelectorAll('.delete-answer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const templateId = btn.getAttribute('data-template-id');
      const answerIndex = btn.getAttribute('data-answer-index');
      if (window.FillMatePopup && typeof window.FillMatePopup.deleteAnswer === 'function') {
        window.FillMatePopup.deleteAnswer(templateId, Number(answerIndex));
      }
    });
  });

  // Add answer button logic
  container.querySelectorAll('.add-answer-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const templateId = btn.getAttribute('data-template-id');
      if (window.FillMatePopup && typeof window.FillMatePopup.addAnswerToTemplate === 'function') {
        window.FillMatePopup.addAnswerToTemplate(templateId);
      }
    });
  });
}

export async function addTemplate(templates, showNotification, saveData, populateTemplates) {
  const question = document.getElementById('newTemplateQuestion').value.trim();
  const answer = document.getElementById('newTemplateAnswer').value.trim();
  if (!question || !answer) {
    showNotification('Please fill in both question and answer', 'error');
    return;
  }
  const newTemplate = {
    id: Date.now().toString(),
    question,
    answers: [answer]
  };
  templates.push(newTemplate);
  await saveData({ templates });
  document.getElementById('newTemplateQuestion').value = '';
  document.getElementById('newTemplateAnswer').value = '';
  populateTemplates(templates, showNotification, saveData);
  showNotification('Template added successfully!');
}

export async function deleteTemplate(templateId, templates, showNotification, saveData, populateTemplates) {
  const newTemplates = templates.filter(t => t.id !== templateId);
  await saveData({ templates: newTemplates });
  populateTemplates(newTemplates, showNotification, saveData);
  showNotification('Template deleted');
}

export async function addAnswerToTemplate(templateId, templates, showNotification, saveData, populateTemplates) {
  const answer = prompt('Enter new answer:');
  if (answer && answer.trim()) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      template.answers.push(answer.trim());
      await saveData({ templates });
      populateTemplates(templates, showNotification, saveData);
      showNotification('Answer added to template!');
    }
  }
}

export async function useTemplate(templateId, answerIndex, templates, showNotification) {
  try {
    const template = templates.find(t => t.id === templateId);
    if (template && template.answers[answerIndex]) {
      const answer = template.answers[answerIndex];
      await navigator.clipboard.writeText(answer);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, {
        action: 'fillTemplate',
        template: answer
      });
      showNotification('Template copied and filled!');
      window.close();
    }
  } catch (error) {
    showNotification('Error using template', 'error');
    console.error('Error using template:', error);
  }
}
