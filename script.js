let cachedData = null;

function switchSection(sectionId, element) {
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (element) element.classList.add('active');
}

function switchFloor(floorNumber) {
    document.querySelectorAll('.map-floor').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`floor-${floorNumber}`).classList.add('active');
    event.target.classList.add('active');
}

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
    document.getElementById('details-tarbieshi').innerText = targetClass.tarbieshi || '—';

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

    } catch (error) {
        console.error("Ошибка инициализации приложения: ", error);
    }
}

initApp();
