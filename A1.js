/**
 * DUDU — Productivity Planner for Team A1
 * Pure Vanilla JavaScript Application
 * Features:
 *  - Multilingual support (English / Uzbek)
 *  - Dynamic Task Management (CRUD)
 *  - Drag-and-Drop & One-Click Task Moving between Mandatory & Optional
 *  - Completion tracking with reactive counters
 *  - LocalStorage persistence for tasks and language
 */

(function () {
  'use strict';

  // ================= STORAGE KEYS =================
  const STORAGE_KEY_TASKS = 'dudu_tasks_a1';
  const STORAGE_KEY_LANG = 'dudu_lang_a1';

  // ================= I18N DICTIONARY =================
  const I18N = {
    en: {
      teamBadge: 'TEAM A1',
      subtitle: 'Morning & Night Structured Productivity',
      completed: 'completed',
      addTaskPlaceholder: 'What needs to be done?...',
      addTaskBtn: 'Add Task',
      morning: 'Morning',
      night: 'Night',
      mandatory: 'Mandatory',
      optional: 'Optional',
      morningDesc: 'Kickstart your day with focus and high priority habits',
      nightDesc: 'Wrap up the day, reflect, and prepare for tomorrow',
      emptyMandatory: 'No mandatory tasks yet. Stay focused!',
      emptyOptional: 'No optional tasks yet. Add extra goals if you have time!',
      moveToMandatory: '⇄ Mandatory',
      moveToOptional: '⇄ Optional',
      moveToNight: '🌙 Night',
      moveToMorning: '☀️ Morning',
      deleteTask: 'Delete',
      clearCompletedText: 'Clear Completed',
      confirmClearCompleted: 'Are you sure you want to clear all completed tasks?',
      quickAddTitle: 'Quick Add to this category'
    },
    uz: {
      teamBadge: 'A1 JAMOASI',
      subtitle: 'Ertalab va Kechqurun uchun unumdor rejalashtiruvchi',
      completed: 'bajarildi',
      addTaskPlaceholder: 'Qanday vazifa bajarilishi kerak?...',
      addTaskBtn: 'Vazifa qo‘shish',
      morning: 'Ertalab',
      night: 'Kechqurun',
      mandatory: 'Majburiy',
      optional: 'Ixtiyoriy',
      morningDesc: 'Kuningizni muhim vazifalar va diqqat bilan boshlang',
      nightDesc: 'Kuningizni yakunlang, sarhisob qiling va ertaga tayyorlaning',
      emptyMandatory: 'Hozircha majburiy vazifalar yo‘q. Rejalashtiring!',
      emptyOptional: 'Ixtiyoriy vazifalar yo‘q. Bo‘sh vaqt uchun qo‘shing!',
      moveToMandatory: '⇄ Majburiyga',
      moveToOptional: '⇄ Ixtiyoriyga',
      moveToNight: '🌙 Kechqurunga',
      moveToMorning: '☀️ Ertalabga',
      deleteTask: 'O‘chirish',
      clearCompletedText: 'Bajarilganlarni tozalash',
      confirmClearCompleted: 'Haqiqatan ham barcha bajarilgan vazifalarni tozalashni xohlaysizmi?',
      quickAddTitle: 'Ushbu bo‘limga tezkor qo‘shish'
    }
  };

  // Default seed tasks for first-time visitors
  const DEFAULT_TASKS = [
    {
      id: 'task-init-1',
      text: 'Drink 500ml water & review day objectives',
      section: 'morning',
      category: 'mandatory',
      completed: true,
      createdAt: 1
    },
    {
      id: 'task-init-2',
      text: 'Listen to 15m tech / self-growth podcast',
      section: 'morning',
      category: 'optional',
      completed: false,
      createdAt: 2
    },
    {
      id: 'task-init-3',
      text: 'Review daily code commits & push project changes',
      section: 'night',
      category: 'mandatory',
      completed: false,
      createdAt: 3
    },
    {
      id: 'task-init-4',
      text: 'Read 15 pages of system architecture book',
      section: 'night',
      category: 'optional',
      completed: false,
      createdAt: 4
    }
  ];

  // ================= APPLICATION STATE =================
  let currentLanguage = localStorage.getItem(STORAGE_KEY_LANG) || 'en';
  let tasks = [];

  try {
    const rawTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    tasks = rawTasks ? JSON.parse(rawTasks) : DEFAULT_TASKS;
    if (!Array.isArray(tasks)) tasks = DEFAULT_TASKS;
  } catch (err) {
    console.error('Failed to parse saved tasks:', err);
    tasks = DEFAULT_TASKS;
  }

  // ================= DOM ELEMENT REFERENCES =================
  const taskForm = document.getElementById('global-task-form');
  const taskInput = document.getElementById('task-input');
  const sectionSelect = document.getElementById('section-select');
  const categorySelect = document.getElementById('category-select');
  const langEnBtn = document.getElementById('lang-en');
  const langUzBtn = document.getElementById('lang-uz');
  const completedCountEl = document.getElementById('completed-count');
  const totalCountEl = document.getElementById('total-count');
  const progressBarFillEl = document.getElementById('progress-bar-fill');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Containers for the 4 distinct areas
  const dropzones = {
    'morning-mandatory': document.getElementById('list-morning-mandatory'),
    'morning-optional': document.getElementById('list-morning-optional'),
    'night-mandatory': document.getElementById('list-night-mandatory'),
    'night-optional': document.getElementById('list-night-optional')
  };

  // Counter badges
  const counterElements = {
    'morning-mandatory': document.getElementById('count-morning-mandatory'),
    'morning-optional': document.getElementById('count-morning-optional'),
    'night-mandatory': document.getElementById('count-night-mandatory'),
    'night-optional': document.getElementById('count-night-optional'),
    'morning-total': document.getElementById('morning-total-chip'),
    'night-total': document.getElementById('night-total-chip')
  };

  // ================= STORAGE HELPERS =================
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }

  function saveLanguage(lang) {
    currentLanguage = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {
      console.error('Failed to save language to localStorage:', e);
    }
  }

  // ================= I18N RENDERER =================
  function applyLanguage(lang) {
    saveLanguage(lang);

    // Update active class on buttons
    if (lang === 'uz') {
      langUzBtn.classList.add('active');
      langEnBtn.classList.remove('active');
      document.documentElement.lang = 'uz';
    } else {
      langEnBtn.classList.add('active');
      langUzBtn.classList.remove('active');
      document.documentElement.lang = 'en';
    }

    const dict = I18N[lang] || I18N.en;

    // Update data-i18n text
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update select dropdown labels
    Array.from(sectionSelect.options).forEach((opt) => {
      const key = opt.getAttribute('data-i18n');
      if (dict[key]) opt.textContent = dict[key];
    });

    Array.from(categorySelect.options).forEach((opt) => {
      const key = opt.getAttribute('data-i18n');
      if (dict[key]) opt.textContent = dict[key];
    });

    // Re-render task board so cards and empty states display translated buttons
    renderBoard();
  }

  // ================= TASK MANAGEMENT (CRUD & MOVES) =================
  function addTask(text, section, category) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      text: cleanText,
      section: section || 'morning',
      category: category || 'mandatory',
      completed: false,
      createdAt: Date.now()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderBoard();
  }

  function deleteTask(id) {
    const cardEl = document.querySelector(`[data-task-id="${id}"]`);
    if (cardEl) {
      cardEl.style.transition = 'all 0.2s ease';
      cardEl.style.opacity = '0';
      cardEl.style.transform = 'scale(0.9)';
      setTimeout(() => {
        tasks = tasks.filter((t) => t.id !== id);
        saveTasks();
        renderBoard();
      }, 180);
    } else {
      tasks = tasks.filter((t) => t.id !== id);
      saveTasks();
      renderBoard();
    }
  }

  function toggleTaskCompletion(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    renderBoard();
  }

  // Move task category between "mandatory" and "optional"
  function toggleTaskCategory(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.category = task.category === 'mandatory' ? 'optional' : 'mandatory';
    saveTasks();
    renderBoard();
  }

  // Switch task section between "morning" and "night"
  function toggleTaskSection(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.section = task.section === 'morning' ? 'night' : 'morning';
    saveTasks();
    renderBoard();
  }

  // Move task to arbitrary target section and category (used by Drag-and-Drop)
  function moveTask(id, targetSection, targetCategory) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.section === targetSection && task.category === targetCategory) return;

    task.section = targetSection;
    task.category = targetCategory;
    saveTasks();
    renderBoard();
  }

  function clearAllCompleted() {
    const completedTasks = tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    const dict = I18N[currentLanguage] || I18N.en;
    if (window.confirm(dict.confirmClearCompleted)) {
      tasks = tasks.filter((t) => !t.completed);
      saveTasks();
      renderBoard();
    }
  }

  // Helper to escape HTML characters safely
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ================= UI RENDERING =================
  function renderBoard() {
    const dict = I18N[currentLanguage] || I18N.en;

    // Clear all 4 dropzones
    Object.values(dropzones).forEach((zone) => {
      if (zone) zone.innerHTML = '';
    });

    // Counts tracking
    const counts = {
      'morning-mandatory': 0,
      'morning-optional': 0,
      'night-mandatory': 0,
      'night-optional': 0
    };

    let totalCompleted = 0;

    // Populate task cards
    tasks.forEach((task) => {
      if (task.completed) totalCompleted++;

      const zoneKey = `${task.section}-${task.category}`;
      if (counts[zoneKey] !== undefined) {
        counts[zoneKey]++;
      }

      const targetZone = dropzones[zoneKey];
      if (targetZone) {
        const card = createTaskCardElement(task, dict);
        targetZone.appendChild(card);
      }
    });

    // Render Empty States if a column has 0 tasks
    Object.keys(dropzones).forEach((zoneKey) => {
      const zone = dropzones[zoneKey];
      if (zone && counts[zoneKey] === 0) {
        const isMandatory = zoneKey.endsWith('mandatory');
        const emptyMsg = isMandatory ? dict.emptyMandatory : dict.emptyOptional;

        const emptyEl = document.createElement('div');
        emptyEl.className = 'empty-placeholder animate-in';
        emptyEl.innerHTML = `
          <svg class="empty-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
          <span class="empty-text">${emptyMsg}</span>
        `;
        zone.appendChild(emptyEl);
      }
    });

    // Update Counter Badges
    if (counterElements['morning-mandatory']) counterElements['morning-mandatory'].textContent = counts['morning-mandatory'];
    if (counterElements['morning-optional']) counterElements['morning-optional'].textContent = counts['morning-optional'];
    if (counterElements['night-mandatory']) counterElements['night-mandatory'].textContent = counts['night-mandatory'];
    if (counterElements['night-optional']) counterElements['night-optional'].textContent = counts['night-optional'];

    const morningTotal = counts['morning-mandatory'] + counts['morning-optional'];
    const nightTotal = counts['night-mandatory'] + counts['night-optional'];

    if (counterElements['morning-total']) counterElements['morning-total'].textContent = morningTotal;
    if (counterElements['night-total']) counterElements['night-total'].textContent = nightTotal;

    // Header Progress Bar & Count
    const totalTasks = tasks.length;
    if (completedCountEl) completedCountEl.textContent = totalCompleted;
    if (totalCountEl) totalCountEl.textContent = totalTasks;

    const percent = totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);
    if (progressBarFillEl) progressBarFillEl.style.width = percent + '%';
  }

  // Factory function to build task card element
  function createTaskCardElement(task, dict) {
    const card = document.createElement('article');
    card.className = `task-card animate-in ${task.completed ? 'completed' : ''}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-task-id', task.id);
    card.setAttribute('data-section', task.section);
    card.setAttribute('data-category', task.category);

    const isMandatory = task.category === 'mandatory';
    const isMorning = task.section === 'morning';

    // Move category label: if mandatory, button offers move to optional, and vice versa
    const moveCategoryLabel = isMandatory ? dict.moveToOptional : dict.moveToMandatory;
    // Section switch label: if morning, button offers switch to night, and vice versa
    const switchSectionLabel = isMorning ? dict.moveToNight : dict.moveToMorning;

    card.innerHTML = `
      <div class="task-card-main">
        <label class="task-checkbox-wrap" aria-label="Mark task done">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} />
        </label>
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <div class="task-controls">
        <div class="task-badges-row">
          <span class="category-tag ${isMandatory ? 'tag-mandatory' : 'tag-optional'}">
            ${isMandatory ? dict.mandatory : dict.optional}
          </span>
        </div>
        <div class="card-actions-group">
          <!-- Move Category Button (Mandatory <-> Optional) -->
          <button type="button" class="card-btn btn-move-category" title="Change priority category">
            ${moveCategoryLabel}
          </button>
          
          <!-- Move Time Button (Morning <-> Night) -->
          <button type="button" class="card-btn btn-switch-section" title="Change time of day">
            ${switchSectionLabel}
          </button>

          <!-- Delete Button -->
          <button type="button" class="card-btn btn-delete-task" title="${dict.deleteTask}" aria-label="${dict.deleteTask}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Hook Events
    const checkbox = card.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

    const moveCatBtn = card.querySelector('.btn-move-category');
    moveCatBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskCategory(task.id);
    });

    const switchSecBtn = card.querySelector('.btn-switch-section');
    switchSecBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskSection(task.id);
    });

    const deleteBtn = card.querySelector('.btn-delete-task');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task.id);
    });

    // Native Drag and Drop listeners on the card
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    return card;
  }

  // ================= DRAG AND DROP HANDLERS =================
  let draggedTaskId = null;

  function handleDragStart(e) {
    draggedTaskId = this.getAttribute('data-task-id');
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTaskId);
  }

  function handleDragEnd() {
    this.classList.remove('dragging');
    draggedTaskId = null;
    document.querySelectorAll('.task-list').forEach((zone) => {
      zone.classList.remove('drag-over');
    });
  }

  // Setup dropzones for Drag and Drop
  function setupDropzones() {
    Object.entries(dropzones).forEach(([key, zone]) => {
      if (!zone) return;

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', (e) => {
        if (!zone.contains(e.relatedTarget)) {
          zone.classList.remove('drag-over');
        }
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
        if (!id) return;

        const [targetSection, targetCategory] = key.split('-');
        moveTask(id, targetSection, targetCategory);
      });
    });
  }

  // ================= GLOBAL EVENT LISTENERS =================
  function setupEventListeners() {
    // Form Submit (Global Task Add)
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value;
        const section = sectionSelect.value;
        const category = categorySelect.value;

        if (text.trim()) {
          addTask(text, section, category);
          taskInput.value = '';
          taskInput.focus();
        }
      });
    }

    // Language Buttons
    if (langEnBtn) {
      langEnBtn.addEventListener('click', () => applyLanguage('en'));
    }
    if (langUzBtn) {
      langUzBtn.addEventListener('click', () => applyLanguage('uz'));
    }

    // Clear completed button
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', clearAllCompleted);
    }

    // Quick Add buttons on Column Headers
    document.querySelectorAll('.quick-add-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = btn.getAttribute('data-section');
        const cat = btn.getAttribute('data-category');

        if (sectionSelect) sectionSelect.value = sec;
        if (categorySelect) categorySelect.value = cat;

        taskInput.focus();
        taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // ================= INITIALIZATION =================
  function init() {
    setupDropzones();
    setupEventListeners();
    applyLanguage(currentLanguage);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
