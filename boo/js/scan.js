/**
 * scan.js
 * ログファイルの走査（ログに対する具体的な処理はresearch.jsで行う）
 */

// IndexedDBに関する定数
const DB_NAME = 'LogScannerDB(BoO)';
const STORE_NAME = 'handles';
const KEY_NAME = 'targetFolder';

// グローバルなフォルダハンドル保持用
let folderHandle = null;

/**
 * IndexedDBのデータベースを開く
 */
function openDB(version = 1) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, version);

        request.onupgradeneeded = ({ target }) => {
            const db = target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = ({ target }) => resolve(target.result);
        request.onerror = ({ target }) => reject(target.error);
    });
}

/**
 * フォルダのハンドルをIndexedDBに保存する
 */
async function saveFolderHandle(handle) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, KEY_NAME);
    
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = ({ target }) => reject(target.error);
    });
}

/**
 * フォルダハンドルをIndexedDBから読み込む
 */
async function loadFolderHandle() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY_NAME);
    
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = ({ target }) => reject(target.error);
    });
}

/**
 * ページ読み込み時にIndexedDBから保存されたフォルダハンドルを復元する
 */
async function restoreFolder() {
    try {
        const savedHandle = await loadFolderHandle();
        
        const statusEl = document.getElementById('status');
        
        if (!savedHandle) {
            if (statusEl && typeof MESSAGES !== 'undefined') {
                statusEl.textContent = MESSAGES.statusNotSelected[currentLang];
            }
            return;
        }

        folderHandle = savedHandle;
        
        // 初期状態の表示（復元されたフォルダ名を表示）
        if (statusEl && typeof MESSAGES !== 'undefined') {
            statusEl.innerHTML = 
                `${MESSAGES.restoreFound[currentLang]}<strong>${folderHandle.name}</strong>` +
                `${MESSAGES.restoreGuide[currentLang]}`;
        }

        const requestFolderPermission = async () => {
            try {
                const opts = { mode: 'read' };
                // クエリまたはリクエストで許可が得られた場合
                if (await folderHandle.queryPermission(opts) === 'granted' || 
                    await folderHandle.requestPermission(opts) === 'granted') {
                    
                    console.log('フォルダのアクセス権限が確認されました。');
                    
                    // 【修正点】権限取得成功のタイミングで画面（status要素）のテキストを確実に更新する
                    if (statusEl) {
                        statusEl.textContent = typeof MESSAGES !== 'undefined' 
                            ? `${MESSAGES.statusMonitoring[currentLang]}${folderHandle.name}` 
                            : `フォルダの監視中: ${folderHandle.name}`;
                    }
                }
            } catch (pErr) {
                console.error("アクセス許可エラー:", pErr);
                if (statusEl && typeof MESSAGES !== 'undefined') {
                    statusEl.textContent = MESSAGES.statusPermissionDenied[currentLang];
                }
            }
        };

        window.removeEventListener('click', requestFolderPermission);
        window.addEventListener('click', requestFolderPermission, { once: true });

    } catch (err) {
        console.error("復元失敗の詳細ログ:", err);
        const statusEl = document.getElementById('status');
        if (statusEl && typeof MESSAGES !== 'undefined') {
            statusEl.textContent = MESSAGES.statusRestoreFailed[currentLang];
        }
    }
}

window.addEventListener('DOMContentLoaded', restoreFolder);

/**
 * フォルダ選択ダイアログを表示し、監視を開始する
 */
async function selectFolder() {
    if (!window.showDirectoryPicker) {
        alert(typeof MESSAGES !== 'undefined' ? MESSAGES.statusNotSupported[currentLang] : "お使いのブラウザはこの機能に対応していません。");
        return;
    }

    const statusEl = document.getElementById('status');
    if (statusEl && typeof MESSAGES !== 'undefined') {
        statusEl.textContent = MESSAGES.statusSelecting[currentLang];
    }
    
    try {
        folderHandle = await window.showDirectoryPicker();
        await saveFolderHandle(folderHandle);
        
        if (statusEl && typeof MESSAGES !== 'undefined') {
            statusEl.textContent = `${MESSAGES.statusMonitoring[currentLang]}${folderHandle.name}`;
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('ユーザーによってフォルダ選択がキャンセルされました。');
            if (statusEl && typeof MESSAGES !== 'undefined') {
                statusEl.textContent = MESSAGES.statusNotSelected[currentLang];
            }
            return;
        }

        console.error(err);
        const failMsg = typeof MESSAGES !== 'undefined' ? MESSAGES.statusFailed[currentLang] : 'フォルダの選択に失敗しました。';
        alert(failMsg);
        if (statusEl) {
            statusEl.textContent = failMsg;
        }
    }
}

/**
 * 集計処理を開始する
 */
async function startResearch() {
    const fromDateVal = document.getElementById('fromDate').value;
    const toDateVal = document.getElementById('toDate').value;
    const characterNameVal = document.getElementById('characterName').value.trim();
    const splitPerNameChecked = document.getElementById('splitPerName').checked;
    const optionTakeCatch = document.getElementById('optionTakeCatch').checked;
    const optionPotion = document.getElementById('optionPotion').checked;
    const optionSpell = document.getElementById('optionSpell').checked;
    const optionReagent = document.getElementById('optionReagent').checked;

    // 集計データを初期化
    initCountData();

    // 条件オブジェクトの組み立て
    const conditions = {
        startDateStr: fromDateVal,
        endDateStr: toDateVal,
        splitPerName: splitPerNameChecked,
        characterName: characterNameVal,
        optionTakeCatch: optionTakeCatch,
        optionPotion: optionPotion,
        optionSpell: optionSpell,
        optionReagent: optionReagent
    };

    try {
        await scanLogFiles(conditions);
    } catch (err) {
        console.error("集計処理エラー:", err);
    }
}

/**
 * 指定フォルダを走査する
 * @param {*} conditions 
 */
async function scanLogFiles(conditions = {}) {
    if (!folderHandle) {
        throw new Error('フォルダハンドルが選択されていません。');
    }

    const opts = { mode: 'read' };
    if (await folderHandle.queryPermission(opts) !== 'granted') {
        if (await folderHandle.requestPermission(opts) !== 'granted') {
            throw new Error('フォルダへのアクセス権限がありません。');
        }
    }

    const { startDateStr, endDateStr, splitPerName, characterName, optionTakeCatch, optionPotion, optionSpell, optionReagent } = conditions;

    if (!startDateStr || !endDateStr) {
        throw new Error('開始日と終了日が指定されていません。');
    }

    let currentDate = new Date(startDateStr);
    const lastDate = new Date(endDateStr);

    // 古い日付から順番にループ
    while (currentDate <= lastDate) {
        const dateStr = formatDateString(currentDate);
        
        let fileName = '';
        if (splitPerName && characterName) {
            fileName = `Log ${dateStr} - ${characterName.toLowerCase()}.txt`;
        } else {
            fileName = `Log ${dateStr}.txt`;
        }

        try {
            // ファイルの存在確認とハンドル取得
            const fileHandle = await folderHandle.getFileHandle(fileName, { create: false });
            
            // 3. processLogFile() に処理を委譲
            await processLogFile(fileHandle, fileName, dateStr, splitPerName ? characterName : null, optionTakeCatch, optionPotion, optionSpell, optionReagent);

        } catch (err) {
            if (err.name !== 'NotFoundError') {
                console.error(`ファイル取得エラー (${fileName}):`, err);
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 集計結果を追記
    addTotalData(optionTakeCatch, optionPotion, optionSpell, optionReagent);

    // 集計結果を表示
    document.getElementById('resultContainer').value = resultLogs.join('\n');
}

/**
 * 日付フォーマットヘルパー
 * @param {*} date 
 * @returns {string} yyyy-mm-dd
 */
function formatDateString(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * ログファイルを処理する
 * @param {FileHandle} fileHandle 
 * @param {string} fileName 
 * @param {string} dateStr 
 * @param {string} characterName 
 */
async function processLogFile(fileHandle, fileName, dateStr, characterName, optionTakeCatch, optionPotion, optionSpell, optionReagent) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    
    // 改行コードで分割して配列化
    const logLines = text.split(/\r\n|\r|\n/);

    const fileData = {
        fileName: fileName,
        date: dateStr,
        character: characterName,
        lines: logLines,
        text: text,
        optionTakeCatch: optionTakeCatch,
        optionPotion: optionPotion,
        optionSpell: optionSpell,
        optionReagent: optionReagent
    };

    // 4. researchLogs() へ配列（またはファイルデータ）を渡す
    researchLogs(fileData);
}