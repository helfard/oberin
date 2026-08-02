// map.js
// 　マップの処理
// 　ログデータを使うのでlog.jsより後に読み込むこと


// 地図上のNE座標の範囲
const [nMin, nMax, eMin, eMax] =[0, 1833, 0, 1833];

// 地図上の座標を表示
function initMapCoordinates() {
    // 要素の指定
    const targetImage = document.getElementById('worldMap');
    const coordsDisplay = document.getElementById('coordsDisplay');
    // 要素が存在しない場合の安全弁
    if (!targetImage || !coordsDisplay) return;
    // マウスが画像の上を動いたときのイベント
    targetImage.addEventListener('mousemove', (event) => {
        // 画像の座標とサイズを取得
        const rect = targetImage.getBoundingClientRect();
        // 画像内でのXY座標（整数）を計算
        const coordX = Math.floor(event.clientX - rect.left);
        const coordY = Math.floor(event.clientY - rect.top);
        // 地図は菱形なので端のXY座標はサイズの半分の値になる
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        // 下端を原点(0,0)とした時のカーソルのXY座標
        const dx = coordX - halfW;
        const dy = rect.height - coordY;
        // 地図上のN座標とE座標を算出
        const coordN = Math.round(((dy / halfH - dx / halfW) / 2) * (nMax - nMin) + nMin);
        const coordE = Math.round(((dy / halfH + dx / halfW) / 2) * (eMax - eMin) + eMin);
        // 地図範囲外（菱形の外側）にカーソルがある場合は座標は表示しない
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
const mapImg = document.getElementById('worldMap');
if (mapImg) {
    // すでに画像が読み込み完了している場合はすぐに実行
    if (mapImg.complete) {
        initMapCoordinates();
    } else {
        // まだ読み込み中の場合は、ロード完了を待ってから実行
        mapImg.addEventListener('load', initMapCoordinates);
    }
}

// 現在のピンの数（色を変化させるカウンター）
let pinCount = 0;
// 現在の自分の座標
let currentCoordinates = [null, null];
// 座標ごとに生成されたピンと登録済みの名前を管理する Map
const existingPins = new Map();
// 地図を開示するエリアの基準となる座標（{ x: 0, y: 0 }の配列）
let maskHoles = loadStorage('maskHoles', []);
// 地図を開示するエリアの半径（％）
const holeRadius = 15;
// 開示座標の最大保持数
const MAX_HOLES = (100 / holeRadius) ** 2;

// NE座標から、地図画像上での純粋なピクセル座標(XY)のみを算出
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

// Sextantの処理
function sextantCoordinates(n, e, name = 'You') {
    const board = document.getElementById('pinBoard');
    const targetImage = document.getElementById('worldMap');
    
    if (!board || !targetImage || n < nMin || n > nMax || e < eMin || e > eMax) {
        return;
    }

    const n_val = parseInt(n, 10);
    const e_val = parseInt(e, 10);
    
    currentCoordinates = [n_val, e_val];
    const coordKey = `${n_val}_${e_val}`;

    // すでに同じ座標にピンが存在する場合
    if (existingPins.has(coordKey)) {
        const pinData = existingPins.get(coordKey);
        
        // 名前がまだ登録されていない場合のみ配列に追加
        if (!pinData.names.includes(name)) {
            pinData.names.push(name);
            
            // 画面上のピンのツールチップ（title属性）を、新しい名前を含んだ文字列に更新
            pinData.element.title = pinData.names.join(', ');
        }
        return; // 新しいピンは作らずに処理を終了
    }
    
    const rect = targetImage.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    const coordX = getCoordinateData(n_val, e_val, currentWidth, currentHeight);
    if (!coordX) return;

    const pin = document.createElement('div');
    pin.className = 'map-pin';

    // 計算しやすいように、色相（Hue）の基本ステップを設定
    const hueStep = 37; // 360と公約数になりにくい素数に近い数にすると、色が被りにくくなります
    // 背景が白・明るい緑（HSLでいうと H:60〜140 辺り）に映える色の範囲
    // 候補レンジ：240（青） 〜 360/0（赤） 〜 40（オレンジ・茶）
    const hue = (pinCount * hueStep) % 160 + 240; 
    // 240〜400 未満（400 % 360 = 40 なので、実質「青〜紫〜マゼンタ〜赤〜オレンジ」の範囲を循環）
    // 白背景でもボケないよう、明度（Lightness）を 45% まで下げて少し濃いめに調整
    const pinColor = `hsl(${hue % 360}, 100%, 45%)`;
    pin.style.setProperty('--pin-color', pinColor);
    pinCount++;

    const percentX = (coordX.x / currentWidth) * 100;
    const percentY = (coordX.y / currentHeight) * 100;
    
    pin.style.left = `${percentX}%`;
    pin.style.top = `${percentY}%`;

    // 初回作成時のツールチップ設定
    pin.title = name;

    board.appendChild(pin);

    // Map にピンの参照と名前の配列を保存
    existingPins.set(coordKey, {
        element: pin,
        names: [name]
    });

    // Sextantの場合は地図の開示座標を追加
    if (name === 'You') {
        maskHoles.push({ x: coordX.x, y: coordX.y });
    }
}

// Orb of Seeingの処理（直前のSextantからの相対座標を計算）
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

// 地図のマスクを解除
function removeMask() {
    const img = document.getElementById('worldMap');
    const mapWidth = img.width;
    const mapHeight = img.height;
    const closeRange = Math.floor(mapWidth * holeRadius / 100 / 2);

    // 極点の座標データを取得
    const nPole = getCoordinateData(nMax, eMax, mapWidth, mapHeight);
    const sPole = getCoordinateData(nMin, eMin, mapWidth, mapHeight);

    // 採用する有効な穴の座標を保存するリスト
    const activeHoles = [];

    for (const hole of maskHoles) {
        // 1. 四隅の場合は無条件で採用対象
        const isCorner = 
            (hole.x === nPole.x || hole.x === sPole.x) && 
            (hole.y === sPole.y || hole.y === nPole.y);

        if (isCorner) {
            activeHoles.push(hole);
            continue;
        }

        // 2. すでに採用済みの穴の中に、近すぎるものがあるかチェック
        const conflictingHoleIndex = activeHoles.findIndex(active => {
            const distanceSquared = (hole.x - active.x) ** 2 + (hole.y - active.y) ** 2;
            return distanceSquared < closeRange ** 2;
        });

        if (conflictingHoleIndex !== -1) {
            // 近すぎる既存の穴が見つかった場合はスキップ
            continue; 
        } else {
            // 近すぎる穴がなければ、そのまま新しく追加する
            activeHoles.push(hole);
        }
    }

    // 最大穴数を超えた場合は古い方から一括削除
    if (activeHoles.length > MAX_HOLES) {
        const removeCount = activeHoles.length - MAX_HOLES;
        activeHoles.splice(0, removeCount); // 古い方から一括削除
    }

    // 最終的に残った（切り替えられた）有効な穴たちからグラデーションを生成
    const gradients = activeHoles.map(hole => {
        const percentX = (hole.x / mapWidth) * 100;
        const percentY = (hole.y / mapHeight) * 100;
        const pxRadius = (holeRadius * mapWidth) / 100;

        return `radial-gradient(circle ${pxRadius}px at ${percentX}% ${percentY}%, black 40%, transparent 100%)`;
    });

    const maskValue = gradients.join(', ');
    img.style.maskImage = maskValue;
    img.style.webkitMaskImage = maskValue;
    img.style.visibility = 'visible';

    // 開示エリアを更新
    maskHoles = activeHoles;
    // ローカルストレージに保存
    saveStorage('maskHoles', maskHoles);
}

// 地図のマスクを初期化して穴を塞ぐ
function resetMap() {
    // 確認ダイアログを表示
    const isConfirmed = window.confirm(MESSAGES.confirmResetMap[currentLang]);
    
    // キャンセルされた場合は何もしない
    if (!isConfirmed) {
        return;
    }

    // 穴のデータを管理している配列を空にする
    maskHoles = [];

    const img = document.getElementById('worldMap');
    if (img) {
        // マスクを初期状態に戻す
        img.style.maskImage = 'none';
        img.style.webkitMaskImage = 'none';
        img.style.visibility = 'hidden';
    }

    // ローカルストレージに保存
    saveStorage('maskHoles', maskHoles);
}

// 全てのピンを削除
function clearPins() {
    const board = document.getElementById('pinBoard');
    if (board) {
        board.innerHTML = ''; 
    }
    pinCount = 0; 
    currentCoordinates = [null, null];
    // Map の中身をすべてクリアして初期化する
    existingPins.clear();
}
