// ==========================================================
// KUNLIK ISHLAR JADVALI - MAKSIMAL FUNKSIYALI JAVASCRIPT KODI
// ==========================================================

// 1. Dastlabki namunaviy ma'lumotlar
const defaultTasks = [
    // Ertalabki - Majburiy (E -> M)
    { id: 1, period: "E", type: "M", startTime: "07:00", endTime: "08:30", title: "Uyg‘onish, nonushta", completed: false },
    { id: 2, period: "E", type: "M", startTime: "08:30", endTime: "10:30", title: "Universitet / asosiy ish", completed: false },
    { id: 3, period: "E", type: "M", startTime: "10:30", endTime: "12:00", title: "Muhim topshiriqlar", completed: false },

    // Ertalabki - Ixtiyoriy (E -> I)
    { id: 4, period: "E", type: "I", startTime: "07:00", endTime: "08:00", title: "Sport", completed: false },
    { id: 5, period: "E", type: "I", startTime: "10:00", endTime: "11:00", title: "Ingliz tili", completed: false },
    { id: 6, period: "E", type: "I", startTime: "11:00", endTime: "12:00", title: "Kitob o‘qish", completed: false },

    // Kechki - Majburiy (K -> M)
    { id: 7, period: "K", type: "M", startTime: "18:00", endTime: "19:30", title: "Kechki ovqat va dam olish", completed: false },
    { id: 8, period: "K", type: "M", startTime: "19:30", endTime: "21:30", title: "Uy vazifalari", completed: false },
    { id: 9, period: "K", type: "M", startTime: "21:30", endTime: "23:00", title: "Ertangi kunga tayyorgarlik", completed: false },

    // Kechki - Ixtiyoriy (K -> I)
    { id: 10, period: "K", type: "I", startTime: "18:00", endTime: "20:00", title: "Sport / gym", completed: false },
    { id: 11, period: "K", type: "I", startTime: "20:00", endTime: "21:30", title: "Ingliz tili", completed: false },
    { id: 12, period: "K", type: "I", startTime: "21:30", endTime: "23:00", title: "Film yoki dam olish", completed: false }
];

// 2. LocalStorage dan o'qish yoki boshlang'ich qiymat berish
let tasks = JSON.parse(localStorage.getItem("daily_schedule_tasks"));
if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    tasks = defaultTasks;
    saveToLocalStorage();
}

// Holat o'zgaruvchilari (Filtr va Qidiruv)
let currentFilter = "all";
let searchQuery = "";

// HTML elementlarini chaqirib olish
const tableBody = document.getElementById("tableBody");
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const modalTitle = document.getElementById("modalTitle");
const editIndexInput = document.getElementById("editIndex");

const taskPeriodInput = document.getElementById("taskPeriod");
const taskTypeInput = document.getElementById("taskType");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");
const taskTitleInput = document.getElementById("taskTitle");

// Qo'shimcha boshqaruv elementlari
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const printBtn = document.getElementById("printBtn");
const sortBtn = document.getElementById("sortBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const resetDefaultBtn = document.getElementById("resetDefaultBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

// Statistika va Soat elementlari
const totalTasksCount = document.getElementById("totalTasksCount");
const completedTasksCount = document.getElementById("completedTasksCount");
const pendingTasksCount = document.getElementById("pendingTasksCount");
const progressBar = document.getElementById("progressBar");
const activeTaskAlert = document.getElementById("activeTaskAlert");
const liveDate = document.getElementById("liveDate");
const liveTime = document.getElementById("liveTime");

// ==========================================================
// 1. JONLI SOAT VA SANA FUNKSIYASI
// ==========================================================
function updateClock() {
    const now = new Date();

    // Sanani formatlash (Masalan: 3-Oktyabr, 2026, Shanba)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    liveDate.innerText = now.toLocaleDateString('uz-UZ', options);

    // Vaqtni formatlash (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    liveTime.innerText = `${hours}:${minutes}:${seconds}`;

    // Ayni daqiqadagi faol ishni tekshirish
    checkCurrentActiveTask(hours + ":" + minutes);
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================================
// 2. HOZIRGI VAQTDA BAJARILAYOTGAN ISHNI TEKSHIRISH
// ==========================================================
function checkCurrentActiveTask(currentTimeStr) {
    const currentTask = tasks.find(t => {
        return currentTimeStr >= t.startTime && currentTimeStr <= t.endTime;
    });

    if (currentTask) {
        activeTaskAlert.innerText = `Hozir: ${currentTask.title} (${currentTask.startTime} - ${currentTask.endTime})`;
        activeTaskAlert.style.backgroundColor = "#e6f7ff";
        activeTaskAlert.style.color = "#0050b3";
    } else {
        activeTaskAlert.innerText = "Hozirgi ish: Bo‘sh vaqt";
        activeTaskAlert.style.backgroundColor = "#f5f5f5";
        activeTaskAlert.style.color = "#777777";
    }
}

// ==========================================================
// 3. STATISTIKA VA PROGRESS BARNI YANGILASH
// ==========================================================
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksCount.innerText = total;
    completedTasksCount.innerText = completed;
    pendingTasksCount.innerText = pending;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = percentage + "%";
}

// ==========================================================
// 4. JADVALNI EKRANGA CHIQARISH (RENDER)
// ==========================================================
function renderTable() {
    tableBody.innerHTML = "";

    // Hozirgi soat va daqiqa (faol qatorni ajratish uchun)
    const now = new Date();
    const currentTimeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');

    // Filtrlash va qidiruvni qo'llaymiz
    const filteredTasksWithIndex = tasks.map((t, idx) => ({ ...t, originalIndex: idx })).filter(task => {
        // Qidiruv bo'yicha
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              task.startTime.includes(searchQuery) ||
                              task.endTime.includes(searchQuery);

        if (!matchesSearch) return false;

        // Filtr turi bo'yicha
        if (currentFilter === "M") return task.type === "M";
        if (currentFilter === "I") return task.type === "I";
        if (currentFilter === "completed") return task.completed;
        if (currentFilter === "pending") return !task.completed;
        return true;
    });

    // 4 ta toifaga ajratamiz
    const emTasks = filteredTasksWithIndex.filter(t => t.period === "E" && t.type === "M");
    const eiTasks = filteredTasksWithIndex.filter(t => t.period === "E" && t.type === "I");
    const kmTasks = filteredTasksWithIndex.filter(t => t.period === "K" && t.type === "M");
    const kiTasks = filteredTasksWithIndex.filter(t => t.period === "K" && t.type === "I");

    let html = "";
    html += renderPeriodGroup("E", emTasks, eiTasks, currentTimeStr);
    html += renderPeriodGroup("K", kmTasks, kiTasks, currentTimeStr);

    tableBody.innerHTML = html;
    updateStats();
}

// E va K bo'limlarini qatorlarga aylantirish
function renderPeriodGroup(periodLetter, mList, iList, currentTimeStr) {
    const mRows = mList.length > 0 ? mList.length : 1;
    const iRows = iList.length > 0 ? iList.length : 1;
    const totalPeriodRows = mRows + iRows;

    let groupHtml = "";

    // 1. M (Majburiy) qatorlari
    for (let i = 0; i < mRows; i++) {
        const task = mList[i];
        const isCurrent = task && (currentTimeStr >= task.startTime && currentTimeStr <= task.endTime);
        const rowClass = (task && task.completed ? "task-done " : "") + (isCurrent ? "task-current-active" : "");

        groupHtml += `<tr class="${rowClass.trim()}">`;

        // Birinchi qatorda E yoki K katagini chizamiz
        if (i === 0) {
            groupHtml += `<td class="center-cell" rowspan="${totalPeriodRows}">${periodLetter}</td>`;
            groupHtml += `<td class="center-cell" rowspan="${mRows}">M</td>`;
        }

        if (task) {
            groupHtml += `
                <td class="number-cell">${i + 1}.</td>
                <td class="checkbox-cell">
                    <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete(${task.originalIndex})" title="Bajarildi deb belgilash">
                </td>
                <td class="task-title-cell">
                    <strong>${task.startTime} - ${task.endTime}</strong> — ${escapeHtml(task.title)}
                    ${isCurrent ? ' <span style="color:#0050b3; font-weight:bold;">(Ayni vaqtda!)</span>' : ''}
                </td>
                <td class="actions-cell no-print">
                    <button class="btn-sm btn-edit" onclick="editTask(${task.originalIndex})" title="O‘zgartirish">✏ Tahrirlash</button>
                    <button class="btn-sm btn-copy" onclick="duplicateTask(${task.originalIndex})" title="Nusxasini olish">📋 Nusxa</button>
                    <button class="btn-sm btn-delete" onclick="deleteTask(${task.originalIndex})" title="O‘chirish">🗑 O‘chirish</button>
                </td>
            `;
        } else {
            groupHtml += `
                <td class="number-cell">-</td>
                <td class="checkbox-cell">-</td>
                <td class="empty-text">Bu bo‘limda ishlar mavjud emas</td>
                <td class="actions-cell no-print">-</td>
            `;
        }

        groupHtml += "</tr>";
    }

    // 2. I (Ixtiyoriy) qatorlari
    for (let j = 0; j < iRows; j++) {
        const task = iList[j];
        const isCurrent = task && (currentTimeStr >= task.startTime && currentTimeStr <= task.endTime);
        const rowClass = (task && task.completed ? "task-done " : "") + (isCurrent ? "task-current-active" : "");

        groupHtml += `<tr class="${rowClass.trim()}">`;

        if (j === 0) {
            groupHtml += `<td class="center-cell" rowspan="${iRows}">I</td>`;
        }

        if (task) {
            groupHtml += `
                <td class="number-cell">${j + 1}.</td>
                <td class="checkbox-cell">
                    <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete(${task.originalIndex})" title="Bajarildi deb belgilash">
                </td>
                <td class="task-title-cell">
                    <strong>${task.startTime} - ${task.endTime}</strong> — ${escapeHtml(task.title)}
                    ${isCurrent ? ' <span style="color:#0050b3; font-weight:bold;">(Ayni vaqtda!)</span>' : ''}
                </td>
                <td class="actions-cell no-print">
                    <button class="btn-sm btn-edit" onclick="editTask(${task.originalIndex})" title="O‘zgartirish">✏ Tahrirlash</button>
                    <button class="btn-sm btn-copy" onclick="duplicateTask(${task.originalIndex})" title="Nusxasini olish">📋 Nusxa</button>
                    <button class="btn-sm btn-delete" onclick="deleteTask(${task.originalIndex})" title="O‘chirish">🗑 O‘chirish</button>
                </td>
            `;
        } else {
            groupHtml += `
                <td class="number-cell">-</td>
                <td class="checkbox-cell">-</td>
                <td class="empty-text">Bu bo‘limda ishlar mavjud emas</td>
                <td class="actions-cell no-print">-</td>
            `;
        }

        groupHtml += "</tr>";
    }

    return groupHtml;
}

// HTML xavfsizligi (XSS hujumlaridan himoya)
function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

// ==========================================================
// 5. LOCALSTORAGE GA SAQLASH
// ==========================================================
function saveToLocalStorage() {
    localStorage.setItem("daily_schedule_tasks", JSON.stringify(tasks));
}

// ==========================================================
// 6. BAJARILGANLIK HOLATINI O'ZGARTIRISH (CHECKBOX)
// ==========================================================
function toggleComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    saveToLocalStorage();
    renderTable();
}

// ==========================================================
// 7. MODAL OYNA BILAN ISHLASH (OCHISH / YOPISH)
// ==========================================================
function openModal(isEdit = false, index = -1) {
    taskModal.classList.add("show");

    if (isEdit) {
        modalTitle.innerText = "Ishni tahrirlash";
        const task = tasks[index];
        editIndexInput.value = index;
        taskPeriodInput.value = task.period;
        taskTypeInput.value = task.type;
        startTimeInput.value = task.startTime;
        endTimeInput.value = task.endTime;
        taskTitleInput.value = task.title;
    } else {
        modalTitle.innerText = "Yangi ish qo‘shish";
        editIndexInput.value = "-1";
        taskForm.reset();
        startTimeInput.value = "09:00";
        endTimeInput.value = "10:30";
    }
}

function closeModal() {
    taskModal.classList.remove("show");
    taskForm.reset();
}

openModalBtn.addEventListener("click", () => openModal(false));
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
    if (e.target === taskModal) closeModal();
});

// ==========================================================
// 8. ISHNI SAQLASH (QO'SHISH YOKI TAHRIRLASH)
// ==========================================================
taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const index = parseInt(editIndexInput.value);

    // Vaqt boshlanishi va tugashini tekshirish
    if (startTimeInput.value >= endTimeInput.value) {
        alert("Boshlanish vaqti tugash vaqtidan oldinroq bo‘lishi kerak!");
        return;
    }

    const taskData = {
        id: index === -1 ? Date.now() : tasks[index].id,
        period: taskPeriodInput.value,
        type: taskTypeInput.value,
        startTime: startTimeInput.value,
        endTime: endTimeInput.value,
        title: taskTitleInput.value.trim(),
        completed: index === -1 ? false : tasks[index].completed
    };

    if (index === -1) {
        tasks.push(taskData);
    } else {
        tasks[index] = taskData;
    }

    saveToLocalStorage();
    renderTable();
    closeModal();
});

// ==========================================================
// 9. TAHRIRLASH, NUSXALASH VA O'CHIRISH
// ==========================================================
function editTask(index) {
    openModal(true, index);
}

// Ishning nusxasini olish (Duplicate)
function duplicateTask(index) {
    const original = tasks[index];
    const copy = {
        ...original,
        id: Date.now(),
        title: original.title + " (Nusxa)",
        completed: false
    };
    tasks.push(copy);
    saveToLocalStorage();
    renderTable();
}

// Ishni o'chirish
function deleteTask(index) {
    if (confirm("Haqiqatan ham ushbu ishni jadvaldan o‘chirmoqchimisiz?")) {
        tasks.splice(index, 1);
        saveToLocalStorage();
        renderTable();
    }
}

// ==========================================================
// 10. VAQT BO'YICHA AVTOMATIK SARALASH (SORT)
// ==========================================================
sortBtn.addEventListener("click", function () {
    tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    saveToLocalStorage();
    renderTable();
    alert("Barcha ishlar boshlanish vaqti bo‘yicha tartiblandi!");
});

// ==========================================================
// 11. QIDIRUV VA FILTRLASH
// ==========================================================
searchInput.addEventListener("input", function (e) {
    searchQuery = e.target.value.trim();
    renderTable();
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", function () {
        filterButtons.forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.getAttribute("data-filter");
        renderTable();
    });
});

// ==========================================================
// 12. CHOP ETISH / PDF QILIB SAQLASH
// ==========================================================
printBtn.addEventListener("click", function () {
    window.print();
});

// ==========================================================
// 13. EKSPORT (JSON YUKLAB OLISH)
// ==========================================================
exportBtn.addEventListener("click", function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `kunlik_jadval_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

// ==========================================================
// 14. IMPORT (JSON FAYLDAN YUKLASH)
// ==========================================================
importBtn.addEventListener("click", function () {
    importFileInput.click();
});

importFileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                tasks = importedData;
                saveToLocalStorage();
                renderTable();
                alert("Jadval ma’lumotlari muvaffaqiyatli yuklandi!");
            } else {
                alert("Fayl formati noto‘g‘ri!");
            }
        } catch (err) {
            alert("Faylni o‘qishda xatolik yuz berdi!");
        }
    };
    reader.readAsText(file);
    e.target.value = ""; // Fayl kiritishni tozalash
});

// ==========================================================
// 15. DASTLABKI HOLATGA QAYTARISH VA TOZALASH
// ==========================================================
resetDefaultBtn.addEventListener("click", function () {
    if (confirm("Standart namunaviy ishlarni qaytarishni xohlaysizmi?")) {
        tasks = JSON.parse(JSON.stringify(defaultTasks));
        saveToLocalStorage();
        renderTable();
    }
});

clearAllBtn.addEventListener("click", function () {
    if (confirm("DIQQAT: Jadvaldagi barcha ishlarni butunlay o‘chirmoqchimisiz?")) {
        tasks = [];
        saveToLocalStorage();
        renderTable();
    }
});

// Dastlabki jadvalni chizish
renderTable();
