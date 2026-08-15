/**
 * map.js
 * マップの処理
 */

// 地図上のNE座標の範囲
const [N_MIN, N_MAX, E_MIN, E_MAX] = [0, 1833, 0, 1833];

/**
 * 地図上のマウスカーソル位置からNE座標を算出し、UIに表示する
 */
function initMapCoordinates() {
    const targetImage = document.getElementById('worldMap');
    const coordsDisplay = document.getElementById('coordsDisplay');
    
    if (!targetImage || !coordsDisplay) return;

    targetImage.addEventListener('mousemove', (event) => {
        const rect = targetImage.getBoundingClientRect();
        
        const coordX = Math.floor(event.clientX - rect.left);
        const coordY = Math.floor(event.clientY - rect.top);

        const halfW = rect.width / 2;
        const halfH = rect.height / 2;

        const dx = coordX - halfW;
        const dy = rect.height - coordY;

        const coordN = Math.round(((dy / halfH - dx / halfW) / 2) * (N_MAX - N_MIN) + N_MIN);
        const coordE = Math.round(((dy / halfH + dx / halfW) / 2) * (E_MAX - E_MIN) + E_MIN);

        if (coordN < N_MIN || coordN > N_MAX || coordE < E_MIN || coordE > E_MAX) {
            coordsDisplay.textContent = '';
            return;
        }

        coordsDisplay.textContent = `${MESSAGES.coordN[currentLang]}${coordN}${MESSAGES.coordE[currentLang]}${coordE}`;
    });

    targetImage.addEventListener('mouseleave', () => {
        coordsDisplay.textContent = '';
    });
}

const mapImg = document.getElementById('worldMap');
if (mapImg) {
    if (mapImg.complete) {
        initMapCoordinates();
    } else {
        mapImg.addEventListener('load', initMapCoordinates);
    }
}

// 状態管理変数
let pinCount = 0;
let currentCoordinates = [null, null];
const existingPins = new Map();
let maskHoles = loadStorage('MaskHoles', []);
const HOLE_RADIUS = 15;
const MAX_HOLES = (100 / HOLE_RADIUS) ** 2;

/**
 * NE座標からピクセル座標を算出する
 * @param {number} coordN 
 * @param {number} coordE 
 * @param {number} imgWidth 
 * @param {number} imgHeight 
 * @returns {{x: number, y: number}}
 */
function getCoordinateData(coordN, coordE, imgWidth, imgHeight) {
    const halfW = imgWidth / 2;
    const halfH = imgHeight / 2;

    const ratioN = (coordN - N_MIN) / (N_MAX - N_MIN);
    const ratioE = (coordE - E_MIN) / (E_MAX - E_MIN);

    const dx = (ratioE - ratioN) * halfW;
    const dy = (ratioE + ratioN) * halfH;

    const coordX = Math.round(dx + halfW);
    const coordY = Math.round(imgHeight - dy);

    return { x: coordX, y: coordY };
}

/**
 * Sextantの処理：ピンを立てる
 * @param {number|string} n 
 * @param {number|string} e 
 * @param {string} [name='You'] 
 */
function sextantCoordinates(n, e, name = 'You') {
    const board = document.getElementById('pinBoard');
    const targetImage = document.getElementById('worldMap');

    if (!board || !targetImage || n < N_MIN || n > N_MAX || e < E_MIN || e > E_MAX) {
        return;
    }

    const nVal = parseInt(n, 10);
    const eVal = parseInt(e, 10);
    
    if (name === 'You') {
        currentCoordinates = [nVal, eVal];
    }
    const coordKey = `${nVal}_${eVal}`;

    if (existingPins.has(coordKey)) {
        const pinData = existingPins.get(coordKey);
        if (!pinData.names.includes(name)) {
            pinData.names.push(name);
            pinData.element.title = pinData.names.join(', ');
        }
        return;
    }
    
    const rect = targetImage.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    const coordPixel = getCoordinateData(nVal, eVal, currentWidth, currentHeight);
    if (!coordPixel) return;

    const pin = document.createElement('div');
    pin.className = 'map-pin';

    const hueStep = 23; 
    const hue = (pinCount * hueStep) % 180 + 240; 
    const pinColor = `hsl(${hue % 360}, 100%, 45%)`;
    pin.style.setProperty('--pin-color', pinColor);
    pinCount++;

    const percentX = (coordPixel.x / currentWidth) * 100;
    const percentY = (coordPixel.y / currentHeight) * 100;
    
    pin.style.left = `${percentX}%`;
    pin.style.top = `${percentY}%`;
    pin.title = name;

    board.appendChild(pin);

    existingPins.set(coordKey, {
        element: pin,
        names: [name]
    });

    if (name === 'You') {
        maskHoles.push({ x: coordPixel.x, y: coordPixel.y });
    }
}

/**
 * Orb of Seeingの処理：相対座標からピンを立てる
 */
function orbCoordinates(name, dist1, dir1, dist2, dir2) {
    const myN = currentCoordinates[0];
    const myE = currentCoordinates[1];

    if (myN === null || myE === null) {
        return;
    }

    const calculatedN = (dir1 === 'N') 
        ? myN + parseInt(dist1, 10) 
        : myN - parseInt(dist1, 10);

    const calculatedE = (dir2 === 'E') 
        ? myE + parseInt(dist2, 10) 
        : myE - parseInt(dist2, 10);

    sextantCoordinates(calculatedN, calculatedE, name);
}

/**
 * 地図のマスクを解除する
 */
function removeMask() {
    const img = document.getElementById('worldMap');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    const closeRange = Math.floor(mapWidth * HOLE_RADIUS / 100 / 2);

    const nPole = getCoordinateData(N_MAX, E_MAX, mapWidth, mapHeight);
    const sPole = getCoordinateData(N_MIN, E_MIN, mapWidth, mapHeight);

    const activeHoles = [];

    for (const hole of maskHoles) {
        const isCorner = 
            (hole.x === nPole.x || hole.x === sPole.x) && 
            (hole.y === sPole.y || hole.y === nPole.y);

        if (isCorner) {
            activeHoles.push(hole);
            continue;
        }

        const conflictingHoleIndex = activeHoles.findIndex(active => {
            const distanceSquared = (hole.x - active.x) ** 2 + (hole.y - active.y) ** 2;
            return distanceSquared < closeRange ** 2;
        });

        if (conflictingHoleIndex === -1) {
            activeHoles.push(hole);
        }
    }

    if (activeHoles.length > MAX_HOLES) {
        const removeCount = activeHoles.length - MAX_HOLES;
        activeHoles.splice(0, removeCount);
    }

    const gradients = activeHoles.map(hole => {
        const percentX = (hole.x / mapWidth) * 100;
        const percentY = (hole.y / mapHeight) * 100;
        const pxRadius = (HOLE_RADIUS * mapWidth) / 100;

        return `radial-gradient(circle ${pxRadius}px at ${percentX}% ${percentY}%, black 40%, transparent 100%)`;
    });

    if (activeHoles.length) {
        const maskValue = gradients.join(', ');
        img.style.maskImage = maskValue;
        img.style.webkitMaskImage = maskValue;
        img.style.visibility = 'visible';
    }

    maskHoles = activeHoles;
    saveStorage('MaskHoles', maskHoles);
}

/**
 * 地図を初期化する
 */
function resetMap() {
    const isConfirmed = window.confirm(MESSAGES.confirmResetMap[currentLang]);
    if (!isConfirmed) {
        return;
    }

    maskHoles = [];

    const img = document.getElementById('worldMap');
    if (img) {
        img.style.maskImage = 'none';
        img.style.webkitMaskImage = 'none';
        img.style.visibility = 'hidden';
    }

    saveStorage('MaskHoles', maskHoles);
}

/**
 * ピンを全てクリアする
 */
function clearPins() {
    const board = document.getElementById('pinBoard');
    if (board) {
        board.innerHTML = ''; 
    }
    pinCount = 0; 
    currentCoordinates = [null, null];
    existingPins.clear();
}