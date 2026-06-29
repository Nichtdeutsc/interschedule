let cachedData = null;

const dailyRoutine = [
    { start: "07:00", end: "08:00", name: "Завтрак", type: "ev-food", target: "all" },
    { start: "08:00", end: "08:20", name: "Чтение", type: "ev-book", target: "all" },
    { start: "08:30", end: "09:10", name: "1 Урок", type: "ev-lesson", target: "all" },
    { start: "09:20", end: "10:00", name: "2 Урок", type: "ev-lesson", target: "all" },
    { start: "10:00", end: "10:30", name: "Полдник", type: "ev-food", target: "all" },
    { start: "10:30", end: "11:10", name: "3 - Урок", type: "ev-lesson", target: "all" },
    { start: "11:20", end: "12:00", name: "4 - Урок", type: "ev-lesson", target: "all" },
    { start: "12:10", end: "12:50", name: "5 - Урок", type: "ev-lesson", target: "all" },

    { start: "12:50", end: "13:40", name: "Обед", type: "ev-food", target: "junior" },
    { start: "13:00", end: "13:40", name: "6 - Урок", type: "ev-lesson", target: "senior" },
    { start: "13:40", end: "14:20", name: "6 - Урок", type: "ev-lesson", target: "junior" },
    { start: "13:40", end: "14:30", name: "Обед", type: "ev-food", target: "senior" },
    
    { start: "14:30", end: "15:10", name: "7 - Урок", type: "ev-lesson", target: "all" },
    { start: "15:20", end: "16:00", name: "8 - Урок", type: "ev-lesson", target: "all" },
    { start: "16:15", end: "18:00", name: "Чалка", type: "ev-extra", target: "all" },
    { start: "18:00", end: "19:00", name: "Ужин", type: "ev-food", target: "all" },
    { start: "19:00", end: "19:40", name: "Этюд - 1", type: "ev-prep", target: "all" },
    { start: "19:50", end: "20:30", name: "Этюд - 2", type: "ev-prep", target: "all" },
    { start: "20:30", end: "20:50", name: "Поздник", type: "ev-food", target: "all" },
    { start: "22:30", end: "23:59", name: "Отбой", type: "ev-sleep", target: "all" }
];

// cмена секций
function switchSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (element) element.classList.add('active');
    
    if (sectionId === 'events-nav') {
        updateTimeline();
    }
}

// смена этажей
function switchFloor(floorNumber) {
    document.querySelectorAll('.map-floor').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`floor-${floorNumber}`).classList.add('active');
    event.target.classList.add('active');
}

// функция расписания
function isCurrentSlot(startTimeStr, endTimeStr, targetDay) {
    const now = new Date();
    const daysMap = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const currentDayStr = daysMap[now.getDay()];
    if (currentDayStr !== targetDay) return false;

    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const nowTotal = now.getHours() * 60 + now.getMinutes();

    return nowTotal >= startTotal && nowTotal <= endTotal;
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Главная функция обновления всей дорожной карты
function updateTimeline() {
    const clockEl = document.getElementById('timeline-clock');
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    if (clockEl) clockEl.innerText = `Текущее время: ${timeString}`;

    const startDayMin = timeToMinutes("07:00");
    const endDayMin = timeToMinutes("22:30");
    const currentMin = timeToMinutes(timeString);
    const lineEl = document.getElementById('timeline-now-line');

    // Позиционирование красной линии "Сейчас"
    if (currentMin >= startDayMin && currentMin <= endDayMin && lineEl) {
        const totalRange = endDayMin - startDayMin;
        const currentOffset = currentMin - startDayMin;
        const percent = (currentOffset / totalRange) * 100;
        lineEl.style.left = `calc(80px + ${percent}%)`; // 80px — отступ лейбла параллели
        lineEl.style.display = 'block';
    } else if (lineEl) {
        lineEl.style.display = 'none';
    }

    // Рендерим базовые строки параллелей
    renderTimelineRow('timeline-junior', 'junior');
    renderTimelineRow('timeline-senior', 'senior');
    
    // Рендерим многоуровневую шкалу дополнительных мероприятий
    renderDynamicEventsLine();
    
    // Рендерим карточки внизу
    renderEventCards(timeString);
}

function renderTimelineRow(containerId, targetGroup) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const startDayMin = timeToMinutes("07:00");
    const endDayMin = timeToMinutes("22:30");
    const totalRange = endDayMin - startDayMin;

    dailyRoutine.forEach(event => {
        if (event.target !== 'all' && event.target !== targetGroup) return;
        if (timeToMinutes(event.start) >= endDayMin) return;

        const startMin = Math.max(timeToMinutes(event.start), startDayMin);
        const endMin = Math.min(timeToMinutes(event.end), endDayMin);
        const duration = endMin - startMin;
        
        const leftPercent = ((startMin - startDayMin) / totalRange) * 100;
        const widthPercent = (duration / totalRange) * 100;

        // Если блок меньше или равен 30 минутам (чтение, полдник, перерывы), переворачиваем текст
        const isNarrow = duration <= 30 ? 'narrow-slot' : '';

        container.innerHTML += `
            <div class="timeline-block ${event.type} ${isNarrow}" 
                 style="left: ${leftPercent}%; width: ${widthPercent}%;" 
                 title="${event.name} (${event.start}-${event.end})">
                 ${event.name.split(' / ')[0]}
            </div>`;
    });
}

// Умная функция рендеринга мероприятий без перекрытий (по уровням/трекам)
function renderDynamicEventsLine() {
    const container = document.getElementById('dynamic-events-line-row');
    if (!container) return;
    container.innerHTML = '';

    if (!cachedData || !cachedData.events || cachedData.events.length === 0) {
        container.innerHTML = `<div style="padding: 10px 15px; color: #94a3b8; font-size: 13px; font-style: italic;">На сегодня мероприятий не запланировано.</div>`;
        return;
    }

    const startDayMin = timeToMinutes("07:00");
    const endDayMin = timeToMinutes("22:30");
    const totalRange = endDayMin - startDayMin;

    // Массив уровней (треков). Каждый уровень хранит занятые промежутки времени [start, end]
    const rows = [];

    cachedData.events.forEach(event => {
        const startMin = timeToMinutes(event.time_start);
        const endMin = timeToMinutes(event.time_end);

        // Игнорируем события вне рамок нашей временной шкалы
        if (startMin >= endDayMin || endMin <= startDayMin) return;

        // Ищем первый уровень, где время этого события свободно
        let targetRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
            let hasOverlap = false;
            for (let slot of rows[i]) {
                // Если интервалы пересекаются
                if (startMin < slot.end && endMin > slot.start) {
                    hasOverlap = true;
                    break;
                }
            }
            if (!hasOverlap) {
                targetRowIndex = i;
                break;
            }
        }

        // Если свободного уровня не нашлось, создаем новый снизу
        if (targetRowIndex === -1) {
            rows.push([]);
            targetRowIndex = rows.length - 1;
        }

        // Занимаем время на выбранном уровне
        rows[targetRowIndex].push({ start: startMin, end: endMin });

        // Рассчитываем координаты в процентах
        const leftPercent = ((Math.max(startMin, startDayMin) - startDayMin) / totalRange) * 100;
        const widthPercent = ((Math.min(endMin, endDayMin) - Math.max(startMin, startDayMin)) / totalRange) * 100;

        // Создаем DOM-элемент уровня, если его еще нет на странице
        let rowEl = document.getElementById(`events-track-${targetRowIndex}`);
        if (!rowEl) {
            rowEl = document.createElement('div');
            rowEl.id = `events-track-${targetRowIndex}`;
            rowEl.className = 'events-track-row';
            container.appendChild(rowEl);
        }

        // Вставляем отрезок на свой уровень
        rowEl.innerHTML += `
            <div class="event-segment" 
                 style="left: ${leftPercent}%; width: ${widthPercent}%;" 
                 title="${event.name} (${event.time_start} - ${event.time_end})\nМесто: ${event.location}">
                ${event.name}
            </div>
        `;
    });
}

function renderEventCards(currentTimeStr) {
    const container = document.getElementById('events-cards-container');
    if (!container) return;
    container.innerHTML = '';

    // Если в json вообще нет массива событий, пишем сообщение
    if (!cachedData || !cachedData.events || cachedData.events.length === 0) {
        container.innerHTML = `<div style="color: #64748b; font-style: italic; grid-column: 1/-1;">На сегодня мероприятий не запланировано.</div>`;
        return;
    }

    const currentMin = timeToMinutes(currentTimeStr);

    cachedData.events.forEach(event => {
        const startMin = timeToMinutes(event.time_start);
        const endMin = timeToMinutes(event.time_end);
        
        // Проверяем, идет ли событие прямо сейчас
        const isActive = currentMin >= startMin && currentMin < endMin;

        let targetText = "Все классы";
        if (event.target === 'junior') targetText = "7-9 классы";
        if (event.target === 'senior') targetText = "9-11 классы";

        container.innerHTML += `
            <div class="event-card ${isActive ? 'active-now' : ''}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                    <span class="time" style="color: #0284c7; font-size: 14px;">⏳ ${event.time_start} - ${event.time_end}</span>
                    ${isActive ? '<span style="font-size:10px; background:#ef4444; color:white; padding:2px 6px; border-radius:10px; font-weight:bold; animation: pulse 1.5s infinite;">ИДЕТ СЕЙЧАС</span>' : ''}
                </div>
                <h4 style="font-size: 17px; margin-bottom: 6px; color: #0f172a;">${event.name}</h4>
                <div style="font-size: 13px; color: #475569; margin-bottom: 8px;"><strong>📍 Место:</strong> ${event.location}</div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.4; margin-bottom: 10px;">${event.description || ''}</p>
                <span class="target">Кому: ${targetText}</span>
            </div>
        `;
    });
}

function getEventColor(type) {
    switch(type) {
        case 'ev-food': return '#f59e0b';
        case 'ev-book': return '#8b5cf6';
        case 'ev-lesson': return '#3b82f6';
        case 'ev-rest': return '#10b981';
        case 'ev-extra': return '#06b6d4';
        case 'ev-prep': return '#64748b';
        case 'ev-sleep': return '#1e1b4b';
        default: return '#cbd5e1';
    }
}

function renderSchedule(className) {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    const days = ['Пн', 'Вт', 'Ср']; 

    cachedData.time_slots.forEach(slotInfo => {
        let rowHtml = `<tr>`;
        if (slotInfo.slot === 0) {
            rowHtml += `<td><strong>Обед</strong><br><small style="color:#64748b">${slotInfo.start} - ${slotInfo.end}</small></td>`;
        } else {
            rowHtml += `<td><strong>${slotInfo.slot} урок</strong><br><small style="color:#64748b">${slotInfo.start} - ${slotInfo.end}</small></td>`;
        }
        
        days.forEach(day => {
            const isNow = isCurrentSlot(slotInfo.start, slotInfo.end, day);
            let cellClass = isNow ? 'current-lesson-row' : '';

            if (slotInfo.slot === 0) {
                rowHtml += `<td class="lunch-row ${cellClass}">Түскі ас / Обед ${isNow ? '<br><span class="now-badge">ИДЕТ СЕЙЧАС</span>' : ''}</td>`;
            } else {
                const lessons = cachedData.schedule.filter(s => s.slot === slotInfo.slot && s.day === day && s.class_name === className);
                rowHtml += `<td class="${cellClass}">`;
                if (lessons.length > 0) {
                    lessons.forEach(l => {
                        let groupClass = l.group === '1 группа' ? 'g1' : (l.group === '2 группа' ? 'g2' : 'g-all');
                        let displayRoom = l.room_id ? l.room_id.replace('room-', '').toUpperCase() : '??';
                        rowHtml += `
                            <div class="lesson-block">
                                <span class="group-badge ${groupClass}">${l.group}</span>
                                <div><strong>${l.subject}</strong></div>
                                <div class="teacher-name">${l.teacher}</div>
                                <div class="room-num">каб. ${displayRoom}</div>
                            </div>
                        `;
                    });
                    if (isNow) rowHtml += `<span class="now-badge">ИДЕТ СЕЙЧАС</span>`;
                } else {
                    rowHtml += `<span style="color:#cbd5e1">—</span>`;
                }
                rowHtml += `</td>`;
            }
        });
        rowHtml += `</tr>`;
        tbody.innerHTML += rowHtml;
    });
}

function handleClassChange() {
    const selectedClass = document.getElementById('class-select').value;
    renderSchedule(selectedClass);
}

// Показ детальной информации о классе
function showClassDetails(className) {
    const targetClass = cachedData.classes.find(c => c.name === className);
    if (!targetClass) return;

    document.getElementById('details-class-name').innerText = `Информация о классе ${targetClass.name}`;
    document.getElementById('details-teacher').innerText = targetClass.class_teacher || '—';
    document.getElementById('details-kurator').innerText = targetClass.kurator || '—';
    document.getElementById('details-abi').innerText = targetClass.abi || '—';

    const studentsList = document.getElementById('details-students');
    studentsList.innerHTML = '';
    targetClass.students.forEach(student => {
        studentsList.innerHTML += `<li>${student}</li>`;
    });

    document.getElementById('class-details').style.display = 'block';
    document.getElementById('class-details').scrollIntoView({ behavior: 'smooth' });
}

async function initApp() {
    try {
        const response = await fetch('data.json');
        cachedData = await response.json();

        renderSchedule('8А');

        // Отрисовка учителей
        const teachersContainer = document.getElementById('teachers-container');
        teachersContainer.innerHTML = '';
        const days = ['Пн', 'Вт', 'Ср'];
        
        let currentSlotInfo = null;
        let currentDay = null;

        cachedData.time_slots.forEach(slotInfo => {
            days.forEach(day => {
                if (isCurrentSlot(slotInfo.start, slotInfo.end, day)) {
                    currentSlotInfo = slotInfo;
                    currentDay = day;
                }
            });
        });

        // статус учителей
        cachedData.teachers.forEach(teacher => {
            const isMale = teacher.geschlecht === 'м';
            const textFree = isMale ? 'Свободен' : 'Свободна';
            const textBusy = isMale ? 'Занят' : 'Занята';
            let currentStatusHtml = `<span class="status-badge status-free">${textFree}</span>`;

            if (currentSlotInfo && currentDay) {
                const activeLesson = cachedData.schedule.find(s => s.teacher_id === teacher.id && s.slot === currentSlotInfo.slot && s.day === currentDay);
                if (activeLesson) {
                    let activeRoom = activeLesson.room_id ? activeLesson.room_id.replace('room-', '').toUpperCase() : '??';
                    currentStatusHtml = `<span class="status-badge status-busy">${textBusy}. Урок: ${activeLesson.subject} (${activeLesson.class_name}, Каб. ${activeRoom})</span>`;
                }
            }

            let contactsHtml = '';
            let teacherPhone = teacher.phone || teacher.telephone;
            if (teacher.telegram || teacherPhone) {
                contactsHtml = `<div class="teacher-contacts">`;
                if (teacher.telegram) contactsHtml += `<a href="https://t.me/${teacher.telegram}" target="_blank" class="contact-link">@${teacher.telegram}</a>`;
                if (teacherPhone) contactsHtml += `<div style="color: #64748b;">${teacherPhone}</div>`;
                contactsHtml += `</div>`;
            }
        
            teachersContainer.innerHTML += `
                <div class="teacher-card">
                    <h3>${teacher.name}</h3>
                    <span class="role">${teacher.role || 'Учитель'}</span>
                    <div class="subject">${teacher.subject}</div>
                    <div>${currentStatusHtml}</div>
                    ${contactsHtml}
                </div>
            `;
        });

        // Отрисовка плашек классов
        const classesContainer = document.getElementById('classes-container');
        classesContainer.innerHTML = '';
        if (cachedData.classes) {
            cachedData.classes.forEach(c => {
                classesContainer.innerHTML += `
                    <div class="class-card" onclick="showClassDetails('${c.name}')">
                        <h3>Класс ${c.name}</h3>
                        <div style="font-size: 14px; color: #64748b; margin-top: 5px;">Учеников: ${c.students.length}</div>
                        <div style="font-size: 13px; color: #475569; margin-top: 8px;">Кл. рук: ${c.class_teacher}</div>
                    </div>
                `;
            });
        }
        
        setInterval(updateTimeline, 60000);
        updateTimeline();
        
        // Карты клики
        document.querySelectorAll('.room').forEach(room => {
            room.addEventListener('click', () => {
                document.querySelectorAll('.room').forEach(r => r.classList.remove('selected'));
                room.classList.add('selected');

                const roomId = room.id;
                const roomDetails = cachedData.rooms.find(r => r.id === roomId);
                const infoBox = document.getElementById('info-box');
                let statusText = "В этом кабинете сейчас нет занятий по расписанию.";
                let hasActiveLesson = false;
                
                cachedData.time_slots.forEach(slotInfo => {
                    days.forEach(day => {
                        if (isCurrentSlot(slotInfo.start, slotInfo.end, day)) {
                            const activeLesson = cachedData.schedule.find(s => s.room_id === roomId && s.slot === slotInfo.slot && s.day === day);
                            if (activeLesson) {
                                hasActiveLesson = true;
                                statusText = `<strong>Идет урок прямо сейчас:</strong><br>Предмет: ${activeLesson.subject} (${activeLesson.group})<br>Класс: ${activeLesson.class_name}<br>Учитель: ${activeLesson.teacher}`;
                            }
                        }
                    });
                });

                if (hasActiveLesson) infoBox.classList.add('has-lesson');
                else infoBox.classList.remove('has-lesson');

                if (roomDetails) {
                    document.getElementById('room-title').innerText = `Кабинет ${roomDetails.number} — ${roomDetails.description}`;
                    document.getElementById('room-status').innerHTML = statusText;
                }
            });
        });

    }
    catch (error) {
        console.error("Ошибка инициализации приложения: ", error);
    }
}

initApp();
