const counts = {
  em: 0,
  ei: 0,
  km: 0,
  ki: 0
};

const form = document.getElementById('todoForm');
const taskInput = document.getElementById('taskInput');
const timeSelect = document.getElementById('timeSelect');
const typeSelect = document.getElementById('typeSelect');
const table = document.getElementById('todoTable');

const sectionRows = {
  em: [1, 2, 3],
  ei: [4, 5, 6],
  km: [7, 8, 9],
  ki: [10, 11, 12]
};

const sectionStartMap = {
  em: 0,
  ei: 3,
  km: 6,
  ki: 9
};

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  const timeVal = timeSelect.value;
  const typeVal = typeSelect.value;

  if (!taskText) return;

  const key = timeVal + typeVal;
  counts[key]++;
  const index = counts[key];

  if (index <= 3) {
    const rowIndex = sectionRows[key][index - 1];
    const targetRow = table.rows[rowIndex];
    if (targetRow) {
      const taskCell = targetRow.querySelector('.task-text') || targetRow.cells[0];
      taskCell.textContent = `${index}. ${taskText}`;
    }
  } else {
    const baseIndex = sectionStartMap[key];
    const insertRowIndex = baseIndex + index;

    const newRow = table.insertRow(insertRowIndex);
    const cellTask = newRow.insertCell(0);
    const cellStatus = newRow.insertCell(1);

    cellTask.className = 'task-text';
    cellTask.textContent = `${index}. ${taskText}`;
    cellStatus.innerHTML = `
      <select class="status-select">
        <option value="todo" selected>To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>
    `;

    const timeCellRowspan = table.rows[baseIndex < 6 ? 1 : 7].cells[0];
    const typeCellRowspan = table.rows[baseIndex + 1].cells[typeVal === 'm' ? 1 : 0];
    
    if (timeCellRowspan) timeCellRowspan.rowSpan = parseInt(timeCellRowspan.rowSpan) + 1;
    if (typeCellRowspan) typeCellRowspan.rowSpan = parseInt(typeCellRowspan.rowSpan) + 1;
  }

  taskInput.value = '';
});