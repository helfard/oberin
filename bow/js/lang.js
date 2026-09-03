/**
 * lang.js
 * 言語切り替え処理
 * ※ローカルストレージの処理があるため、common.jsより後に読み込むこと
 */

// デフォルトの言語設定
let currentLang = 'ja';

/**
 * 言語別辞書オブジェクト
 */
const MESSAGES = Object.freeze({
    // 固定UI用
    pageTitle: { 'ja': '放浪者の書', 'en': 'The Book of Wanderer' },
    headerTitle: { 'ja': '放浪者の書', 'en': 'The Book of Wanderer' },
    toIndexTop: { 'ja': 'トップページ', 'en': 'Top Page' },
    toIndexBottom: { 'ja': 'トップページ', 'en': 'Top Page' },
    logsFolder: { 'ja': 'Logsフォルダ', 'en': 'Logs Folder' },
    btnSelectFolder: { 'ja': 'フォルダを選択', 'en': 'Select the Folder' },
    sextantAndOrb: { 'ja': 'SextantとOrb of Seeing', 'en': 'Sextant and Orb of Seeing' },
    coordN: { 'ja': 'N: ', 'en': 'N: ' },
    coordE: { 'ja': ', E: ', 'en': ', E: ' },
    resetMap: { 'ja': 'マップを初期化', 'en': 'Reset the map' },
    clearPins: { 'ja': '古いピンを削除', 'en': 'Clear old pins' },
    confirmResetMap: { 'ja': '本当に地図を初期化してもよろしいですか？', 'en': 'Are you sure you want to reset the map?' },
    textLogs: { 'ja': 'Text Logs', 'en': 'Text Logs' },
    timeStampLabel: { 'ja': 'タイムスタンプ', 'en': 'Timestamp' },
    chatLogLabel: { 'ja': '会話ログ', 'en': 'Chat Log' },
    systemLogLabel: { 'ja': 'システムログ', 'en': 'System Log' },
    btnCopyInstruction: { 'ja': 'AIへの指示の例をコピー', 'en': 'Copy AI instruction example' },
    btnClearLog: { 'ja': 'ログを消去', 'en': 'Clear Log' },

    // フォルダ監視・復元用動的メッセージ
    statusNotSupported: { 'ja': 'お使いのブラウザは対応していません。', 'en': 'Your browser is not supported.' },
    statusSelecting: { 'ja': 'フォルダを選択しています…', 'en': 'Selecting a folder...' },
    statusFailed: { 'ja': 'フォルダの選択に失敗しました。', 'en': 'Failed to select the folder.' },
    statusNotSelected: { 'ja': 'フォルダが選択されていません。ボタンから選択してください。', 'en': 'No folder selected. Please select a folder using the button.' },
    statusRestoreFailed: { 'ja': 'フォルダの自動復元に失敗しました。ブラウザのコンソール(F12)を確認してください。', 'en': 'Failed to restore the folder automatically. Please check the browser console (F12).' },
    statusPermissionDenied: { 'ja': 'アクセスが拒否されたか、ブラウザが対応していません。', 'en': 'Access denied or browser not supported.' },

    // 監視フォルダの自動復元
    restoreFound: { 
        'ja': '前回のフォルダが見つかりました: ',
        'en': 'Previous folder found: '
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
        'ja': `これ以降『。』などの意味のない入力があれば '<textarea id="logContainer">' の最新の内容を所得して和訳して下さい。何らかの意味のある日本語の文章を入力した場合はそれを英訳して下さい。`,
        'en': `From now on, if I send any meaningless input such as '.', translate the current contents of '<textarea id="logContainer">' from romanized Japanese into English. If I enter a meaningful sentence, translate it into romanized Japanese (Romaji).`
    },
    copied: {
        'ja': 'コピーしました！',
        'en': 'Copied!',
    },

    // 自動翻訳機・手動翻訳機
    autoTranslator: {
        'ja': '自動翻訳機',
        'en': 'Auto Translator',
    },
    autoTranslateLabel: {
        'ja': 'テキストログを自動翻訳',
        'en': 'Translate text log automatically',
    },
    manualTranslator: {
        'ja': '手動翻訳機',
        'en': 'Manual Translator',
    },
    btnTranslate: {
        'ja': '翻訳',
        'en': 'Translate',
    },
    btnCopyTranslate: {
        'ja': 'コピー',
        'en': 'Copy',
    },
    statusInitializing: {
        'ja': '翻訳モデルを準備中（初回はダウンロードに時間がかかります）',
        'en': 'Initializing translation model (initial download may take a while)',
    },
    statusError: { 'ja': 'エラー', 'en': 'Error' },
    statusReady: { 'ja': '準備完了', 'en': 'Ready' },
    translateNotSupported: { 'ja': 'お使いのブラウザはTranslator APIに対応していません。', 'en': 'Your browser does not support the Translator API.' },
    downloadingProgress: { 'ja': 'モデルをダウンロード中... ({percent}%)', 'en': 'Downloading model... ({percent}%)' },
});

/**
 * 表示言語を切り替え、対応するUI要素を更新してローカルストレージに保存する
 * @param {string} lang - 言語コード ('ja' または 'en')
 */
const setLanguage = (lang) => {
    currentLang = lang;

    for (const id in MESSAGES) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = MESSAGES[id][currentLang];
        }
    }

    saveStorage('Lang', currentLang);

    // 自動翻訳機を表示（あるいは非表示）
    showTranslator();
};

/**
 * ローカルストレージから言語設定を取得し、初期言語として適用する
 */
const getLanguage = () => {
    const savedLang = loadStorage('Lang') ?? 'ja';
    setLanguage(savedLang);
};

window.addEventListener('DOMContentLoaded', getLanguage);