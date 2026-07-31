// log.js
// 　テキストログの処理
// 　言語辞書を使うのでlang.jsより後に読み込むこと

// 監視の間隔（ms）
const INTERVAL = 10000;
// 最大読込み行数
const INITIAL_LINES = 100;
// 最大保持行数
const MAX_LINES = 1000;

// フォルダ情報（ハンドル）
let folderHandle = null;
// 現在開いているログファイル（ハンドル）
let currentFileHandle = null;
// 現在開いているログファイル（名前）
let currentFileName = '';
// ログファイルのサイズ（バイト数）
let currentFileSize = 0;
// 生ログ（配列）
let logArray = [];
// 監視用タイマー
let timerId = null;

// IndexedDBに関する定数
const DB_NAME = 'FolderMonitorDB';
const STORE_NAME = 'handles';
const KEY_NAME = 'latestFolder';

// IndexedDBを開く
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            e.target.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}
// フォルダハンドルをIndexedDBに保存
async function saveFolderHandle(handle) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, KEY_NAME);
    return new Promise((resolve) => tx.oncomplete = resolve);
}
// フォルダハンドルをIndexedDBから読み込む
async function loadFolderHandle() {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(KEY_NAME);
    return new Promise((resolve) => request.onsuccess = () => resolve(request.result));
}
// ページ読み込み時のLogsフォルダの自動復元
async function restoreFolder() {
    try {
        const savedHandle = await loadFolderHandle();
        // 保存されたフォルダハンドルがある場合
        if (savedHandle) {
            folderHandle = savedHandle;
            // currentLangを参照して多言語テキストを表示
            document.getElementById('status').innerHTML = 
                `${MESSAGES.restoreFound[currentLang]}<strong>${folderHandle.name}</strong>` +
                `${MESSAGES.restoreGuide[currentLang]}`;
            // ユーザーが画面をクリックしたタイミングでパーミッションを要求する
            const activePermission = async () => {
                try {
                    const opts = { mode: 'read' };
                    // 権限のチェックと要求
                    if (await folderHandle.queryPermission(opts) === 'granted' || 
                        await folderHandle.requestPermission(opts) === 'granted') {
                        // 要求された権限がある場合
                        window.removeEventListener('click', activePermission);
                        startMonitoring();
                    }
                } catch (pErr) {
                    // 権限の要求に失敗した場合
                    console.error("アクセス許可エラー:", pErr);
                    document.getElementById('status').textContent = MESSAGES.statusPermissionDenied[currentLang];
                }
            };
            // 画面クリックのイベントをセット
            window.addEventListener('click', activePermission);
            return;
        }
        // フォルダが保存されていなかった場合
        document.getElementById('status').textContent = MESSAGES.statusNotSelected[currentLang];
    } catch (err) {
        // IndexedDBの読み込み自体に失敗した場合
        console.error("復元失敗の詳細ログ:", err);
        document.getElementById('status').textContent = MESSAGES.statusRestoreFailed[currentLang];
    }
}
// ページ読み込み時にLogsフォルダの設定を自動復元
window.addEventListener('DOMContentLoaded', restoreFolder);

// Logsフォルダを選択
async function selectFolder() {
    document.getElementById('status').textContent = MESSAGES.statusSelecting[currentLang];
    try {
        // ユーザーが選択したフォルダを取得
        folderHandle = await window.showDirectoryPicker();
        // IndexedDBに保存
        await saveFolderHandle(folderHandle);
        // 監視を開始
        startMonitoring();
    } catch (err) {
        // フォルダの選択に失敗した場合
        console.error(err);
        // エラーメッセージを表示
        alert(MESSAGES.statusFailed[currentLang]);
    }
}

// 監視タスクの開始
async function startMonitoring() {
    // 選択されている言語に合わせて「監視中: フォルダ名」を表示
    document.getElementById('status').textContent = `${MESSAGES.statusMonitoring[currentLang]}${folderHandle.name}`;
    // 初回処理
    await checkAndRefreshLog(true);
    // 30秒ごとに更新をチェック
    if (timerId) {
        clearInterval(timerId);
    }
    timerId = setInterval(() => checkAndRefreshLog(false), INTERVAL);
}

// フォルダ内から最も最後に更新されたテキストファイルを取得
async function getLatestTextFileHandle(dirHandle) {
    let latestFile = null;
    let latestMtime = 0;
    // フォルダ内の全ファイルを走査
    for await (const entry of dirHandle.values()) {
        // ログファイルの場合
        if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
            // ファイルの更新日時を取得
            const file = await entry.getFile();
            // 更新日時が最新の場合
            if (file.lastModified > latestMtime) {
                // 更新日時を更新
                latestMtime = file.lastModified;
                // 最新のファイルを保存
                latestFile = entry;
            }
        }
    }
    return latestFile;
}

// ログのチェック・読み込み
async function checkAndRefreshLog(isFirstTime = false) {
    if (!folderHandle) return;
    try {
        // 最新のログファイルを取得
        const latestEntry = await getLatestTextFileHandle(folderHandle);
        if (!latestEntry) {
            document.getElementById('status').textContent = MESSAGES.statusFileNotFound[currentLang];
            return;
        }
        // ファイルを取得
        const file = await latestEntry.getFile();
        // 日付変更などでファイル自体が変わった場合の処理
        if (currentFileName && currentFileName !== latestEntry.name) {
            document.getElementById('status').textContent = `${MESSAGES.statusFileChanged[currentLang]}${latestEntry.name}`;
            // 古いファイルに残った最後のログを取得
            if (currentFileHandle) {
                try {
                    const oldFile = await currentFileHandle.getFile();
                    if (oldFile.size > currentFileSize) {
                        const oldBlob = oldFile.slice(currentFileSize, oldFile.size);
                        const oldText = await oldBlob.text();
                        const oldLines = oldText.split(/\r?\n/);
                        logArray = logArray.concat(oldLines); // 古い最後のログを合体！
                    }
                } catch (oldErr) {
                    console.error("古いファイルの最終読み込みに失敗:", oldErr);
                }
            }
            // 新ファイルへの切り替え準備
            currentFileHandle = latestEntry;
            currentFileName = latestEntry.name;
            currentFileSize = 0; // 新ファイルは0バイト（先頭）からスタート
        }
        // 現在開いているログファイルを更新
        currentFileHandle = latestEntry;
        currentFileName = latestEntry.name;
        if (isFirstTime) {
            // 初回起動時：末尾の一定サイズ（例: 50KB）だけを読み込んで100行切り出す
            currentFileSize = file.size;
            const readStart = Math.max(0, file.size - 50000); // 50KB手前、または先頭
            const blob = file.slice(readStart, file.size);
            const text = await blob.text();
            // テキストを行に分解
            const allLines = text.split(/\r?\n/);
            // 最初の一行は途中で切れている可能性があるので除外（先頭から読んだ場合を除く）
            if (readStart > 0) allLines.shift(); 
            // 規定の行数だけ切り出し
            logArray = allLines.slice(-INITIAL_LINES);
            displayLogs();
        } else {
            // 2回目以降：サイズ（バイト数）の増減で差分をチェック
            if (file.size > currentFileSize) {
                // 増えたバイト分だけをピンポイントで読み込む
                const blob = file.slice(currentFileSize, file.size);
                const newText = await blob.text();
                // 現在のファイルサイズを更新
                currentFileSize = file.size;
                // 増えたテキストを行に分解して結合
                const newLines = newText.split(/\r?\n/);
                logArray = logArray.concat(newLines);
                // メモリ肥大化防止：保持する最大行数を制限
                if (logArray.length > MAX_LINES) {
                    logArray = logArray.slice(-MAX_LINES);
                }
                displayLogs();
            } else if (file.size < currentFileSize) {
                // ログがクリアされるなどでファイルが小さくなった場合、再読み込み
                currentFileSize = 0;
                logArray = [];
                await checkAndRefreshLog(true);
            }
        }
    } catch (error) {
        console.error("ファイル読み込みエラー:", error);
    }
}

// ログの解析
function parseLogLine(line) {
    // 会話の場合
    const chatPattern = /^\[(.*?)\]: (\((.*?)\): (.*))$/;
    let match = line.match(chatPattern);
    if (match) {
        const [_, timestamp, body, name, message] = match;
        return [timestamp, body, 'chatLog']; // [タイムスタンプ, 本文, ログのタイプ]
    }
    // Sextantの場合
    const coordPattern = /^\[(.*?)\]: ((\d+) N by (\d+) E)$/;
    match = line.match(coordPattern);
    if (match) {
        // 外部の関数に座標を飛ばす
        sextantCoordinates(match[3], match[4]); // [N, E]
        return [match[1], match[2], 'systemLog']; // [タイムスタンプ, 本文, ログのタイプ]
    }
    // Orb of Seeingの場合
    const posPattern = /^\[(.*?)\]: ((.*?) is roughly (\d+) ([NS]) and (\d+) ([EW]) of your position\.)$/;
    match = line.match(posPattern);
    if (match) {
        // 外部の関数に座標を飛ばす
        // matchの中身は[タイムスタンプ, 本文, 名前, 距離1, 方向1, 距離2, 方向2]
        orbCoordinates(match[3], match[4], match[5], match[6], match[7]); // [名前, 距離1, 方向1, 距離2, 方向2]
        return [match[1], match[2], 'systemLog']; // [タイムスタンプ, 本文, ログのタイプ]
    }
    // システムメッセージのログ
    const normalPattern = /^\[(.*?)\]: (.*)$/;
    match = line.match(normalPattern);
    if (match) {
        // ここで統計が取れそうな気がする・・後日検証
        return [match[1], match[2], 'systemLog']; // [タイムスタンプ, 本文, ログのタイプ]
    }
    // それ以外の場合はそのまま返す
    return ['', line, 'etc'];
}
// ログを表示
// 重複する行は極力まとめる
function displayLogs() {
    const container = document.getElementById('logContainer');
    const timeStampIsChecked = document.getElementById('timeStamp')?.checked;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked;
    // 重複チェック用のMap
    // キー: ログ本文 (body)
    // 値: { timestamp: '...', count: 1, logType: '...' }
    const logMap = new Map();
    for (let i = 0; i < logArray.length; i++) {
        const line = logArray[i].trim();
        if (!line) continue;
        // [タイムスタンプ, 本文, ログのタイプ] を受け取る
        // ついでにSextantとOrb of Seeingの処理が行われる
        const [timestamp, body, logType] = parseLogLine(line);
        if (logMap.has(body)) {
            // すでに同じ本文が存在する場合はカウントを増やす
            const existing = logMap.get(body);
            existing.count++;
        } else {
            // 初めて登場する本文の場合：新しく登録
            logMap.set(body, { timestamp, body, count: 1, logType: logType });
        }
    }
    // 画面表示用の文字列配列に変換
    const processedLines = [];
    for (const [_, item] of logMap) {
        if (!chatLogIsChecked && item.logType === 'chatLog') continue;
        if (!systemLogIsChecked && item.logType === 'systemLog') continue;
        // タイムスタンプの有無で組み立てを分ける
        const formattedLine = item.timestamp && timeStampIsChecked
            ? `[${item.timestamp}]: ${item.body}` 
            : item.body;
        processedLines.push(formattedLine + (item.count > 1 ? ` *${item.count}` : ''));
    }
    // 配列を連結して表示
    container.textContent = processedLines.join('\n');
    container.scrollTop = container.scrollHeight;
}

// 表示設定のロード
function loadDisplaySettings() {
    const timeStampIsChecked = loadStorage('TimeStamp', true);
    const chatLogIsChecked = loadStorage('ChatLog', true);
    const systemLogIsChecked = loadStorage('SystemLog', true);
    document.getElementById('timeStamp').checked = timeStampIsChecked;
    document.getElementById('chatLog').checked = chatLogIsChecked;
    document.getElementById('systemLog').checked = systemLogIsChecked;
}
// DOMContentLoaded時に表示設定をロード
window.addEventListener('DOMContentLoaded', loadDisplaySettings);

// 表示設定の変更
function changeDisplaySettings() {
    const timeStampIsChecked = document.getElementById('timeStamp')?.checked;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked;
    // 表示設定を保存する
    saveStorage('TimeStamp', timeStampIsChecked);
    saveStorage('ChatLog', chatLogIsChecked);
    saveStorage('SystemLog', systemLogIsChecked);
    // ログを再表示
    displayLogs();
}

// ログをクリア
function clearLog() {
    logArray = [];
    displayLogs();
}

// AIへの指示の例をコピー
function copyExample() {
    const text = MESSAGES.aiInstruction[currentLang];
    execCopy(text);
    alert(MESSAGES.copied[currentLang]);
}
