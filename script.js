function switchFloor(floorNumber) {
    // 1. Убираем класс active у всех слоев этажей
    document.querySelectorAll('.map-floor').forEach(floor => {
        floor.classList.remove('active');
    });
    
    // 2. Показываем выбранный этаж
    const selectedFloor = document.getElementById(`floor-${floorNumber}`);
    if (selectedFloor) {
        selectedFloor.classList.add('active');
    }
    
    // 3. Переключаем активную кнопку
    document.querySelectorAll('.floor-btn').forEach((btn, index) => {
        if (index === floorNumber - 1) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 4. (Опционально) Меняем фоновую картинку карты под нужный этаж
    const mapImg = document.getElementById('map-base-img');
    if (mapImg) {
        mapImg.src = `floor${floorNumber}.png`; // убедись, что картинки floor1.png, floor2.png есть в папке
    }
}
