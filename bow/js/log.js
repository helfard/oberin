/**
 * log.js
 * テキストログの処理
 */

// 監視の間隔（ms）
const MONITOR_INTERVAL = 10000;
// 最大読込み行数
const INITIAL_LINES = 100;
// 最大保持行数
const MAX_LINES = 1000;

// フォルダ情報・状態
let folderHandle = null;
let currentFileHandle = null;
let currentFileName = '';
let currentFileSize = 0;
let logArray = [];
let monitorTimerId = null;

// IndexedDBに関する定数
const DB_NAME = 'FolderMonitorDB(BoW)';
const STORE_NAME = 'handles';
const KEY_NAME = 'latestFolder';

/**
 * IndexedDBのデータベースを開く
 * @param {number} [version=1] - データベースのバージョン
 * @returns {Promise<IDBDatabase>} 開いたデータベースのインスタンス
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

        request.onsuccess = ({ target }) => {
            resolve(target.result);
        };

        request.onerror = ({ target }) => {
            reject(target.error);
        };
    });
}

/**
 * フォルダのハンドルをIndexedDBに保存する
 * @param {FileSystemDirectoryHandle} handle - 保存するフォルダハンドル
 * @returns {Promise<void>}
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
 * @returns {Promise<FileSystemDirectoryHandle|undefined>}
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
 * フォルダ設定を自動復元する
 */
async function restoreFolder() {
    const statusElem = document.getElementById('status');
    try {
        const savedHandle = await loadFolderHandle();
        
        if (!savedHandle) {
            if (statusElem) statusElem.textContent = MESSAGES.statusNotSelected[currentLang];
            return;
        }

        folderHandle = savedHandle;
        
        if (statusElem) {
            statusElem.innerHTML = 
                `${MESSAGES.restoreFound[currentLang]}<strong>${folderHandle.name}</strong>` +
                `${MESSAGES.restoreGuide[currentLang]}`;
        }

        const requestFolderPermission = async () => {
            try {
                const opts = { mode: 'read' };
                if (await folderHandle.queryPermission(opts) === 'granted' || 
                    await folderHandle.requestPermission(opts) === 'granted') {
                    window.removeEventListener('click', requestFolderPermission);
                    startMonitoring();
                }
            } catch (pErr) {
                console.error("アクセス許可エラー:", pErr);
                if (statusElem) statusElem.textContent = MESSAGES.statusPermissionDenied[currentLang];
            }
        };

        window.removeEventListener('click', requestFolderPermission);
        window.addEventListener('click', requestFolderPermission, { once: true });

    } catch (err) {
        console.error("復元失敗の詳細ログ:", err);
        if (statusElem) statusElem.textContent = MESSAGES.statusRestoreFailed[currentLang];
    }
}

window.addEventListener('DOMContentLoaded', restoreFolder);

/**
 * フォルダ選択ダイアログを表示し、監視を開始する
 */
async function selectFolder() {
    const statusElem = document.getElementById('status');
    if (!window.showDirectoryPicker) {
        alert(MESSAGES.statusNotSupported[currentLang] || "お使いのブラウザはこの機能に対応していません。");
        return;
    }

    if (statusElem) statusElem.textContent = MESSAGES.statusSelecting[currentLang];
    
    try {
        folderHandle = await window.showDirectoryPicker();
        await saveFolderHandle(folderHandle);
        startMonitoring();
    } catch (err) {
        if (err.name === 'AbortError') {
            if (statusElem) statusElem.textContent = MESSAGES.statusNotSelected[currentLang];
            return;
        }

        console.error(err);
        alert(MESSAGES.statusFailed[currentLang]);
        if (statusElem) statusElem.textContent = MESSAGES.statusFailed[currentLang];
    }
}

/**
 * フォルダの監視タスクを開始する
 */
async function startMonitoring() {
    const statusElem = document.getElementById('status');
    if (statusElem && folderHandle) {
        statusElem.textContent = `${MESSAGES.statusMonitoring[currentLang]}${folderHandle.name}`;
    }
    
    await checkAndRefreshLog(true);

    if (monitorTimerId) {
        clearInterval(monitorTimerId);
    }
    
    monitorTimerId = setInterval(() => checkAndRefreshLog(false), MONITOR_INTERVAL);
}

/**
 * 最新のテキストファイルハンドルを取得する
 * @param {FileSystemDirectoryHandle} dirHandle 
 * @returns {Promise<FileSystemDirectoryHandle|null>}
 */
async function getLatestTextFileHandle(dirHandle) {
    let latestFile = null;
    let latestMtime = 0;

    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
            const file = await entry.getFile();
            if (file.lastModified > latestMtime) {
                latestMtime = file.lastModified;
                latestFile = entry;
            }
        }
    }

    return latestFile;
}

/**
 * ログのチェック・読み込み処理
 * @param {boolean} [isFirstTime=false] 
 */
async function checkAndRefreshLog(isFirstTime = false) {
    if (!folderHandle) return;
    const statusElem = document.getElementById('status');

    try {
        const latestEntry = await getLatestTextFileHandle(folderHandle);
        if (!latestEntry) {
            if (statusElem) statusElem.textContent = MESSAGES.statusFileNotFound[currentLang];
            return;
        }

        const file = await latestEntry.getFile();

        if (currentFileName && currentFileName !== latestEntry.name) {
            if (statusElem) statusElem.textContent = `${MESSAGES.statusFileChanged[currentLang]}${latestEntry.name}`;
            
            if (currentFileHandle) {
                try {
                    const oldFile = await currentFileHandle.getFile();
                    if (oldFile.size > currentFileSize) {
                        const oldBlob = oldFile.slice(currentFileSize, oldFile.size);
                        const oldText = await oldBlob.text();
                        const oldLines = oldText.split(/\r?\n/);
                        logArray = logArray.concat(oldLines);
                    }
                } catch (oldErr) {
                    console.error("古いファイルの最終読み込みに失敗:", oldErr);
                }
            }

            currentFileHandle = latestEntry;
            currentFileName = latestEntry.name;
            currentFileSize = 0;
        }

        currentFileHandle = latestEntry;
        currentFileName = latestEntry.name;

        if (isFirstTime) {
            currentFileSize = file.size;
            const readStart = Math.max(0, file.size - 50000);
            const blob = file.slice(readStart, file.size);
            const text = await blob.text();
            
            const allLines = text.split(/\r?\n/);
            if (readStart > 0) allLines.shift(); 
            
            logArray = allLines.slice(-INITIAL_LINES);
            displayLogs();
        } else {
            if (file.size > currentFileSize) {
                const blob = file.slice(currentFileSize, file.size);
                const newText = await blob.text();
                
                currentFileSize = file.size;
                
                const newLines = newText.split(/\r?\n/);
                logArray = logArray.concat(newLines);
                
                if (logArray.length > MAX_LINES) {
                    logArray = logArray.slice(-MAX_LINES);
                }
                displayLogs();
            } else if (file.size < currentFileSize) {
                currentFileSize = 0;
                logArray = [];
                await checkAndRefreshLog(true);
            }
        }
    } catch (error) {
        console.error("ファイル読み込みエラー:", error);
    }
}

/**
 * ログ行を解析する
 * @param {string} line 
 * @returns {[string, string, string]}
 */
function parseLogLine(line) {
    const chatPattern = /^\[(.*?)\]: (\((.*?)\): (.*))$/;
    let match = line.match(chatPattern);
    if (match) {
        return [match[1], match[2], 'chatLog'];
    }

    const coordPattern = /^\[(.*?)\]: ((\d+) N by (\d+) E)$/;
    match = line.match(coordPattern);
    if (match) {
        sextantCoordinates(match[3], match[4]);
        return [match[1], match[2], 'systemLog'];
    }

    const posPattern = /^\[(.*?)\]: ((.*?) is roughly (\d+) ([NS]) and (\d+) ([EW]) of your position\.)$/;
    match = line.match(posPattern);
    if (match) {
        orbCoordinates(match[3], match[4], match[5], match[6], match[7]);
        return [match[1], match[2], 'systemLog'];
    }

    const normalPattern = /^\[(.*?)\]: (.*)$/;
    match = line.match(normalPattern);
    if (match) {
        return [match[1], match[2], 'systemLog'];
    }

    return ['', line, 'etc'];
}

/**
 * ログを解析・フィルタリングして画面に描画する
 */
function displayLogs() {
    const container = document.getElementById('logContainer');
    if (!container) return;

    const timeStampIsChecked = document.getElementById('timeStamp')?.checked;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked;

    const logMap = new Map();

    for (let i = 0; i < logArray.length; i++) {
        const line = logArray[i].trim();
        if (!line) continue;

        const [timestamp, body, logType] = parseLogLine(line);

        if (logMap.has(body)) {
            const existing = logMap.get(body);
            existing.count++;
        } else {
            logMap.set(body, { timestamp, body, count: 1, logType });
        }
    }

    const processedLines = [];
    for (const [_, item] of logMap) {
        if (!chatLogIsChecked && item.logType === 'chatLog') continue;
        if (!systemLogIsChecked && item.logType === 'systemLog') continue;

        const formattedLine = item.timestamp && timeStampIsChecked
            ? `[${item.timestamp}]: ${item.body}` 
            : item.body;

        processedLines.push(formattedLine + (item.count > 1 ? ` *${item.count}` : ''));
    }

    container.value = processedLines.join('\n');
    container.scrollTop = container.scrollHeight;

    if (typeof removeMask === 'function') {
        removeMask();
    }
    if (typeof autoTranslation === 'function') {
        autoTranslation();
    }
}

/**
 * 表示設定をロードしてUIに反映させる
 */
function loadDisplaySettings() {
    const timeStampIsChecked = loadStorage('ShowTimeStamp', true);
    const chatLogIsChecked = loadStorage('ShowChatLog', true);
    const systemLogIsChecked = loadStorage('ShowSystemLog', true);

    const tsElem = document.getElementById('timeStamp');
    const clElem = document.getElementById('chatLog');
    const slElem = document.getElementById('systemLog');

    if (tsElem) tsElem.checked = timeStampIsChecked;
    if (clElem) clElem.checked = chatLogIsChecked;
    if (slElem) slElem.checked = systemLogIsChecked;
}

window.addEventListener('DOMContentLoaded', loadDisplaySettings);

/**
 * 表示設定を変更して保存する
 */
function changeDisplaySettings() {
    const timeStampIsChecked = document.getElementById('timeStamp')?.checked ?? true;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked ?? true;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked ?? true;

    saveStorage('ShowTimeStamp', timeStampIsChecked);
    saveStorage('ShowChatLog', chatLogIsChecked);
    saveStorage('ShowSystemLog', systemLogIsChecked);

    displayLogs();
}

/**
 * ログをクリアする
 */
function clearLog() {
    logArray = [];
    displayLogs();
}

/**
 * AIへの指示をコピーする
 */
function copyInstruction() {
    const text = MESSAGES.aiInstruction[currentLang];
    execCopy(text);
    alert(MESSAGES.copied[currentLang]);
}