/**
 * research.js
 * ログの走査と集計（日付と入力値からファイル名を直接生成して取得）
 */

// スキルのstartからsuccessまでの猶予時間（秒）
const GATHER_LIMIT = 6;
// 整形用のスペーサー
const SPACER = '                         ';
// 最終集計の整形用のスペーサー
const TOTAL_SPACER = '  ';

// 最終集計の表示順
const SKILL_ORDER = [
    'Lumberjacking',
    'Mining',
    'Fishing',

    'Blacksmithing',
    'Tailoring',
    'Tinkering',
    'Woodcrafting',

    'Cooking',

    'Anatomy',
    'Healing',
    'Poisoning',

    'Hiding',
    'Detecting Hidden',

    'Lockpicking',
    'Removing Traps',

    'Magery/Cleric',
    'Magery/Wizard',
    'Magery/Druid',
    'Alchemy/Cleric',
    'Alchemy/Druid',
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
// EnchantingのEtherite抽出・Crystal精製・アイテム加工の回数（enchantCount = { Etherite: 抽出回数, Crystal: 精製回数, Craft: 加工回数 }）
let enchantCount = {};
let totalEnchantCount = {};
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

// Lumberjacking, Miningの最後のstartのタイムスタンプ（Date形式）
// 他のTaken: から区別するために使用
let lastGatherDate = {};
// Blacksmithing, Tailoring, Tinkering, Woodcrafting, Enchanting/Craftの内で最後に準備したスキル
// 手動でツールを装備した場合を検知できないという問題点があるが…
let lastCraftSkill = null;
// 最後に使用した魔法（Fizzle分をカウントから除去するのに使う）
let lastSpellCode = null;
// 自動検出したAlchemyスキル
let alchemySkillName = null;
// 自動検出したMageryスキル
let magerySkillName = null;

// 集計結果
let resultLogs = [];

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
    lastCraftSkill = null;
    lastSpellCode = null;
    alchemySkillName = null;
    magerySkillName = null;
    resultLogs = [];
}

/**
 * ログの走査
 * @param {Object} fileData
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
     * @param {string} text
     * @param {string | RegExp} search
     * @param {string | RegExp} skill
     * @returns {boolean | string} true/false or matchText
     */
    function checkMatch(text, search, skill = null) {
        if (typeof search === 'string') {
            if (text === search) {
                return true;
            }
        } else if (search instanceof RegExp) {
            const match = text.match(search);
            if (match) {
                // Enchanting/Crystal の場合は match[1] が undefined になるので match[2] を使う
                let matchText = match[1] || match[2];
                // 一部スキルでは単語の頭を大文字にする
                if (matchText) {
                    if (['Alchemy', 'Anatomy', 'Fishing', 'Enchanting', 'SkillLevelUp'].includes(skill)) {
                        matchText = matchText.replace(/(?:^|\/|\s)([a-z])/g, (match) => match.toUpperCase());
                    }
                    return matchText;
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * スキルアクションをチェックする
     * @param {string} body
     * @returns {[string, string, string]} [skill, action, match]
     */
    function checkSkillAction (body) {
        for (const skill of Object.keys(LOG)) {
            for (const action of Object.keys(LOG[skill])) {
                const match = checkMatch(body, LOG[skill][action], skill);
                if (match) {
                    return [skill, action, match];
                }
            }
        }
        return [null, null, null];
    }

    for (const line of fileData.lines) {
        
        if (line.trim() === '') continue;

        let lineMatch = line.match(logPattern);
        if (lineMatch) {
            // [タイムスタンプ, 名前, 本文]
            const [timeStamp, name, body] = [lineMatch[1], lineMatch[2], lineMatch[3]];
            const [skillCode, skillAction, matchedText] = checkSkillAction(body);

            // スキル使用時
            if (matchedText) {

                // Lumberjacking, Mining の start の場合はタイムスタンプを更新
                if (['Lumberjacking', 'Mining'].includes(skillCode) && skillAction === 'start') {
                    lastGatherDate[skillCode] = new Date(timeStamp.replace(' ', 'T'));
                }
                // Gathering の success の場合
                if (skillCode === 'Gathering') {
                    const itemName = matchedText;
                    let skillName = null;
                    if (GATHER_STUFF['Lumberjacking'].includes(itemName)) {
                        skillName = 'Lumberjacking';
                    } else if (GATHER_STUFF['Mining'].includes(itemName)) {
                        skillName = 'Mining';
                    }
                    if (skillName && lastGatherDate[skillName]) {
                        const startDate = lastGatherDate[skillName];
                        const successDate = new Date(timeStamp.replace(' ', 'T'));
                        const diffSec = (successDate - startDate) / 1000;
                        // スキルのstartからsuccessまでの猶予時間内ならGatheringスキルとみなす
                        if (diffSec < GATHER_LIMIT) {
                            // Lumberjacking, Miningの成功数を加算
                            skillCount[skillName] ||= {};
                            skillCount[skillName][skillAction] = (skillCount[skillName][skillAction] || 0) + 1;
                            totalSkillCount[skillName] ||= {};
                            totalSkillCount[skillName][skillAction] = (totalSkillCount[skillName][skillAction] || 0) + 1;
                            // 収集したアイテムを加算
                            gatherCount[skillName] ||= {};
                            gatherCount[skillName][itemName] = (gatherCount[skillName][itemName] || 0) + 1;
                            totalGatherCount[skillName] ||= {};
                            totalGatherCount[skillName][itemName] = (totalGatherCount[skillName][itemName] || 0) + 1;
                        } else {
                            // Lumberjacking, Mining以外のTaken: と思われるものを加算
                            totalTakeCount[itemName] = (totalTakeCount[itemName] || 0) + 1;
                        }
                    }
                    continue;
                }
                // Fishing
                if (skillCode === 'Fishing' && skillAction === 'success') {
                    const catchName = matchedText;
                    catchCount[catchName] = (catchCount[catchName] || 0) + 1;
                    totalCatchCount[catchName] = (totalCatchCount[catchName] || 0) + 1;
                }
                // Alchemy
                if (skillCode === 'Alchemy') {
                    const potionName = matchedText;
                    const alchemySkillName = POTION[potionName].skillName;
                    if (skillAction === 'success') {
                        potionCount[potionName] = (potionCount[potionName] || 0) + 1;
                        totalPotionCount[potionName] = (totalPotionCount[potionName] || 0) + 1;
                        const manaCost = POTION[potionName].manaCost;
                        subtotalManaCost += manaCost;
                        totalManaCost += manaCost;
                    }
                    // カウントを加算
                    skillCount[alchemySkillName] ||= {};
                    skillCount[alchemySkillName][skillAction] = (skillCount[alchemySkillName][skillAction] || 0) + 1;
                    totalSkillCount[alchemySkillName] ||= {};
                    totalSkillCount[alchemySkillName][skillAction] = (totalSkillCount[alchemySkillName][skillAction] || 0) + 1;
                    continue;
                }
                // Magery
                if (skillCode === 'Magery') {
                    if (skillAction === 'success') {
                        if (name === characterName) {
                            const spellCode = matchedText;
                            spellCount[spellCode] = (spellCount[spellCode] || 0) + 1;
                            totalSpellCount[spellCode] = (totalSpellCount[spellCode] || 0) + 1;
                            const manaCost = SPELL[spellCode].manaCost;
                            subtotalManaCost += manaCost;
                            totalManaCost += manaCost;
                            lastSpellCode = spellCode;
                            // カウントを加算
                            magerySkillName ||= SPELL[spellCode].skillName;
                            skillCount[magerySkillName] ||= {};
                            skillCount[magerySkillName][skillAction] = (skillCount[magerySkillName][skillAction] || 0) + 1;
                            totalSkillCount[magerySkillName] ||= {};
                            totalSkillCount[magerySkillName][skillAction] = (totalSkillCount[magerySkillName][skillAction] || 0) + 1;
                            // Magery/Wizardの場合は今後装備変更なしで使用されるCraftingスキルがEnchantingである可能性が高い
                            if (magerySkillName === 'Magery/Wizard') {
                                lastCraftSkill = 'Enchanting';
                            }
                        }
                        continue;
                    }
                    // Fizzle
                    if (skillAction === 'fail' && lastSpellCode) {
                        const spellCode = lastSpellCode;
                        spellCount[spellCode] = spellCount[spellCode] - 1 || 0;
                        totalSpellCount[spellCode] = totalSpellCount[spellCode] - 1 || 0;
                        const manaCost = SPELL[spellCode].manaCost;
                        subtotalManaCost -= manaCost;
                        totalManaCost -= manaCost;
                        fizzleCount[spellCode] = (fizzleCount[spellCode] || 0) + 1;
                        totalFizzleCount[spellCode] = (totalFizzleCount[spellCode] || 0) + 1;
                        magerySkillName ||= SPELL[spellCode].skillName;
                        // カウントを減算
                        skillCount[magerySkillName] ||= {};
                        skillCount[magerySkillName][skillAction] = (skillCount[magerySkillName][skillAction] || 0) + 1;
                        totalSkillCount[magerySkillName] ||= {};
                        totalSkillCount[magerySkillName][skillAction] = (totalSkillCount[magerySkillName][skillAction] || 0) + 1;
                        continue;
                    }
                }
                // Enchanting/EtheriteとEnchanting/Crystal
                if (skillCode === 'Enchanting') {
                    // 両手がフリーになったらEnchanting/Craftを疑う
                    if (skillAction === 'ready') {
                        lastCraftSkill = 'Enchanting';
                        continue;
                    }
                    const enchantStuff = matchedText;
                    enchantCount[enchantStuff] ||= {};
                    enchantCount[enchantStuff][skillAction] = (enchantCount[enchantStuff][skillAction] || 0) + 1;
                    totalEnchantCount[enchantStuff] ||= {};
                    totalEnchantCount[enchantStuff][skillAction] = (totalEnchantCount[enchantStuff][skillAction] || 0) + 1;
                    const manaCost = 3;
                    subtotalManaCost += manaCost;
                    totalManaCost += manaCost;
                    // カウントを加算
                    skillCount[lastCraftSkill] ||= {};
                    skillCount[lastCraftSkill][skillAction] = (skillCount[lastCraftSkill][skillAction] || 0) + 1;
                    totalSkillCount[lastCraftSkill] ||= {};
                    totalSkillCount[lastCraftSkill][skillAction] = (totalSkillCount[lastCraftSkill][skillAction] || 0) + 1;
                    continue;
                }
                // Crafting（Enchanting/Craftを含む）
                if (skillCode === 'Crafting') {
                    if (skillAction === 'ready') {
                        const craftSkill = {
                            'blacksmithing hammer': 'Blacksmithing',
                            'shears': 'Tailoring',
                            'tinkering tools': 'Tinkering',
                            'woodworking tools': 'Woodcrafting',
                        };
                        lastCraftSkill = craftSkill[matchedText] || null;
                        continue;
                    }
                    if (lastCraftSkill) {
                        skillCount[lastCraftSkill] ||= {};
                        skillCount[lastCraftSkill][skillAction] = (skillCount[lastCraftSkill][skillAction] || 0) + 1;
                        totalSkillCount[lastCraftSkill] ||= {};
                        totalSkillCount[lastCraftSkill][skillAction] = (totalSkillCount[lastCraftSkill][skillAction] || 0) + 1;
                        if (lastCraftSkill === 'Enchanting') {
                            enchantCount['Craft'] ||= {};
                            enchantCount['Craft'][skillAction] = (enchantCount['Craft'][skillAction] || 0) + 1;
                            totalEnchantCount['Craft'] ||= {};
                            totalEnchantCount['Craft'][skillAction] = (totalEnchantCount['Craft'][skillAction] || 0) + 1;
                            const manaCost = 3;
                            subtotalManaCost += manaCost;
                            totalManaCost += manaCost;
                        }
                        continue;
                    }
                }

                // カウントを加算
                skillCount[skillCode] ||= {};
                skillCount[skillCode][skillAction] = (skillCount[skillCode][skillAction] || 0) + 1;
                totalSkillCount[skillCode] ||= {};
                totalSkillCount[skillCode][skillAction] = (totalSkillCount[skillCode][skillAction] || 0) + 1;

                continue;
            }

            // スキルレベルアップ
            const skillName = checkMatch(body, SKILL_LEVEL_UP_REGEXP, 'SkillLevelUp');
            if (SKILLS.includes(skillName)) {

                let skillCode = skillName;
                if (['Alchemy/Cleric', 'Alchemy/Druid'].includes(skillName)) skillCode = 'Alchemy';
                // if (['Blacksmithing', 'Tailoring', 'Tinkering', 'Woodworking'].includes(skillName)) skillCode = 'Crafting';
                // if (['Lumberjacking', 'Mining'].includes(skillName)) skillCode = 'Gathering';
                if (['Magery/Cleric', 'Magery/Druid', 'Magery/Wizard'].includes(skillName)) skillCode = 'Magery';

                resultLogs.push(`[${timeStamp}]: ${skillName} skill level has increased.`);
                let startCount = skillCount[skillName]?.start || null;
                let successCount = skillCount[skillName]?.success || null;
                let failCount = skillCount[skillName]?.fail || null;
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
                skillCount[skillName] = {};

                // Gathering
                if (['Lumberjacking', 'Mining'].includes(skillCode) && optionTakeCatch) {
                    if (gatherCount[skillCode] && Object.keys(gatherCount[skillCode]).length) {
                        resultLogs.push(`${SPACER}============================`);
                        const sortedGatherCount = Object.entries(gatherCount[skillCode]).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(gatherCount[skillCode]).map(v => String(v).length));
                        for (const [itemName, count] of sortedGatherCount) {
                            resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${itemName}`);
                        }
                        gatherCount[skillCode] = {};
                    }
                    continue;
                }
                // Fishing
                if (skillCode === 'Fishing' && optionTakeCatch) {
                    if (Object.keys(catchCount).length) {
                        resultLogs.push(`${SPACER}============================`);
                        const sortedCatchCount = Object.entries(catchCount).sort((a, b) => b[1] - a[1]);
                        const maxLength = Math.max(...Object.values(catchCount).map(v => String(v).length));
                        for (const [fishName, count] of sortedCatchCount) {
                            resultLogs.push(`${SPACER}${String(count).padStart(maxLength, ' ')} ${fishName}`);
                        }
                        catchCount = {};
                    }
                    continue;
                }
                // Alchemy
                if (skillCode === 'Alchemy') {
                    if (Object.keys(potionCount).length) {
                        resultLogs.push(`${SPACER}============================`);
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
                    continue;
                }
                // Enchanting
                if (skillCode === 'Enchanting') {
                    if (Object.keys(enchantCount).length) {
                        resultLogs.push(`${SPACER}============================`);
                        const enchantStuffs = ['Etherite', 'Crystal', 'Craft'];
                        const maxLength = Math.max(...enchantStuffs.map(v => String(v).length));
                        for (const enchantStuff of enchantStuffs) {
                            let startCount = enchantCount[enchantStuff]?.start || null;
                            let successCount = enchantCount[enchantStuff]?.success || null;
                            let failCount = enchantCount[enchantStuff]?.fail || null;
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
                                resultLogs.push(`${SPACER}${enchantStuff.padStart(maxLength, ' ')}: ${countData.join(', ')}${successRate ? ` (${successRate}%)` : ''}`);
                            }
                            // スキルの使用・成功・失敗回数を初期化
                            enchantCount[enchantStuff] = {};
                        }
                    }
                    continue;
                }
                // Magery
                if (skillCode === 'Magery') {
                    if (Object.keys(spellCount).length) {
                        resultLogs.push(`${SPACER}============================`);
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
                    continue;
                }
                // Meditation
                if (skillCode === 'Meditation') {
                    if (subtotalManaCost) {
                        resultLogs.push(`${SPACER}${subtotalManaCost} MP`);
                        subtotalManaCost = 0;
                    }
                    continue;
                }
            }

            // クラスレベルアップ
            const classLevel = checkMatch(body, CLASS_LEVEL_UP_REGEXP);
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

    for (const skillName of SKILL_ORDER) {

        if (!totalSkillCount[skillName]) continue;

        let startCount = totalSkillCount[skillName]?.start || null;
        let successCount = totalSkillCount[skillName]?.success || null;
        let failCount = totalSkillCount[skillName]?.fail || null;
        let successRate = null;

        // データが存在するかどうか確認（使用回数、成功・失敗、または各固有のカウント）
        let hasData = startCount !== null || successCount !== null || failCount !== null;

        if (skillName === 'Lumberjacking' || skillName === 'Mining') {
            if (totalGatherCount[skillName] && Object.keys(totalGatherCount[skillName]).length) {
                hasData = true;
            }
        } else if (skillName === 'Alchemy/Cleric' || skillName === 'Alchemy/Druid') {
            if (Object.keys(totalPotionCount).length) hasData = true;
        } else if (skillName === 'Fishing') {
            if (Object.keys(totalCatchCount).length) hasData = true;
        } else if (skillName === 'Magery') {
            if (Object.keys(totalSpellCount).length) hasData = true;
        } else if (skillName === 'Meditation') {
            if (totalManaCost > 0) hasData = true;
        }

        if (!hasData) continue;

        resultLogs.push(`${skillName}:`);

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
        if (['Lumberjacking', 'Mining'].includes(skillName) && optionTakeCatch) {
            if (totalGatherCount[skillName] && Object.keys(totalGatherCount[skillName]).length) {
                resultLogs.push(`${TOTAL_SPACER}============================`);
                const sortedGatherCount = Object.entries(totalGatherCount[skillName]).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalGatherCount[skillName]).map(v => String(v).length));
                for (const [itemName, count] of sortedGatherCount) {
                    resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${itemName}`);
                }
            }
        }
        // Fishing
        if (skillName === 'Fishing' && optionTakeCatch) {
            if (Object.keys(totalCatchCount).length) {
                resultLogs.push(`${TOTAL_SPACER}============================`);
                const sortedCatchCount = Object.entries(totalCatchCount).sort((a, b) => b[1] - a[1]);
                const maxLength = Math.max(...Object.values(totalCatchCount).map(v => String(v).length));
                for (const [fishName, count] of sortedCatchCount) {
                    resultLogs.push(`${TOTAL_SPACER}${String(count).padStart(maxLength, ' ')} ${fishName}`);
                }
            }
        }

        // Alchemy
        if (skillName === 'Alchemy/Cleric' || skillName === 'Alchemy/Druid') {
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
        // Enchanting
        if (skillName === 'Enchanting') {
            if (Object.keys(totalEnchantCount).length) {
                resultLogs.push(`${TOTAL_SPACER}============================`);
                const enchantStuffs = ['Etherite', 'Crystal', 'Craft'];
                const maxLength = Math.max(...enchantStuffs.map(v => String(v).length));
                for (const enchantStuff of enchantStuffs) {
                    let startCount = totalEnchantCount[enchantStuff]?.start || null;
                    let successCount = totalEnchantCount[enchantStuff]?.success || null;
                    let failCount = totalEnchantCount[enchantStuff]?.fail || null;
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
                        resultLogs.push(`${TOTAL_SPACER}${enchantStuff.padStart(maxLength, ' ')}: ${countData.join(', ')}${successRate ? ` (${successRate}%)` : ''}`);
                    }
                    // スキルの使用・成功・失敗回数を初期化
                    enchantCount[enchantStuff] = {};
                }
            }
        }
        // Magery
        if (skillName === 'Magery/Cleric' || skillName === 'Magery/Wizard' || skillName === 'Magery/Druid') {
            if (Object.keys(totalSpellCount).length) {
                resultLogs.push(`${TOTAL_SPACER}============================`);
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
        if (skillName === 'Meditation') {
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
