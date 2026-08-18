/**
 * map.js
 * マップの処理
 * ※ログデータを使用するため log.js より後に読み込むこと
 */

// 地図上のNE座標の範囲
const [nMin, nMax, eMin, eMax] = [0, 1833, 0, 1833];

/**
 * 地図上のマウスカーソル位置からNE座標を算出し、UIに表示する
 */
function initMapCoordinates() {
    const targetImage = document.getElementById('worldMap');
    const coordsDisplay = document.getElementById('coordsDisplay');
    
    // 要素が存在しない場合の安全弁
    if (!targetImage || !coordsDisplay) return;

    // マウスが画像の上を動いたときのイベント
    targetImage.addEventListener('mousemove', (event) => {
        const rect = targetImage.getBoundingClientRect();
        
        // 画像内でのXY座標（整数）を計算
        const coordX = Math.floor(event.clientX - rect.left);
        const coordY = Math.floor(event.clientY - rect.top);

        // 地図は菱形なので端のXY座標はサイズの半分の値になる
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;

        // 下端を原点(0, 0)とした時のカーソルのXY座標
        const dx = coordX - halfW;
        const dy = rect.height - coordY;

        // 地図上のN座標とE座標を算出
        const coordN = Math.round(((dy / halfH - dx / halfW) / 2) * (nMax - nMin) + nMin);
        const coordE = Math.round(((dy / halfH + dx / halfW) / 2) * (eMax - eMin) + eMin);

        // 地図範囲外（菱形の外側）にカーソルがある場合は座標を表示しない
        if (coordN < nMin || coordN > nMax || coordE < eMin || coordE > eMax) {
            coordsDisplay.textContent = '';
            return;
        }

        // NE座標を表示
        coordsDisplay.textContent = `${MESSAGES.coordN[currentLang]}${coordN}${MESSAGES.coordE[currentLang]}${coordE}`;
    });

    // マウスが画像から外れたら表示をリセット
    targetImage.addEventListener('mouseleave', () => {
        coordsDisplay.textContent = '';
    });
}

// マップ画像の読み込み完了検知と初期化処理
const mapImg = document.getElementById('worldMap');
if (mapImg) {
    if (mapImg.complete) {
        initMapCoordinates();
    } else {
        mapImg.addEventListener('load', initMapCoordinates);
    }
}

// 現在のピンの数（色を変化させるカウンター）
let pinCount = 0;
// 現在の自分の座標
let currentCoordinates = [null, null];
// 座標ごとに生成されたピンと登録済みの名前を管理する Map
const existingPins = new Map();
// 地図を開示するエリアの基準となる座標の配列
let maskHoles = loadStorage('MaskHoles', []);
// 地図を開示するエリアの半径（％）
const holeRadius = 15;
// 開示座標の最大保持数
const MAX_HOLES = (100 / holeRadius) ** 2;

/**
 * NE座標から地図画像上での純粋なピクセル座標(XY)のみを算出する（getBoundingClientRectベース）
 * @param {number} coordN - N座標
 * @param {number} coordE - E座標
 * @param {number} imgWidth - 画像の現在の表示幅
 * @param {number} imgHeight - 画像の現在の表示高さ
 * @returns {{x: number, y: number}} ピクセル座標
 */
function getCoordinateData(coordN, coordE, imgWidth, imgHeight) {
    const halfW = imgWidth / 2;
    const halfH = imgHeight / 2;

    const ratioN = (coordN - nMin) / (nMax - nMin);
    const ratioE = (coordE - eMin) / (eMax - eMin);

    const dx = (ratioE - ratioN) * halfW;
    const dy = (ratioE + ratioN) * halfH;

    const coordX = Math.round(dx + halfW);
    const coordY = Math.round(imgHeight - dy);

    return { x: coordX, y: coordY };
}

/**
 * Sextant（六分儀）の処理：指定された座標にピンを立て、必要に応じて地図を開示する
 * @param {number|string} n - N座標
 * @param {number|string} e - E座標
 * @param {string|undefined} [name='You'] - 対象の名前
 */
function sextantCoordinates(n, e, name = 'You') {
    const board = document.getElementById('pinBoard');
    const targetImage = document.getElementById('worldMap');

    if (!board || !targetImage || n < nMin || n > nMax || e < eMin || e > eMax) {
        return;
    }

    const n_val = parseInt(n, 10);
    const e_val = parseInt(e, 10);
    
    // 現在の自分の座標を更新
    if (name === 'You') {
        currentCoordinates = [n_val, e_val];
    }
    const coordKey = `${n_val}_${e_val}`;

    // すでに同じ座標にピンが存在する場合
    if (existingPins.has(coordKey)) {
        const pinData = existingPins.get(coordKey);
        
        // 名前がまだ登録されていない場合のみ配列に追加
        if (!pinData.names.includes(name)) {
            pinData.names.push(name);
            pinData.element.title = pinData.names.join(', ');
        }
        return;
    }
    
    const rect = targetImage.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    const coordX = getCoordinateData(n_val, e_val, currentWidth, currentHeight);
    if (!coordX) return;

    const pin = document.createElement('div');
    pin.className = 'map-pin';

    // 色相（Hue）の基本ステップ
    const hueStep = 23; 
    const hue = (pinCount * hueStep) % 180 + 240; 
    const pinColor = `hsl(${hue % 360}, 100%, 45%)`;
    pin.style.setProperty('--pin-color', pinColor);
    pinCount++;

    const percentX = (coordX.x / currentWidth) * 100;
    const percentY = (coordX.y / currentHeight) * 100;
    
    pin.style.left = `${percentX}%`;
    pin.style.top = `${percentY}%`;
    pin.title = name;

    board.appendChild(pin);

    existingPins.set(coordKey, {
        element: pin,
        names: [name]
    });

    // 自分自身のSextantの場合は地図の開示座標を追加
    if (name === 'You') {
        maskHoles.push({ x: coordX.x, y: coordX.y });
    }
}

/**
 * Orb of Seeing（位置探索）の処理：自分の現在地を基準に対象の相対座標を計算し、ピンを立てる
 * @param {string} name - 対象の名前
 * @param {string|number} dist1 - 南北方向の距離
 * @param {string} dir1 - 南北の方向 ('N' または 'S')
 * @param {string|number} dist2 - 東西方向の距離
 * @param {string} dir2 - 東西の方向 ('E' または 'W')
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
 * 地図のマスクを解除して探索済みエリアを表示する
 */
function removeMask() {
    const img = document.getElementById('worldMap');
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const mapWidth = rect.width;
    const mapHeight = rect.height;
    const closeRange = Math.floor(mapWidth * holeRadius / 100 / 2);

    const nPole = getCoordinateData(nMax, eMax, mapWidth, mapHeight);
    const sPole = getCoordinateData(nMin, eMin, mapWidth, mapHeight);

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
        const pxRadius = (holeRadius * mapWidth) / 100;

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
 * 地図のマスクを初期化して未探索状態に戻す
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
 * マップ上の全てのピンを削除し、カウンターや座標状態を初期化する
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