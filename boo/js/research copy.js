/**
 * research.js
 * ログの走査と集計（日付と入力値からファイル名を直接生成して取得）
 */


// 集計用データ
// スキルごとの使用・成功・失敗回数（skillCount['スキル名'] = { start: 使用回数, success: 成功回数, fail: 失敗回数 }）
let skillCount = {};
let totalSkillCount = {};
// 使用した魔法の呪文と回数（spellCount['呪文'] = 回数）
let spellCount = {};
let totalSpellCount = {};
// Fizzleした魔法の呪文と回数（fizzleCount['呪文'] = 回数）
let fizzleCount = {};
let totalFizzleCount = {};
// 作成したポーションの名前と個数（potionCount['ポーション名'] = 個数）
let potionCount = {};
let totalPotionCount = {};
// 採取スキルによると思われる入手アイテムと個数（gatherCount['スキル名']['アイテム名'] = 個数）
let gatherCount = {};
let totalGatherCount = {};
// Gatharing以外の入手と思われるTaken: の名前と個数（TotalTakeCount['アイテム名'] = 個数）
let totalTakeCount = {};
// 釣った魚と個数（catchCount['魚名'] = 個数）
let catchCount = {};
let totalCatchCount = {};
// 総計Mana消費量（Magery＋Alchemyの分、Meditationのレベルアップでリセットする）
let subtotalManaCost = 0;
let totalManaCost = 0;

// スキルごとの最後のstartのタイムスタンプ（Date形式）
// Lumberjacking, Miningで他のTaken: から区別するために使用
let lastGatherDate = {};
// スキルのstartからsuccessまでの猶予時間（秒）
const GATHER_LIMIT = 6;
// 最後に使用した魔法（Fizzle分をカウントから除去するのに使う）
let lastSpellCode = '';
// 集計結果
let resultLogs = [];
// 整形用のスペーサー
const SPACER = '                         ';

// 最終集計の表示順
const SKILL_ORDER = [
    'Lumberjacking',
    'Mining',
    'Fishing',

    'Crafting',
    'Cooking',
    'Poisoning',

    'Anatomy',
    'Healing',

    'Hiding',
    'Detecting Hidden',

    'Lockpicking',
    'Removing Traps',

    'Magery',
    'Alchemy',
    'Enchanting',
    'Meditation',

    'Taming',

//    'Melee',
//    'Parring',
//    'Resisting Magic',
//    'Special/Fighter',
//    'Special/Ranger',
//    'Special/Rogue',
];
// 最終集計の整形用のスペーサー
const TOTAL_SPACER = '  ';

/**
 * 集計データの初期化
 */
function initCountData() {
    skillCount = {};
    totalSkillCount = {};
    spellCount = {};
    totalSpellCount = {};
    fizzleCount = {};
    totalFizzleCount = {};
    potionCount = {};
    totalPotionCount = {};
    gatherCount = {};
    totalGatherCount = {};
    totalTakeCount = {};
    catchCount = {};
    totalCatchCount = {};
    subtotalManaCost = 0;
    totalManaCost = 0;
    lastGatherDate = {};
    lastSpellCode = '';
    resultLogs = [];
}

/**
 * ログの走査
 * @param {*} fileData
 * （fileData.fileName, fileData.date,
 *   fileData.character, fileData.lines, fileData.text,
 *   fileData.optionTakeCatch, fileData.optionSpell, fileData.optionReagent が利用可能）
 */
function researchLogs(fileData) {

    // キャラクターの名前
    const characterName = fileData.character;

    // 集計オプション
    const optionTakeCatch = fileData.optionTakeCatch;
    const optionPotion = fileData.optionPotion;
    const optionSpell = fileData.optionSpell;
    const optionReagent = fileData.optionReagent;

    // 解析対象のログの書式
    const logPattern = /^(?:\[(.*?)\]: )?(?:\((.*?)\): )?(.*)$/;

    /**
     * ログをチェックして条件に合致するか判定する
     * @param {string} logText 
     * @param {string | RegExp} skillText 
     * @returns {boolean | string} true/false or matchedText
     */
    function logCheck(logText = '', matchText = '', skillCode = null) {
        if (typeof matchText === 'string') {
            if (logText === matchText) {
                return true;
            }
        } else if (matchText instanceof RegExp) {
            const match = logText.match(matchText);
            if (match) {
                if (match[1]) {
                    let matchedText = match[1];
                    if (['Alchemy', 'Anatomy', 'Fishing', 'SkillLevelUp'].includes(skillCode)) {
                        matchedText = matchedText.replace(/(?:^|\/|\s)([a-z])/g, (match) => match.toUpperCase());
                    }
                    return matchedText;
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    lineLoop: for (const line of fileData.lines) {
        
        if (line.trim() === '') continue;

        let lineMatch = line.match(logPattern);
        if (lineMatch) {
            // [タイムスタンプ, 名前, 本文]
            let [timeStamp, name, body] = [lineMatch[1], lineMatch[2], lineMatch[3]];

            for (const skillCode of Object.keys(LOG)) {
                for (const key of Object.keys(LOG[skillCode])) {

                    // スキル使用時
                    const checkResult = logCheck(body, LOG[skillCode][key], skillCode);
                    if (checkResult) {

                        // Gathering
                        if (skillCode === 'Gathering') {
                            // Gatheringはsuccessしかない
                            const itemName = checkResult;
                            let lastGatherSkill = null;
                            if (GATHER_STUFF['Lumberjacking'].includes(itemName)) {
                                lastGatherSkill = 'Lumberjacking';
                            } else if (GATHER_STUFF['Mining'].includes(itemName)) {
                                lastGatherSkill = 'Mining';
                            }
                            if (lastGatherSkill && lastGatherDate[lastGatherSkill]) {
                                const startDate = lastGatherDate[lastGatherSkill];
                                const successDate = new Date(timeStamp.replace(' ', 'T'));
                                const diffSec = (successDate - startDate) / 1000;
                                // スキルのstartからsuccessまでの猶予時間内ならGatheringスキルとみなす
                                if (diffSec < GATHER_LIMIT) {
                                    // Lumberjacking, Miningの成功数を加算
                                    skillCount[lastGatherSkill] ||= {};
                                    skillCount[lastGatherSkill][key] = (skillCount[lastGatherSkill][key] || 0) + 1;
                                    totalSkillCount[lastGatherSkill] ||= {};
                                    totalSkillCount[lastGatherSkill][key] = (totalSkillCount[lastGatherSkill][key] || 0) + 1;
                                    // 収集したアイテムを加算
                                    gatherCount[lastGatherSkill] ||= {};
                                    gatherCount[lastGatherSkill][itemName] = (gatherCount[lastGatherSkill][itemName] || 0) + 1;
                                    totalGatherCount[lastGatherSkill] ||= {};
                                    totalGatherCount[lastGatherSkill][itemName] = (totalGatherCount[lastGatherSkill][itemName] || 0) + 1;
                                } else {
                                    // Lumberjacking, Mining以外のTaken: と思われるものを加算
                                    totalTakeCount[itemName] = (totalTakeCount[itemName] || 0) + 1;
                                }
                            }
                            continue lineLoop;
                        }
                        // Fishing
                        if (skillCode === 'Fishing' && key === 'success') {
                            const catchName = checkResult;
                            catchCount[catchName] = (catchCount[catchName] || 0) + 1;
                            totalCatchCount[catchName] = (totalCatchCount[catchName] || 0) + 1;
                        }
                        // Alchemy
                        if (skillCode === 'Alchemy' && key === 'success') {
                            const potionName = checkResult;
                            potionCount[potionName] = (potionCount[potionName] || 0) + 1;
                            totalPotionCount[potionName] = (totalPotionCount[potionName] || 0) + 1;
                            const manaCost = POTION[potionName].manaCost;
                            subtotalManaCost += manaCost;
                            totalManaCost += manaCost;
                        }
                        // Magery
                        if (skillCode === 'Magery') {
                            if (key === 'success') {
                                if (name === characterName) {
                                    const spellCode = checkResult;
                                    if (optionSpell) {
                                        
                                    }
                                    spellCount[spellCode] = (spellCount[spellCode] || 0) + 1;
                                    totalSpellCount[spellCode] = (totalSpellCount[spellCode] || 0) + 1;
                                    const manaCost = SPELL[spellCode].manaCost;
                                    subtotalManaCost += manaCost;
                                    totalManaCost += manaCost;
                                    lastSpellCode = spellCode;
                                    // カウントを加算
                                    skillCount[skillCode] ||= {};
                                    skillCount[skillCode][key] = (skillCount[skillCode][key] || 0) + 1;
                                    totalSkillCount[skillCode] ||= {};
                                    totalSkillCount[skillCode][key] = (totalSkillCount[skillCode][key] || 0) + 1;
                                }
                                continue lineLoop;
                            }
                            // Fizzle
                            if (key === 'fail' && lastSpellCode) {
                                const spellCode = lastSpellCode;
                                spellCount[spellCode] = (spellCount[spellCode] || 0) - 1;
                                totalSpellCount[spellCode] = (totalSpellCount[spellCode] || 0) - 1;
                                const manaCost = SPELL[spellCode].manaCost;
                                subtotalManaCost -= manaCost;
                                totalManaCost -= manaCost;
                                fizzleCount[spellCode] = (fizzleCount[spellCode] || 0) + 1;
                                totalFizzleCount[spellCode] = (totalFizzleCount[spellCode] || 0) + 1;
                            }
                        }

                        // カウントを加算
                        skillCount[skillCode] ||= {};
                        skillCount[skillCode][key] = (skillCount[skillCode][key] || 0) + 1;
                        totalSkillCount[skillCode] ||= {};
                        totalSkillCount[skillCode][key] = (totalSkillCount[skillCode][key] || 0) + 1;
                        // Lumberjacking, Miningのstartの場合はタイムスタンプを更新
                        if (['Lumberjacking', 'Mining'].includes(skillCode) && key === 'start') {
                            lastGatherDate[skillCode] = new Date(timeStamp.replace(' ', 'T'));
                        }
                        continue lineLoop;
                    }
                }
            }

            // スキルレベルアップ
            const skillName = logCheck(body, SKILL_LEVEL_UP_REGEXP, 'SkillLevelUp');
            if (SKILLS.includes(skillName)) {

                let skillCode = skillName;
                if (['Alchemy/Cleric', 'Alchemy/Druid'].includes(skillName)) skillCode = 'Alchemy';
                // if (['Blacksmithing', 'Tailoring', 'Tinkering', 'Woodworking'].includes(skillName)) skillCode = 'Crafting';
                // if (['Lumberjacking', 'Mining'].includes(skillName)) skillCode = 'Gathering';
                if (['Magery/Cleric', 'Magery/Druid', 'Magery/Wizard'].includes(skillName)) skillCode = 'Magery';

                resultLogs.push(`[${timeStamp}]: ${skillName} skill level has increased.`);
                let startCount = skillCount[skillCode]?.start || null;
                let successCount = skillCount[skillCode]?.success || null;
                let failCount = skillCount[skillCode]?.fail || null;
                let successRate = null;
                // 成功率の算出
                let total = (successCount !== null && failCount !== null) ? (successCount + failCount) : startCount;
                let success = successCount ?? (total !== null && failCount !== null ? total - failCount : null);
                if (total > 0 && success !== null) {
                    successRate = ((success / total) * 100).toFixed(1);
                }
                // スキルの使用・成功・失敗回数・成功率を表示
                const countData = [
                    startCount && `Start ${startCount}`,
                    successCount && `Success ${successCount}`,
                    failCount && `Fail ${failCount}`,
                ].filter(Boolean);
                if (countData.length) {
                    resultLogs.push(`${SPACER}${countData.join(', ')}${successRate ? ` (${successRate}%)` : ''}`);
                }
                // スキルの使用・成功・失敗回数を初期化
                skillCount[skillCode] = {};

                // Gathering
                if (['Lumberjacking', 'Mining'].includes(skillCode) && optionTakeCatch) {
                    if (gatherCount[skillCode] && Object.keys(gatherCount[skillCode]).length) {
                        const sortedGatherCount = Object.entries(gatherCount[skillCode]).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(gatherCount[skillCode]).map(v => String(v).length));
                        for (const [itemName, count] of sortedGatherCount) {
                            resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${itemName}`);
                        }
                        gatherCount[skillCode] = {};
                    }
                    continue lineLoop;
                }
                // Fishing
                if (skillCode === 'Fishing' && optionTakeCatch) {
                    if (Object.keys(catchCount).length) {
                        const sortedCatchCount = Object.entries(catchCount).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(catchCount).map(v => String(v).length));
                        for (const [fishName, count] of sortedCatchCount) {
                            resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${fishName}`);
                        }
                        catchCount = {};
                    }
                    continue lineLoop;
                }
                // Alchemy
                if (skillCode === 'Alchemy') {
                    if (Object.keys(potionCount).length) {
                        const sortedPotionCount = Object.entries(potionCount).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(potionCount).map(v => String(v).length));
                        let reagent = {};
                        for (const [potionName, count] of sortedPotionCount) {
                            const potion = POTION[potionName];
                            if (optionPotion) {
                                resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${potionName}`);
                            }
                            // 消費した試薬の計算
                            for (const [key, value] of Object.entries(potion.reagent)) {
                                reagent[key] = (reagent[key] || 0) + value * count;
                            }
                        }
                        potionCount = {};
                        if (optionPotion && optionReagent) {
                            resultLogs.push(`${SPACER}============================`);
                        }
                        // 消費した試薬の表示
                        if (Object.keys(reagent).length && optionReagent) {
                            const sortedReagent = Object.entries(reagent).sort((a, b) => b[1] - a[1]);
                            const maxLength = Math.max(...Object.values(reagent).map(v => String(v).length));
                            for (const [reagentName, count] of sortedReagent) {
                                resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${reagentName}`);
                            }
                        }
                    }
                    continue lineLoop;
                }
                // Magery
                if (skillCode === 'Magery') {
                    if (Object.keys(spellCount).length) {
                        const sortedSpellCount = Object.entries(spellCount).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(spellCount).map(v => String(v).length));
                        const maxSpell = Math.max(...Object.keys(spellCount).map(v => SPELL[v].name.length));
                        let reagent = {};
                        for (const [spellCode, count] of sortedSpellCount) {
                            const spell = SPELL[spellCode];
                            const fizzle = fizzleCount[spellCode];
                            if (optionSpell) {
                                resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${spell.name.padEnd(maxSpell, ' ')}${fizzle ? ` (${fizzle} fizzle)` : ''}`);
                            }
                            // 消費した試薬の計算
                            for (const [key, value] of Object.entries(spell.reagent)) {
                                reagent[key] = (reagent[key] || 0) + value * count;
                            }
                        }
                        spellCount = {};
                        fizzleCount = {};
                        if (optionSpell && optionReagent) {
                            resultLogs.push(`${SPACER}============================`);
                        }
                        // 消費した試薬の表示
                        if (Object.keys(reagent).length && optionReagent) {
                            const sortedReagent = Object.entries(reagent).sort((a, b) => b[1] - a[1]);
                            const maxLength = Math.max(...Object.values(reagent).map(v => String(v).length));
                            for (const [reagentName, count] of sortedReagent) {
                                resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${reagentName}`);
                            }
                        }
                    }
                    continue lineLoop;
                }
                // Meditation
                if (skillCode === 'Meditation') {
                    if (subtotalManaCost) {
                        resultLogs.push(`${SPACER}${subtotalManaCost} MP`);
                        subtotalManaCost = 0;
                    }
                    continue lineLoop;
                }
            }

            // クラスレベルアップ
            const classLevel = logCheck(body, CLASS_LEVEL_UP_REGEXP);
            if (classLevel) {
                resultLogs.push(`[${timeStamp}]: Class level ${classLevel}.`);
            }
        }
    }
}

/**
 * 全集計結果の表示
 */
function addTotalData(optionTakeCatch = false, optionPotion = false, optionSpell = false, optionReagent = false) {
    resultLogs.push('==== Total Summary ====');

    for (const skillCode of SKILL_ORDER) {
        let startCount = totalSkillCount[skillCode]?.start || null;
        let successCount = totalSkillCount[skillCode]?.success || null;
        let failCount = totalSkillCount[skillCode]?.fail || null;
        let successRate = null;

        // データが存在するかどうか確認（使用回数、成功・失敗、または各固有のカウント）
        let hasData = startCount !== null || successCount !== null || failCount !== null;

        if (skillCode === 'Lumberjacking' || skillCode === 'Mining') {
            if (totalGatherCount[skillCode] && Object.keys(totalGatherCount[skillCode]).length) {
                hasData = true;
            }
        } else if (skillCode === 'Alchemy') {
            if (Object.keys(totalPotionCount).length) hasData = true;
        } else if (skillCode === 'Fishing') {
            if (Object.keys(totalCatchCount).length) hasData = true;
        } else if (skillCode === 'Magery') {
            if (Object.keys(totalSpellCount).length) hasData = true;
        } else if (skillCode === 'Meditation') {
            if (totalManaCost > 0) hasData = true;
        }

        if (!hasData) continue;

        resultLogs.push(`${skillCode}:`);

        // 成功率の算出
        let total = (successCount !== null && failCount !== null) ? (successCount + failCount) : startCount;
        let success = successCount ?? (total !== null && failCount !== null ? total - failCount : null);
        if (total > 0 && success !== null) {
            successRate = ((success / total) * 100).toFixed(1);
        }

        // スキルの使用・成功・失敗回数・成功率を表示
        const countData = [
            startCount && `Start ${startCount}`,
            successCount && `Success ${successCount}`,
            failCount && `Fail ${failCount}`,
        ].filter(Boolean);

        if (countData.length) {
            resultLogs.push(`${TOTAL_SPACER}${countData.join(', ')}${successRate ? ` (${successRate}%)` : ''}`);
        }

        // Lumberjacking, Mining
        if (['Lumberjacking', 'Mining'].includes(skillCode) && optionTakeCatch) {
            if (totalGatherCount[skillCode] && Object.keys(totalGatherCount[skillCode]).length) {
                const sortedGatherCount = Object.entries(totalGatherCount[skillCode]).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalGatherCount[skillCode]).map(v => String(v).length));
                for (const [itemName, count] of sortedGatherCount) {
                    resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${itemName}`);
                }
            }
        }
        // Fishing
        if (skillCode === 'Fishing' && optionTakeCatch) {
            if (Object.keys(totalCatchCount).length) {
                const sortedCatchCount = Object.entries(totalCatchCount).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalCatchCount).map(v => String(v).length));
                for (const [fishName, count] of sortedCatchCount) {
                    resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${fishName}`);
                }
            }
        }

        // Alchemy
        if (skillCode === 'Alchemy') {
            if (Object.keys(totalPotionCount).length) {
                const sortedPotionCount = Object.entries(totalPotionCount).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalPotionCount).map(v => String(v).length));
                let reagent = {};

                for (const [potionName, count] of sortedPotionCount) {
                    const potion = POTION[potionName];
                    if (optionPotion) {
                        resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${potionName}`);
                    }
                    // 累計試薬の計算
                    for (const [key, value] of Object.entries(potion.reagent)) {
                        reagent[key] = (reagent[key] || 0) + value * count;
                    }
                }
                if (optionPotion && optionReagent) {
                    resultLogs.push(`${TOTAL_SPACER}============================`);
                }
                // 累計試薬の表示
                if (Object.keys(reagent).length && optionReagent) {
                    const sortedReagent = Object.entries(reagent).sort((a, b) => b[1] - a[1]);
                    const maxReagentLen = Math.max(...Object.values(reagent).map(v => String(v).length));
                    for (const [reagentName, count] of sortedReagent) {
                        resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxReagentLen, ' ')} ${reagentName}`);
                    }
                }

            }
        }
        // Magery
        if (skillCode === 'Magery') {
            if (Object.keys(totalSpellCount).length) {
                const sortedSpellCount = Object.entries(totalSpellCount).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalSpellCount).map(v => String(v).length));
                const maxSpell = Math.max(...Object.keys(totalSpellCount).map(v => SPELL[v].name.length));
                let reagent = {};
                
                for (const [spellCode, count] of sortedSpellCount) {
                    if (count <= 0) continue;
                    const spell = SPELL[spellCode];
                    const fizzle = totalFizzleCount[spellCode];
                    if (optionSpell) {
                        resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${spell.name.padEnd(maxSpell, ' ')}${fizzle ? ` (${fizzle} fizzle)` : ''}`);
                    }
                    
                    // 累計試薬の計算
                    for (const [key, value] of Object.entries(spell.reagent)) {
                        reagent[key] = (reagent[key] || 0) + value * count;
                    }
                }
                if (optionSpell && optionReagent) {
                    resultLogs.push(`${TOTAL_SPACER}============================`);
                }
                // 累計試薬の表示
                if (Object.keys(reagent).length && optionReagent) {
                    const sortedReagent = Object.entries(reagent).sort((a, b) => b[1] - a[1]);
                    const maxReagentLen = Math.max(...Object.values(reagent).map(v => String(v).length));
                    for (const [reagentName, count] of sortedReagent) {
                        resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxReagentLen, ' ')} ${reagentName}`);
                    }
                }
            }
        }

        // Meditation
        if (skillCode === 'Meditation') {
            if (totalManaCost) {
                resultLogs.push(`${TOTAL_SPACER}${totalManaCost} MP`);
            }
        }
    }

    // Gathering以外のTaken集計（もし必要があれば）
    if (Object.keys(totalTakeCount).length && optionTakeCatch) {
        resultLogs.push('Other Taken Items');
        const sortedTakeCount = Object.entries(totalTakeCount).sort((a, b) => b[1] - a[1]);
        const maxLength = Math.max(...Object.values(totalTakeCount).map(v => String(v).length));
        for (const [itemName, count] of sortedTakeCount) {
            resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${itemName}`);
        }
    }
}
