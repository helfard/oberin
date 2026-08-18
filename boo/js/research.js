/**
 * research.js
 * ログの走査と集計（日付と入力値からファイル名を直接生成して取得）
 */

// IndexedDBに関する定数
const DB_NAME = 'LogScannerDB(BoO)';
const STORE_NAME = 'handles';
const KEY_NAME = 'targetFolder';

// グローバルなフォルダハンドル保持用
let folderHandle = null;

// 集計用データ
let skillCount = {};
let spellCount = {};
let potionCount = {};
let itemCount = {};
let gatherCount = {};
let fishCount = {};

// 集計結果
let researchedLogs = [];

// 最後に使用した魔法
let lastSpell = '';
// 総計Mana消費量（Magery＋Alchemy、Meditationのレベルアップでリセット）
let totalManaCost = 0;

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

    // ログデータを初期化
    logData = {};
    researchedLogs = [];

    // 条件オブジェクトの組み立て
    const conditions = {
        startDateStr: fromDateVal,
        endDateStr: toDateVal,
        splitPerName: splitPerNameChecked,
        characterName: characterNameVal
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

    const { startDateStr, endDateStr, splitPerName, characterName } = conditions;

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
            await processLogFile(fileHandle, fileName, dateStr, splitPerName ? characterName : null);

        } catch (err) {
            if (err.name !== 'NotFoundError') {
                console.error(`ファイル取得エラー (${fileName}):`, err);
            }
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 集計結果を表示
    document.getElementById('resultContainer').value = researchedLogs.join('\n');
}

/**
 * 日付フォーマットヘルパー
 * @param {*} date 
 * @returns 
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
async function processLogFile(fileHandle, fileName, dateStr, characterName) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    
    // 改行コードで分割して配列化
    const logLines = text.split(/\r\n|\r|\n/);

    const fileData = {
        fileName: fileName,
        date: dateStr,
        character: characterName,
        lines: logLines,
        text: text
    };

    // 4. researchLogs() へ配列（またはファイルデータ）を渡す
    researchLogs(fileData);
}

/**
 * ログの走査
 * @param {*} fileData 
 */
function researchLogs(fileData) {
    // 例: fileData.fileName, fileData.date, fileData.lines が利用可能

    // キャラクターの名前
    const characterNameVal = document.getElementById('characterName').value.trim();

    const logPattern = /^(?:\[(.*?)\]: )?(?:\((.*?)\): )?(.*)$/;
    for (const line of fileData.lines) {
        // 1行を解析し [タイムスタンプ, 名前, 本文] を取得
        
        if (line.trim() === '') {
            continue;
        }

        let match = line.match(logPattern);
        if (match) {
            let [timeStamp, name, body] = [match[1], match[2], match[3]];

            for (const skillName of SKILLS) {
                let skill = skillName;
                // Aclemyならまとめる
                if (['Alchemy/Cleric', 'Alchemy/Druid'].includes(skillName)) skill = 'Alchemy';
                // Blacksmighing・Tailoring・Tinkering・Woodworkingならまとめる
                if (['Blacksmithing', 'Tailoring', 'Tinkering', 'Woodworking'].includes(skillName)) skill = 'Crafting';
                // Mageryならまとめる
                if (['Magery/Cleric', 'Magery/Druid', 'Magery/Wizard'].includes(skillName)) skill = 'Magery';

                if (typeof LOGS === 'undefined' || !LOGS[skill]) {
                    continue;
                }
                // スキルレベルアップの場合はそのスキルのカウント数を表示してリセット
                const matchText = Skill_LEVEL_UP_MESSAGE.replace('(skillName)', skillName.toLowerCase());
                if (body === matchText) {

                    researchedLogs.push(`[${timeStamp}]: ${skillName} skill level has increased.`);
                    let results = [];
                    let [start, success, fail, rate] = [0, 0, 0, 0];
                    if (!skillCount[skill]) skillCount[skill] = { start: 0, continue: 0, success: 0, fail: 0 };
                    if (skillCount[skill].continue) {
                        start += skillCount[skill].continue;
                        skillCount[skill].continue = 0;
                    }
                    if (skillCount[skill].start) {
                        start += skillCount[skill].start;
                        skillCount[skill].start = 0;
                        results.push(`Start ${start}`);
                    }
                    if (skillCount[skill].success) {
                        success = skillCount[skill].success;
                        skillCount[skill].success = 0;
                        results.push(`Success ${success}`);
                    }
                    if (skillCount[skill].fail) {
                        fail = skillCount[skill].fail;
                        skillCount[skill].fail = 0;
                        results.push(`Fail ${fail}`);
                    }
                    if (success && fail) {
                        rate = Math.round((success / (success + fail)) * 1000) / 10;
                    } else if (start && success) {
                        rate = Math.round((success / start) * 1000) / 10;
                    } else if (start && fail) {
                        rate = Math.round(((start - fail) / start) * 1000) / 10;
                    }
                    if (results.length) {
                        let pushLine = `                         ${results.join(', ')}` + (rate ? ` (${rate}%)` : '');
                        researchedLogs.push(pushLine);
                    }
                    // Alchemyの場合はポーション毎にカウント数を表示
                    if (skill === 'Alchemy') {
                        let sortedPotions = Object.entries(potionCount).sort((a, b) => {
                            return b[1] - a[1]; // 降順（大きい順）
                        });
                        for (const [potion, count] of sortedPotions) {
                            let pushLine = `                           ${count} ${potion}`;
                            researchedLogs.push(pushLine);
                        }
                        potionCount = {};
                    }
                    // Mageryの場合は呪文毎にカウント数を表示
                    if (skill === 'Magery') {
                        let sortedSpells = Object.entries(spellCount).sort((a, b) => {
                            return b[1] - a[1]; // 降順（大きい順）。昇順にしたい場合は a[1] - b[1]
                        });
                        for (const [spell, count] of sortedSpells) {
                            let pushLine = `                           ${count} ${SPELL[spell].name}`;
                            researchedLogs.push(pushLine);
                        }
                        spellCount = {};
                    }
                    // Meditationの場合は総消費MPを表示してリセット
                    if (skill === 'Meditation') {
                        let pushLine = `                           ${totalManaCost} MP`;
                        researchedLogs.push(pushLine);
                        totalManaCost = 0;
                    }
                    // Fishingの場合は魚種毎にカウント数を表示
                    if (skill === 'Fishing') {
                        let sortedFishes = Object.entries(fishCount).sort((a, b) => {
                            return b[1] - a[1]; // 降順（大きい順）
                        });
                        for (const [fish, count] of sortedFishes) {
                            let pushLine = `                           ${count} ${fish}`;
                            researchedLogs.push(pushLine);
                        }
                        fishCount = {};
                    }
                    // 収集スキルの場合はアイテム毎にカウント数を表示
                    if (Object.hasOwn(gatherCount, skill)) {
                        const items = gatherCount[skill];
                        let sortedItems = Object.entries(items).sort((a, b) => {
                            return b[1] - a[1]; // 降順（大きい順）。昇順にしたい場合は a[1] - b[1]
                        });
                        for (const [item, count] of sortedItems) {
                            let pushLine = `                           ${count} ${item}`;
                            researchedLogs.push(pushLine);
                        }
                        gatherCount[skill] = {};
                    }
                    continue;
                }
                // スキル使用の場合はそのスキルのカウント数を増やす
                if (LOGS[skill].start && body === LOGS[skill].start) {
                    if (!skillCount[skill]) skillCount[skill] = { start: 0, continue: 0, success: 0, fail: 0 };
                    skillCount[skill].start += 1;
                    continue;
                }
                if (LOGS[skill].continue && body === LOGS[skill].continue) {
                    if (!skillCount[skill]) skillCount[skill] = { start: 0, continue: 0, success: 0, fail: 0 };
                    skillCount[skill].continue += 1;
                    continue;
                }
                if (LOGS[skill].success && body === LOGS[skill].success) {
                    if (!skillCount[skill]) skillCount[skill] = { start: 0, continue: 0, success: 0, fail: 0 };
                    skillCount[skill].success += 1;
                    continue;
                }
                if (LOGS[skill].fail && body === LOGS[skill].fail) {
                    if (!skillCount[skill]) skillCount[skill] = { start: 0, continue: 0, success: 0, fail: 0 };
                    skillCount[skill].fail += 1;
                    if (skill === 'Magery') {
                        // Fizzleの場合は直前の呪文のカウント数を減らす
                        if (lastSpell) {
                            if (spellCount[lastSpell]) spellCount[lastSpell] -= 1;
                        }
                    }
                    continue;
                }
            }
            // クラスレベルアップ
            const classMatch = body.match(CLASS_LEVEL_UP_REGEXP);
            if (classMatch) {
                researchedLogs.push(`[${timeStamp}]: Class level ${classMatch[1]}.`);
                continue;
            }
            // Magery
            const spellMatch = body.match(MAGERY_REGEXP);
            if (name === characterNameVal && spellMatch) {
                if (!skillCount['Magery']) skillCount['Magery'] = { start: 0, continue: 0, success: 0, fail: 0 };
                skillCount['Magery'].start += 1;
                const spell = spellMatch[0];
                if (!spellCount[spell]) spellCount[spell] = 0;
                spellCount[spell] += 1;
                lastSpell = spell;
                totalManaCost += SPELL[spell].manaCost;
                continue;
            }
            // Alchemy
            const alchemyMatch = {
                start: body.match(ALCHEMY_REGEXP.start),
                success: body.match(ALCHEMY_REGEXP.success),
                fail: body.match(ALCHEMY_REGEXP.fail)
            }
            if (alchemyMatch.start) {
                if (!skillCount['Alchemy']) skillCount['Alchemy'] = { start: 0, continue: 0, success: 0, fail: 0 };
                skillCount['Alchemy'].start += 1;
                continue;
            }
            if (alchemyMatch.success) {
                if (!skillCount['Alchemy']) skillCount['Alchemy'] = { start: 0, continue: 0, success: 0, fail: 0 };
                skillCount['Alchemy'].success += 1;
                // alchemyMatch.xxxはポーション名が小文字になるので先頭1文字を大文字に変換
                const potion = alchemyMatch.success[1].replace(/\b\w/g, c => c.toUpperCase());
                if (!potionCount[potion]) potionCount[potion] = 0;
                potionCount[potion] += 1;
                totalManaCost += POTION[potion].manaCost;
                continue;
            }
            if (alchemyMatch.fail) {
                if (!skillCount['Alchemy']) skillCount['Alchemy'] = { start: 0, continue: 0, success: 0, fail: 0 };
                skillCount['Alchemy'].fail += 1;
                continue;
            }
            // Fishing成功（Caught:  ）
            const fishMatch = body.match(FISH_REGEXP);
            if (fishMatch) {
                if (!skillCount['Fishing']) skillCount['Fishing'] = { start: 0, continue: 0, success: 0, fail: 0 };
                skillCount['Fishing'].success += 1;
                const fish = fishMatch[1];
                if (!fishCount[fish]) fishCount[fish] = 0;
                fishCount[fish] += 1;
                continue;
            }
            // アイテム入手（Taken:  ）
            const takeMatch = body.match(TAKE_REGEXP);
            if (takeMatch) {
                const number = takeMatch[2] ? parseInt(takeMatch[2]) : 1;
                const item = takeMatch[3];
                if (!itemCount[item]) itemCount[item] = 0;
                itemCount[item] += number;
                // 収集スキルによる入手が疑われる場合
                const takeMsg = takeMatch[1];
                let foundSkill = Object.entries(GATHER_STUFF).find(([skillName, stuffs]) => {
                    return stuffs.includes(takeMsg);
                })?.[0];
                if (foundSkill) {
                    if (!gatherCount[foundSkill]) gatherCount[foundSkill] = {};
                    if (!gatherCount[foundSkill][takeMsg]) gatherCount[foundSkill][takeMsg] = 0;
                    gatherCount[foundSkill][takeMsg] += number;
                }
                continue;
            }
        }
    }
}
