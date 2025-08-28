
export function getTemplatesTabHTML() {
  return `
    <div class="space-y-4">
      <div class="info-banner">
        <div class="flex items-start gap-3">
          <div class="info-icon">💡</div>
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
    templateEl.innerHTML = `
      <div class="flex justify-between items-start mb-1">
        <button class="template-question-dropdown" data-template-id="${template.id}">
          <span class="template-question-text">${template.question}</span>
          <span class="dropdown-arrow">▼</span>
        </button>
        <button class="btn-danger opacity-70 hover:opacity-100" onclick="window.FillMatePopup.deleteTemplate('${template.id}')" title="Delete template">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="template-answers-dropdown" id="answers-${template.id}" style="display:none;">
        ${template.answers.map((answer, index) => `
          <div class="template-answer" onclick="window.FillMatePopup.useTemplate('${template.id}', ${index})" title="Click to use this template">
            ${answer.length > 120 ? answer.substring(0, 120) + '...' : answer}
          </div>
        `).join('')}
        <button class="btn-secondary text-xs mt-3 px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300" onclick="window.FillMatePopup.addAnswerToTemplate('${template.id}')">
          <svg class="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Add Answer
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
      if (answersDiv) {
        answersDiv.style.display = answersDiv.style.display === 'none' ? 'block' : 'none';
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
