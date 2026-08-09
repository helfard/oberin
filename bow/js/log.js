/**
 * log.js
 * テキストログの処理
 * 言語辞書を使うのでlang.jsより後に読み込むこと
 */

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
 * @returns {Promise<FileSystemDirectoryHandle|undefined>} 取得したハンドル（存在しない場合はundefined）
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
 * ページ読み込み時にIndexedDBから保存されたフォルダハンドルを復元し、
 * ユーザーのインタラクション（クリック）をトリガーにファイル権限を要求して監視を開始する
 */
async function restoreFolder() {
    try {
        const savedHandle = await loadFolderHandle();
        
        // 保存されたフォルダハンドルがない場合
        if (!savedHandle) {
            document.getElementById('status').textContent = MESSAGES.statusNotSelected[currentLang];
            return;
        }

        // 保存されたフォルダハンドルがある場合
        folderHandle = savedHandle;
        
        // currentLangを参照して多言語テキストを表示
        document.getElementById('status').innerHTML = 
            `${MESSAGES.restoreFound[currentLang]}<strong>${folderHandle.name}</strong>` +
            `${MESSAGES.restoreGuide[currentLang]}`;

        // ユーザーが画面をクリックしたタイミングでパーミッションを要求するハンドラー関数
        const requestFolderPermission = async () => {
            try {
                const opts = { mode: 'read' };
                // 権限のチェックと要求
                if (await folderHandle.queryPermission(opts) === 'granted' || 
                    await folderHandle.requestPermission(opts) === 'granted') {
                    
                    // 権限が許可されたらイベントリスナーを削除して監視処理を開始
                    window.removeEventListener('click', requestFolderPermission);
                    startMonitoring();
                }
            } catch (pErr) {
                // 権限の要求に失敗した場合
                console.error("アクセス許可エラー:", pErr);
                document.getElementById('status').textContent = MESSAGES.statusPermissionDenied[currentLang];
            }
        };

        // 画面クリックのイベントをセット（安全のため一度外してから登録）
        window.removeEventListener('click', requestFolderPermission); // ※初回は意味がないが残しても無害
        window.addEventListener('click', requestFolderPermission, { once: true });

    } catch (err) {
        // IndexedDBの読み込み自体に失敗した場合
        console.error("復元失敗の詳細ログ:", err);
        document.getElementById('status').textContent = MESSAGES.statusRestoreFailed[currentLang];
    }
}

/**
 * ページ読み込み完了時にLogsフォルダの設定を自動復元する
 */
window.addEventListener('DOMContentLoaded', restoreFolder);

/**
 * フォルダ選択ダイアログを表示し、ユーザーが選択したディレクトリをIndexedDBに保存して監視を開始する
 */
async function selectFolder() {
    // ブラウザがFile System Access APIをサポートしているかチェック
    if (!window.showDirectoryPicker) {
        alert(MESSAGES.statusNotSupported[currentLang] || "お使いのブラウザはこの機能に対応していません。PC版のChromeやEdgeをご利用ください。");
        return;
    }

    document.getElementById('status').textContent = MESSAGES.statusSelecting[currentLang];
    
    try {
        // ユーザーが選択したフォルダを取得
        folderHandle = await window.showDirectoryPicker();
        
        // 取得したフォルダハンドルをIndexedDBに永続化保存
        await saveFolderHandle(folderHandle);
        
        // フォルダの監視処理を開始
        startMonitoring();
    } catch (err) {
        // ユーザーがダイアログをキャンセルした場合のハンドリング
        if (err.name === 'AbortError') {
            console.log('ユーザーによってフォルダ選択がキャンセルされました。');
            document.getElementById('status').textContent = MESSAGES.statusNotSelected[currentLang];
            return;
        }

        // 予期せぬエラーが発生した場合のログ出力と通知
        console.error(err);
        alert(MESSAGES.statusFailed[currentLang]);
        document.getElementById('status').textContent = MESSAGES.statusFailed[currentLang];
    }
}

/**
 * フォルダの監視タスクを開始する
 * 状態表示を更新し、初回ログ読み込みを実行した上で、定期実行タイマーをセットする
 */
async function startMonitoring() {
    // 選択されている言語に合わせて「監視中: フォルダ名」のステータスを表示
    document.getElementById('status').textContent = `${MESSAGES.statusMonitoring[currentLang]}${folderHandle.name}`;
    
    // 初回のログ読み込み処理を実行
    await checkAndRefreshLog(true);

    // 既存のタイマーが存在する場合はクリアして多重起動を防ぐ
    if (timerId) {
        clearInterval(timerId);
    }
    
    // 一定間隔（INTERVAL）ごとに更新をチェックするタイマーを設定
    timerId = setInterval(() => checkAndRefreshLog(false), INTERVAL);
}

/**
 * 指定されたディレクトリハンドル内から、最も最後に更新されたテキストファイルを取得する
 * @param {FileSystemDirectoryHandle} dirHandle - 走査対象のディレクトリハンドル
 * @returns {Promise<FileSystemDirectoryHandle|null>} 最新のテキストファイルのハンドル（存在しない場合はnull）
 */
async function getLatestTextFileHandle(dirHandle) {
    let latestFile = null;
    let latestMtime = 0;

    // フォルダ内の全エントリを非同期で走査
    for await (const entry of dirHandle.values()) {
        // エントリがファイルであり、かつ拡張子が '.txt' の場合
        if (entry.kind === 'file' && entry.name.endsWith('.txt')) {
            // ファイルのメタデータ（最終更新日時など）を取得するため File オブジェクトに変換
            const file = await entry.getFile();

            // 記録されている日時よりも新しい更新日時である場合
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
 * @param {boolean} [isFirstTime=false] - 初回起動時かどうか
 */
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
                        logArray = logArray.concat(oldLines); // 古い最後のログを合体
                    }
                } catch (oldErr) {
                    console.error("古いファイルの最終読み込みに失敗:", oldErr);
                }
            }

            // 新ファイルへの切り替え準備
            currentFileHandle = latestEntry;
            currentFileName = latestEntry.name;
            currentFileSize = 0; // 新ファイルは0バイトからスタート
        }

        // 現在開いているログファイルを更新
        currentFileHandle = latestEntry;
        currentFileName = latestEntry.name;

        if (isFirstTime) {
            // 初回起動時：末尾の一定サイズ（50KB）だけを読み込んで規定行数切り出す
            currentFileSize = file.size;
            const readStart = Math.max(0, file.size - 50000);
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

/**
 * ログの1行を解析し、タイムスタンプ・本文・ログタイプに分類する
 * @param {string} line - 解析対象のログの1行
 * @returns {[string, string, string]} [タイムスタンプ, 本文, ログのタイプ] の配列
 */
function parseLogLine(line) {
    // 会話ログのパターン
    const chatPattern = /^\[(.*?)\]: (\((.*?)\): (.*))$/;
    let match = line.match(chatPattern);
    if (match) {
        const [_, timestamp, body, name, message] = match;
        return [timestamp, body, 'chatLog'];
    }

    // Sextant のパターン
    const coordPattern = /^\[(.*?)\]: ((\d+) N by (\d+) E)$/;
    match = line.match(coordPattern);
    if (match) {
        // 外部の関数に座標を送信
        sextantCoordinates(match[3], match[4]); // [N, E]
        return [match[1], match[2], 'systemLog'];
    }

    // Orb of Seeing のパターン
    const posPattern = /^\[(.*?)\]: ((.*?) is roughly (\d+) ([NS]) and (\d+) ([EW]) of your position\.)$/;
    match = line.match(posPattern);
    if (match) {
        // 外部の関数に詳細な位置データを送信
        // matchの中身: [全体, 本文, 名前, 距離1, 方向1, 距離2, 方向2]
        orbCoordinates(match[3], match[4], match[5], match[6], match[7]);
        return [match[1], match[2], 'systemLog'];
    }

    // システムメッセージのパターン
    const normalPattern = /^\[(.*?)\]: (.*)$/;
    match = line.match(normalPattern);
    if (match) {
        // TODO: ここで統計データが取れそうなので後日検証する
        return [match[1], match[2], 'systemLog'];
    }

    // いずれにも当てはまらない場合は謎のログとしてそのまま返す
    return ['', line, 'etc'];
}

/**
 * ログ配列を解析・重複まとめ・フィルター適用を行い、UIコンテナに表示する
 */
function displayLogs() {
    const container = document.getElementById('logContainer');
    const timeStampIsChecked = document.getElementById('timeStamp')?.checked;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked;

    // 重複チェック用のMap
    // キー: ログ本文 (body)
    // 値: { timestamp: '...', body: '...', count: number, logType: '...' }
    const logMap = new Map();

    for (let i = 0; i < logArray.length; i++) {
        const line = logArray[i].trim();
        if (!line) continue;

        // 1行を解析し [タイムスタンプ, 本文, ログタイプ] を取得
        // （内部でSextantやOrb of Seeingの外部関数呼び出しも実行される）
        const [timestamp, body, logType] = parseLogLine(line);

        if (logMap.has(body)) {
            // すでに同じ本文が存在する場合は出現カウントを増やす
            const existing = logMap.get(body);
            existing.count++;
        } else {
            // 初めて登場する本文の場合：新しくマップに登録
            logMap.set(body, { timestamp, body, count: 1, logType });
        }
    }

    // 画面表示用の文字列配列に変換
    const processedLines = [];
    for (const [_, item] of logMap) {
        // チェックボックスの状態に応じてログタイプをフィルタリング
        if (!chatLogIsChecked && item.logType === 'chatLog') continue;
        if (!systemLogIsChecked && item.logType === 'systemLog') continue;

        // タイムスタンプの有無とチェックボックスの状態に応じて表示形式を組み立てる
        const formattedLine = item.timestamp && timeStampIsChecked
            ? `[${item.timestamp}]: ${item.body}` 
            : item.body;

        // 2回以上出現している場合は末尾にカウント（例: *3）を付与
        processedLines.push(formattedLine + (item.count > 1 ? ` *${item.count}` : ''));
    }

    // テキストエリア等のコンテナに連結して流し込み、最下部にスクロールする
    container.value = processedLines.join('\n');
    container.scrollTop = container.scrollHeight;

    // マスクを解除して地図やコンテンツを開示
    removeMask();
}

/**
 * ストレージから表示設定（タイムスタンプ、チャットログ、システムログの表示有無）をロードし、
 * 対応するチェックボックスのUI状態に反映させる
 */
function loadDisplaySettings() {
    const timeStampIsChecked = loadStorage('ShowTimeStamp', true);
    const chatLogIsChecked = loadStorage('ShowChatLog', true);
    const systemLogIsChecked = loadStorage('ShowSystemLog', true);

    // 取得した設定値を各チェックボックスに反映
    document.getElementById('timeStamp').checked = timeStampIsChecked;
    document.getElementById('chatLog').checked = chatLogIsChecked;
    document.getElementById('systemLog').checked = systemLogIsChecked;
}

/**
 * ページ読み込み完了（DOMContentLoaded）のタイミングで、
 * 保存されている表示設定をロードしてチェックボックスに反映させる
 */
window.addEventListener('DOMContentLoaded', loadDisplaySettings);

/**
 * 画面上のチェックボックスの状態を取得してストレージに保存し、ログの表示を更新する
 */
function changeDisplaySettings() {
    const timeStampIsChecked = document.getElementById('timeStamp')?.checked;
    const chatLogIsChecked = document.getElementById('chatLog')?.checked;
    const systemLogIsChecked = document.getElementById('systemLog')?.checked;

    // 各表示設定の状態をストレージに保存する
    saveStorage('ShowTimeStamp', timeStampIsChecked);
    saveStorage('ShowChatLog', chatLogIsChecked);
    saveStorage('ShowSystemLog', systemLogIsChecked);

    // 設定の変更を反映してログを再描画する
    displayLogs();
}

/**
 * 保持しているログ配列を空にし、画面の表示をクリアして更新する
 */
function clearLog() {
    logArray = [];
    displayLogs();
}

/**
 * 現在の言語に応じたAIへの指示の例をクリップボードにコピーし、完了アラートを表示する
 */
function copyInstruction() {
    const text = MESSAGES.aiInstruction[currentLang];
    execCopy(text);
    alert(MESSAGES.copied[currentLang]);
}
