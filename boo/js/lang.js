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
    pageTitle: { 'ja': '観測者の書', 'en': 'The Book of Observer' },
    headerTitle: { 'ja': '観測者の書', 'en': 'The Book of Observer' },
    toIndexTop: { 'ja': 'トップページ', 'en': 'Top Page' },
    toIndexBottom: { 'ja': 'トップページ', 'en': 'Top Page' },

    logsFolder: { 'ja': 'Logsフォルダ', 'en': 'Logs Folder' },
    btnSelectFolder: { 'ja': 'フォルダを選択', 'en': 'Select the Folder' },
    options: { 'ja': '各種設定', 'en': 'Set options' },
    fromDateLabel: { 'ja': '開始日：', 'en': 'From: ' },
    toDateLabel: { 'ja': '終了日：', 'en': 'To: ' },
    splitPerNameLabel: { 'ja': 'Logs are splited per name', 'en': 'Logs are splited per name' },
    characterNameLabel: { 'ja': 'キャラクター名：', 'en': 'Character Name: ' },
    optionTakeCatchLabel: { 'ja': 'Take/Catch', 'en': 'Take/Catch' },
    optionPotionLabel: { 'ja': 'Potion', 'en': 'Potion' },
    optionMageryLabel: { 'ja': 'Magery', 'en': 'Magery' },
    optionReagentLabel: { 'ja': 'Reagent', 'en': 'Reagent' },
    btnStartResearch: { 'ja': '集計開始', 'en': 'Start Research' },

    result: { 'ja': '集計結果', 'en': 'Result' },

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

});

/**
 * 表示言語を切り替え、対応するUI要素を更新してローカルストレージに保存する
 * @param {string} lang - 言語コード ('ja' または 'en')
 */
const setLanguage = (lang) => {
    // グローバル変数を更新
    currentLang = lang;

    // 該当するIDを持つUI要素のテキストを辞書の内容に書き換える
    for (const id in MESSAGES) {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = MESSAGES[id][currentLang];
        }
    }

    // ローカルストレージに現在の言語設定を保存
    saveStorage('Lang', currentLang);
};

/**
 * ローカルストレージから言語設定を取得し、初期言語として適用する
 */
const getLanguage = () => {
    // ローカルストレージから言語設定を取得（保存されていなければ 'ja'）
    const savedLang = loadStorage('Lang') ?? 'ja';
    // 判別した言語で画面を切り替え
    setLanguage(savedLang);
};

/**
 * ページ読み込み完了時に言語設定をロードする
 */
window.addEventListener('DOMContentLoaded', getLanguage);
