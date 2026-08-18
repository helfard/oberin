/**
 * translator.js
 * 内部AIによる翻訳処理
 * ※ログデータを使用するため log.js より前に読み込むこと
 */

// APIがサポートされていたらセクションを表示
const TRANSLATOR_API_SUPPORTED = 'Translator' in self;
if (TRANSLATOR_API_SUPPORTED) {
    document.getElementById('translator').style.visibility = 'visible';
}

/**
 * ストレージから表示設定（自動翻訳の有無）をロードし、対応するチェックボックスのUI状態に反映させる
 */
function loadTranslatorSettings() {
    const autoTranslatorIsChecked = loadStorage('AutoTranslate', true);

    // 取得した設定値を各チェックボックスに反映
    document.getElementById('autoTranslate').checked = autoTranslatorIsChecked;
}

/**
 * ページ読み込み完了（DOMContentLoaded）のタイミングで、
 * 保存されている表示設定をロードしてチェックボックスに反映させる
 */
window.addEventListener('DOMContentLoaded', loadTranslatorSettings);


/**
 * チェックボックスの状態を取得してストレージに保存し、ログの表示を更新する
 */
function changeTranslatorSettings() {
    const autoTranslatorIsChecked = document.getElementById('autoTranslate').checked;

    // 各表示設定の状態をストレージに保存する
    saveStorage('AutoTranslate', autoTranslatorIsChecked);

    // 設定の変更を反映して自動翻訳を開始する
    autoTranslation();
}

// 翻訳機
let translator1 = null;
let translator2 = null;

/**
 * 自動翻訳
 * テキストログを自動的に翻訳
 * 初回は翻訳モデルのダウンロードを行う
 */
async function autoTranslation() {
    const inputText = document.getElementById('logContainer');
    const translatedLogContainer = document.getElementById('translatedLogContainer');
    const autoTranslatorIsChecked = document.getElementById('autoTranslate').checked;

    // 1. APIが利用可能かチェック
    if (!TRANSLATOR_API_SUPPORTED) {
        translatedLogContainer.value = MESSAGES.translateNotSupported[currentLang];
        return;
    }

    if (!autoTranslatorIsChecked) {
        return;
    }

    if (!translator1) {
        try {
            translatedLogContainer.value = MESSAGES.statusInitializing[currentLang];

            // 2. 翻訳インスタンスの作成
            translator1 = await Translator.create({
                sourceLanguage: currentLang === 'ja' ? 'en' : 'ja',
                targetLanguage: currentLang,
                monitor(monitor) {
                    monitor.addEventListener('downloadprogress', (e) => {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        translatedLogContainer.value = `モデルをダウンロード中... (${percent}%)`;
                    });
                }
            });

            translatedLogContainer.value = MESSAGES.statusReady[currentLang];

        } catch (error) {
            translatedLogContainer.value = statusError[currentLang] + ': ' + error.message;
            console.error(error);
            return; // 初期化エラー時は中断
        }
    }

    // 3. 翻訳の実行関数
    async function runTranslation() {
        const inputLines = inputText.value.split('\n'); // trim()を外すと空行のインデントを正確に保持できます
        if (inputLines.length === 0 || !translator1) {
            return;
        }
        
        try {
            const translatedLines = [];
            
            for (const line of inputLines) {
                // 空行の場合はそのまま空文字をプッシュ
                if (line.trim() === '') {
                    translatedLines.push('');
                    continue;
                }

                const translatedText = await translator1.translate(line);
                translatedLines.push(translatedText);
            }

            // まとめて改行で結合
            translatedLogContainer.value = translatedLines.join('\n');
            
            // 翻訳完了後にスクロールを最下部に移動
            translatedLogContainer.scrollTop = translatedLogContainer.scrollHeight;

        } catch (error) {
            translatedLogContainer.value = (statusError[currentLang] || 'エラー') + ': ' + error.message;
            console.error(error);
        }
    }

    // 実行
    await runTranslation();
}

/**
 * 手動翻訳
 */
async function manualTranslate() {
    const inputText = document.getElementById('manualTranslateInput');
    const outputText = document.getElementById('manualTranslateOutput');

        // 1. APIが利用可能かチェック
    if (!TRANSLATOR_API_SUPPORTED) {
        return;
    }

    if (!translator2) {
        try {
            translatedLogContainer.value = MESSAGES.statusInitializing[currentLang];

            // 2. 翻訳インスタンスの作成
            translator2 = await Translator.create({
                sourceLanguage: currentLang,
                targetLanguage: currentLang === 'ja' ? 'en' : 'ja',
                monitor(monitor) {
                    // モデルのダウンロード進捗状況を取得
                    monitor.addEventListener('downloadprogress', (e) => {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        translatedLogContainer.value = `モデルをダウンロード中... (${percent}%)`;
                    });
                }
            });

            translatedLogContainer.value = MESSAGES.statusReady[currentLang];

        } catch (error) {
            translatedLogContainer.value = statusError[currentLang] + ': ' + error.message;
            console.error(error);
        }
    }

    // 3. 翻訳の実行
    async function runTranslation() {
        const text = inputText.value.trim();
        if (!text || !translator2) return;

        try {
            const translatedText = await translator2.translate(text);
            outputText.value = translatedText;
        } catch (error) {
            outputText.value = statusError[currentLang] + ': ' + error.message;
            console.error(error);
        }
    }
    runTranslation();
}

/**
 * 翻訳をクリップボードにコピーし、完了アラートを表示する
 */
function copyTranslation() {
    const text = document.getElementById('manualTranslateOutput').value;
    execCopy(text);
    alert(MESSAGES.copied[currentLang]);
}
