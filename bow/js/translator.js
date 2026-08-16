/**
 * translator.js
 * 内部AIによる翻訳処理
 */

const TRANSLATOR_API_SUPPORTED = 'Translator' in self;

/**
 * ストレージから表示設定（自動翻訳の有無）をロードし、チェックボックスに反映させる
 */
function loadTranslatorSettings() {
    const autoTranslatorIsChecked = loadStorage('AutoTranslate', true);
    const checkbox = document.getElementById('autoTranslate');
    if (checkbox) {
        checkbox.checked = autoTranslatorIsChecked;
    }
}

window.addEventListener('DOMContentLoaded', loadTranslatorSettings);

/**
 * チェックボックスの状態を取得してストレージに保存し、自動翻訳を実行する
 */
function changeTranslatorSettings() {
    const checkbox = document.getElementById('autoTranslate');
    if (!checkbox) return;
    
    const autoTranslatorIsChecked = checkbox.checked;
    saveStorage('AutoTranslate', autoTranslatorIsChecked);
    autoTranslation();
}

/**
 * 日本語翻訳機を表示する
 */
function showTranslator() {
    const translatorElem = document.getElementById('translator');
    if (translatorElem) {
        // 現状では自動翻訳機は日本語 → 英語のみ
        if (TRANSLATOR_API_SUPPORTED && currentLang === 'ja') {
            translatorElem.style.display = 'block';
        } else {
                translatorElem.style.display = 'none';
        }
    }
}

window.addEventListener('DOMContentLoaded', showTranslator);

// 翻訳機インスタンス
let translator1 = null;
let translator2 = null;

/**
 * 自動翻訳
 * テキストログを自動的に翻訳
 * 初回は翻訳モデルのダウンロードを行う
 * ローマ字 → 日本語 → 英語に翻訳というのはまともに動かないため、現状は英語 → 日本語にしか対応していない
 */
async function autoTranslation() {
    const inputText = document.getElementById('logContainer');
    const translatedLogContainer = document.getElementById('translatedLogContainer');
    const checkbox = document.getElementById('autoTranslate');

    if (!translatedLogContainer || !checkbox) return;

    // 1. APIが利用可能かチェック
    if (!TRANSLATOR_API_SUPPORTED) {
        translatedLogContainer.value = MESSAGES.translateNotSupported[currentLang];
        return;
    }

    if (!checkbox.checked) {
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
                        const template = MESSAGES.downloadingProgress ? MESSAGES.downloadingProgress[currentLang] : 'Downloading... ({percent}%)';
                        translatedLogContainer.value = template.replace('{percent}', percent);
                    });
                }
            });

            translatedLogContainer.value = MESSAGES.statusReady[currentLang];

        } catch (error) {
            const errPrefix = MESSAGES.statusError ? MESSAGES.statusError[currentLang] : 'Error';
            translatedLogContainer.value = errPrefix + ': ' + error.message;
            console.error(error);
            return;
        }
    }

    // 3. 翻訳の実行関数
    async function runTranslation() {
        if (!inputText) return;
        const inputLines = inputText.value.split('\n');
        if (inputLines.length === 0 || !translator1) {
            return;
        }

        try {
            const logPattern = /^(?:\[(.*?)\]: )?(?:\((.*?)\): )?(.*)$/;
            const translatedLines = [];
            
            for (const line of inputLines) {
                if (line.trim() === '') {
                    translatedLines.push('');
                    continue;
                }

                let match = line.match(logPattern);
                let [timeStamp, name, body] = ['', '', ''];
                if (match) {
                    [timeStamp, name, body] = [match[1], match[2], match[3]];
                    if (timeStamp) {
                        timeStamp = `[${timeStamp}] `;
                    } else {
                        timeStamp = '';
                    }
                    if (name) {
                        name = `(${name}): `;
                    } else {
                        name = '';
                    }
                }

                const translatedText = `${timeStamp}${name}${await translator1.translate(body)}`;
                translatedLines.push(translatedText);
            }

            translatedLogContainer.value = translatedLines.join('\n');
            translatedLogContainer.scrollTop = translatedLogContainer.scrollHeight;

        } catch (error) {
            const errPrefix = MESSAGES.statusError ? MESSAGES.statusError[currentLang] : 'Error';
            translatedLogContainer.value = errPrefix + ': ' + error.message;
            console.error(error);
        }
    }

    await runTranslation();
}

/**
 * 手動翻訳
 */
async function manualTranslate() {
    const inputText = document.getElementById('manualTranslateInput');
    const outputText = document.getElementById('manualTranslateOutput');

    if (!inputText || !outputText) return;

    // 1. APIが利用可能かチェック
    if (!TRANSLATOR_API_SUPPORTED) {
        return;
    }

    if (!translator2) {
        try {
            if (outputText) {
                outputText.value = MESSAGES.statusInitializing[currentLang];
            }

            // 2. 翻訳インスタンスの作成
            translator2 = await Translator.create({
                sourceLanguage: currentLang,
                targetLanguage: currentLang === 'ja' ? 'en' : 'ja',
                monitor(monitor) {
                    monitor.addEventListener('downloadprogress', (e) => {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        const template = MESSAGES.downloadingProgress ? MESSAGES.downloadingProgress[currentLang] : 'Downloading... ({percent}%)';
                        if (outputText) {
                            outputText.value = template.replace('{percent}', percent);
                        }
                    });
                }
            });

            if (outputText) {
                outputText.value = MESSAGES.statusReady[currentLang];
            }

        } catch (error) {
            const errPrefix = MESSAGES.statusError ? MESSAGES.statusError[currentLang] : 'Error';
            if (outputText) {
                outputText.value = errPrefix + ': ' + error.message;
            }
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
            const errPrefix = MESSAGES.statusError ? MESSAGES.statusError[currentLang] : 'Error';
            outputText.value = errPrefix + ': ' + error.message;
            console.error(error);
        }
    }
    
    await runTranslation();
}

// Enterでも手動翻訳するようにしておく
const manualTranslateInput = document.getElementById('manualTranslateInput');
manualTranslateInput.addEventListener('keydown', (event) => {
    // Enterキーが押されたか、かつIME変換確定中ではないか
    if (event.key === 'Enter' && !event.isComposing) {
        manualTranslate();
    }
});