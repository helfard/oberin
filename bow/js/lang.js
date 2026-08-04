// lang.js
// 　言語切り替え処理
// 　ローカルストレージの処理があるのでcommon.jsより後に読み込むこと

// デフォルトの言語設定
let currentLang = 'ja';

// 言語別辞書
const MESSAGES = Object.freeze({
    // 固定UI用
    pageTitle: { 'ja': '放浪者の書', 'en': 'The Book of Wanderer' },
    headerTitle: { 'ja': '放浪者の書', 'en': 'The Book of Wanderer' },
    toIndex: { 'ja': 'トップページ', 'en': 'Top Page' },
    logsFolder: { 'ja': 'Logsフォルダ', 'en': 'Logs Folder' },
    btnSelectFolder: { 'ja': 'フォルダを選択', 'en': 'Select the Folder' },
    sextantAndOrb: { 'ja': 'SextantとOrb of Seeing', 'en': 'Sextant and Orb of Seeing' },
    coordN: { 'ja': 'N: ', 'en': 'N: ' },
    coordE: { 'ja': ', E: ', 'en': ', E: ' },
    resetMap: { 'ja': 'マップを初期化', 'en': 'Reset the map' },
    clearPins: { 'ja': '古いピンを削除', 'en': 'Clear old pins' },
    confirmResetMap: { 'ja': '本当に地図を初期化してもよろしいですか？', 'en': 'Are you sure you want to reset the map?' },
    textLogs: { 'ja': 'Text Logs', 'en': 'Text Logs' },
    timeStampLabel: { 'ja': 'タイムスタンプ', 'en': 'Timestamp' },
    chatLogLabel: { 'ja': '会話ログ', 'en': 'Chat Log' },
    systemLogLabel: { 'ja': 'システムログ', 'en': 'System Log' },
    duplicateLog: { 'ja': '重複行をまとめる', 'en': 'Deduplicate logs' },
    btnClearLog: { 'ja': 'ログを消去', 'en': 'Clear Log' },
    btnCopyExample: { 'ja': 'AIへの指示の例をコピー', 'en': 'Copy AI instruction example' },
    // フォルダ監視・復元用動的メッセージ
    statusSelecting: { 'ja': 'フォルダを選択しています…', 'en': 'Selecting a folder...' },
    statusFailed: { 'ja': 'フォルダの選択に失敗しました。', 'en': 'Failed to select the folder.' },
    statusNotSelected: { 'ja': 'フォルダが選択されていません。ボタンから選択してください。', 'en': 'No folder selected. Please select a folder using the button.' },
    statusRestoreFailed: { 'ja': 'フォルダの自動復元に失敗しました。ブラウザのコンソール(F12)を確認してください。', 'en': 'Failed to restore the folder automatically. Please check the browser console (F12).' },
    statusPermissionDenied: { 'ja': 'アクセスが拒否されたか、ブラウザが対応していません。', 'en': 'Access denied or browser not supported.' },
    // 監視フォルダの自動復元
    restoreFound: { 
        'ja': '前回のフォルダが見つかりました:',
        'en': 'Previous folder found:'
    },
    restoreGuide: { 
        'ja': '<br><strong>画面のどこでも良いので1回クリックすると、アクセス許可ポップアップが表示され監視を再開します。</strong>', 
        'en': '<br><strong>Click anywhere on the screen once to show the permission popup and resume monitoring.</strong>' 
    },
    // ログファイル監視中
    statusMonitoring: { 'ja': '監視中： ', 'en': 'Monitoring: ' },
    statusFileNotFound: { 'ja': 'テキストファイルが見つかりません。', 'en': 'Text file not found.' },
    statusFileChanged: { 'ja': 'ファイル変更を検知: ', 'en': 'File change detected: ' },
    // AIへの指示
    aiInstruction: {
        'ja': '画面の <textarea id="logContainer"> にある文字列を取得し、その文字列を日本語に翻訳して表示してください。以降は『。』のような意味のない入力をするたびに同様にして文字列を再取得して翻訳してください。意味のある文章を入力した場合はその入力を英語に翻訳し、また『終了』と入力されたらこの処理を終了してください。',
        'en': 'Get the text strings in the `<textarea id="logContainer">` on the page, and translate those strings into English to display them. From now on, whenever an meaningless input like "." is entered, retrieve the text strings again in the same way and translate them. If a meaningful input is entered, translate this input into Romaji Japanese, and if "Exit" is entered, end this process.'
    },
    copied: {
        'ja': 'コピーしました！',
        'en': 'Copied!',
    },
});

// 表示言語の切り替え
const setLanguage = (lang) => {
    // グローバル変数を更新
    currentLang = lang;
    // 表示言語の切り替え
    for (const id in MESSAGES) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = MESSAGES[id][currentLang];
        }
    }
    // ローカルストレージに現在の言語設定を保存
    saveStorage('Lang', currentLang);
};
// ローカルストレージから言語設定を取得
const getLanguage = () => {
    // ローカルストレージから言語設定を取得（初期値がnullなら 'ja'）
    const savedLang = loadStorage('Lang') ?? 'ja';
    // 判別した言語で画面を切り替え＆グローバル変数に反映
    setLanguage(savedLang);
};
// ページ読み込み完了時に言語設定を読み込む
window.addEventListener('DOMContentLoaded', getLanguage);
