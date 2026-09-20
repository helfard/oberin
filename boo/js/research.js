/**
 * research.js
 * ログの走査と集計（日付と入力値からファイル名を直接生成して取得）
 */

// Lumberjacking, Mining の Taken であると見なす start から success までの猶予時間（秒）
const GATHER_LIMIT = 8;

// 整形用のインデント
const INDENT = '  ';
// 整形用の横線
const BAR = '================================';
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
    'Poisoning',

    'Enchanting',
    'Alchemy/Cleric',
    'Alchemy/Druid',

    'Magery/Cleric',
    'Magery/Wizard',
    'Magery/Druid',
    'Meditation',

    'Anatomy',
    'Healing',

    'Hiding',
    'Detecting Hidden',
    'Tracking',

    'Lockpicking',
    'Removing Traps',

    'Taming',

// 以下のスキルは集計が不可能なため除外
//    'Melee',
//    'Parring',
//    'Resisting Magic',
//    'Special/Fighter',
//    'Special/Ranger',
//    'Special/Rogue',
];

// Anatomy での強さ
const STRENGTH = ['Extremely Weak', 'Somewhat Weak', 'Of Average Strength', 'Quite Strong', 'Very Strong', 'Unbelievably Strong'];

// 集計用データ
// スキルごとの総計（skillCount['スキル名'] = { start: 使用回数, success: 成功回数, fail: 失敗回数 }）
let skillCount = {};
let totalSkillCount = {};

// 採集品（Lumberjacking）の名前と個数（lumberjackCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let lumberjackCount = {};
let totalLumberjackCount = {};
// 採集品（Mining）の名前と個数（mineCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let mineCount = {};
let totalMineCount = {};
// スキル不明の採取品との名前と個数（gatherCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let gatherCount = {};
let totalGatherCount = {};
// 採集品（Fishing）の名前と個数（fishCount['魚名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let fishCount = {};
let totalFishCount = {};

// 制作物（Blacksmithing）の名前と個数（blacksmithCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let blacksmithCount = {};
let totalBlacksmithCount = {};
// 制作物（Tailoring）の名前と個数（tailrtCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let tailorCount = {};
let totalTailorCount = {};
// 制作物（Tinkering）の名前と個数（tinkerCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let tinkerCount = {};
let totalTinkerCount = {};
// 制作物（Woodcrafting）の名前と個数（woodcraftCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let woodcraftCount = {};
let totalWoodcraftCount = {};
// 制作物（Enchanging）の名前（Etherite/Crystal/その他）と個数（enchantCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
// その他は本当にカウントできるか分からない
let enchantCount = {};
let totalEnchantCount = {};
// スキル不明の制作物の名前と個数（craftCount['アイテム名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let craftCount = {};
let totalCraftCount = {};

// 作成したポーションの名前と個数（***PotionCount['ポーション名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }）
let clericPotionCount = {};
let totalClericPotionCount = {};
let druidPotionCount = {};
let totalDruidPotionCount = {};
// スキル不明のポーションの名前と個数（potionCount['ポーション名'] = { start: 開始回数, success: 成功回数, fail: 失敗回数 }*/)
let potionCount = {};
let totalPotionCount = {};

// 使用した魔法の回数（***SpellCount['魔法名'] = { success: 成功回数, fail: 失敗（Fizzle）回数 }）
let wizardSpellCount = {};
let totalWizardSpellCount = {};
let clericSpellCount = {};
let totalClericSpellCount = {};
let druidSpellCount = {};
let totalDruidSpellCount = {};
// スキル不明の魔法の回数（spellCount['魔法名'] = { success: 成功回数, fail: 失敗（Fizzle）回数 }）
let spellCount = {};
let totalSpellCount = {};

// 総計Mana消費量（Magery＋Alchemy＋Enchantingの分、Meditationのレベルアップでリセットする）
// これは意味があるか分からない
let subtotalManaCost = 0;
let totalManaCost = 0;

// Anatomyの結果（anatomyCount['結果'] = { : 開始回数, success: 成功回数, fail: 失敗回数 }）
let anatomyCount = {};
let totalAnatomyCount = {};

// Lumberjacking, Mining の最後のstartのタイムスタンプ（Date形式）
// lastGatherDate['スキル名'] = Date
// Taken:  *** のログのスキルの判別に使用する
let lastGatherDate = {};
// 最後に使用した魔法の詠唱文（Fizzle分をカウントから除去するのに使う）
let lastSpellCode = null;
// Blacksmithing, Tailoring, Tinkering, Woodcrafting, Enchanting/Craftの内で最後に準備したスキル
// これは手動でツールを装備した場合を検知できないという問題点があるが…
let lastCraftSkill = null;

// 集計結果
let resultLogs = [];

// 副産物を集計するスキルの設定
const counterMap = {
    'Gathering'     : { counter: gatherCount,       totalCounter: totalGatherCount,       optionId: 'optionTakeCatch' },
    'Lumberjacking' : { counter: lumberjackCount,   totalCounter: totalLumberjackCount,   optionId: 'optionTakeCatch', lastGatherDate: lastGatherDate },
    'Mining'        : { counter: mineCount,         totalCounter: totalMineCount,         optionId: 'optionTakeCatch', lastGatherDate: lastGatherDate },
    'Fishing'       : { counter: fishCount,         totalCounter: totalFishCount,         optionId: 'optionTakeCatch', lastGatherDate: lastGatherDate },
    'Crafting'      : { counter: craftCount,        totalCounter: totalCraftCount,        optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Blacksmithing' : { counter: blacksmithCount,   totalCounter: totalBlacksmithCount,   optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Tailoring'     : { counter: tailorCount,       totalCounter: totalTailorCount,       optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Tinkering'     : { counter: tinkerCount,       totalCounter: totalTinkerCount,       optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Woodcrafting'  : { counter: woodcraftCount,    totalCounter: totalWoodcraftCount,    optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Enchanting'    : { counter: enchantCount,      totalCounter: totalEnchantCount,      optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: CRAFT },
    'Alchemy'       : { counter: potionCount,       totalCounter: totalPotionCount,       optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: POTION },
    'Alchemy/Cleric': { counter: clericPotionCount, totalCounter: totalClericPotionCount, optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: POTION },
    'Alchemy/Druid' : { counter: druidPotionCount,  totalCounter: totalDruidPotionCount,  optionId: 'optionCraft', subOptionId: 'optionResource', resourceData: POTION },
    'Magery'        : { counter: spellCount,        totalCounter: totalSpellCount,        optionId: 'optionSpell', subOptionId: 'optionResource', resourceData: SPELL },
    'Magery/Wizard' : { counter: wizardSpellCount,  totalCounter: totalWizardSpellCount,  optionId: 'optionSpell', subOptionId: 'optionResource', resourceData: SPELL },
    'Magery/Cleric' : { counter: clericSpellCount,  totalCounter: totalClericSpellCount,  optionId: 'optionSpell', subOptionId: 'optionResource', resourceData: SPELL },
    'Magery/Druid'  : { counter: druidSpellCount,   totalCounter: totalDruidSpellCount,   optionId: 'optionSpell', subOptionId: 'optionResource', resourceData: SPELL },
    'Anatomy'       : { counter: anatomyCount,      totalCounter: totalAnatomyCount,      optionId: 'optionEtc' },
}

/**
 * 集計データの初期化
 */
function initCountData() {
    clearObject(skillCount);
    clearObject(totalSkillCount);

    clearObject(lumberjackCount);
    clearObject(totalLumberjackCount);
    clearObject(mineCount);
    clearObject(totalMineCount);
    clearObject(gatherCount);
    clearObject(totalGatherCount);
    clearObject(fishCount);
    clearObject(totalFishCount);

    clearObject(blacksmithCount);
    clearObject(totalBlacksmithCount);
    clearObject(tailorCount);
    clearObject(totalTailorCount);
    clearObject(tinkerCount);
    clearObject(totalTinkerCount);
    clearObject(woodcraftCount);
    clearObject(totalWoodcraftCount);
    clearObject(enchantCount);
    clearObject(totalEnchantCount);
    clearObject(craftCount);
    clearObject(totalCraftCount);

    clearObject(clericPotionCount);
    clearObject(totalClericPotionCount);
    clearObject(druidPotionCount);
    clearObject(totalDruidPotionCount);
    clearObject(potionCount);
    clearObject(totalPotionCount);

    clearObject(wizardSpellCount);
    clearObject(totalWizardSpellCount);
    clearObject(clericSpellCount);
    clearObject(totalClericSpellCount);
    clearObject(druidSpellCount);
    clearObject(totalDruidSpellCount);
    clearObject(spellCount);
    clearObject(totalSpellCount);

    subtotalManaCost = 0;
    totalManaCost = 0;

    clearObject(lastGatherDate);
    lastCraftSkill = null;
    lastSpellCode = null;

    resultLogs = [];
}
/**
 * オブジェクトを初期化
 * @param {Object} obj 
 */
function clearObject(obj) {
    for (const key in obj) {
        delete obj[key];
    }
}

/**
 * カウント情報を表示（ラベルありなし、start/success/fail/successRate もしくは success のみを切り替えて表示）
 * @param {{key: string, counter?: object, maxKeyLength?: number, maxSuccessLength?: number}}
 * @returns 
 */
function showCountData ({key, counter = totalSkillCount, maxKeyLength = null, maxSuccessLength = null}) {
    if (!counter[key] || Object.keys(counter[key]).length === 0) return;
    const start   = counter[key]?.start   || null;
    const success = counter[key]?.success || null;
    const fail    = counter[key]?.fail    || null;
    // Magery の場合 key が詠唱文なので spellName を使う
    const keyName = SPELL[key]?.spellName || key;
    const padLabel   = maxKeyLength     ? (keyName.padStart(maxKeyLength,     ' ') + '  ') : '';
    const padSuccess = maxSuccessLength ? String(success).padStart(maxSuccessLength, ' ') : '';
    // 成功率の算出
    // start が信用できないスキルと fail が信用できないスキルがあるので
    // start と success + fail の小さい方を採用する
    const total = start && (start < success + fail) ? start : fail ? (success + fail) : null;
    const countData = total ? [
        start && `Start ${start}`,
        success && `Success ${success}`,
        fail && `Fail ${fail}`,
    ].filter(Boolean) : [padSuccess];
    const successRate   = total &&(success / total * 100).toFixed(1) || null;
    const successRateStr = successRate ? ` (${successRate}%)` : '';
    if (`${padLabel}${countData.join(', ')}${successRateStr}` === '') {
        logMessage(key, counter[key], start, success, fail, keyName);
    }
    resultLogs.push(`${INDENT}${INDENT}${padLabel}${countData.join(', ')}${successRateStr}`);
}
/**
 * ラベル付きカウント情報を表示
 * @param {Object} counter 
 */
function showLabeledCountData (counter = {}) {
    const maxKeyLength = Math.max(...Object.keys(counter).map(k => {
        // Magery の場合 counter の key が詠唱文なので spellName を使う
        if (SPELL[k]?.spellName) {
            return SPELL[k].spellName.length;
        }
        return k.length;
    }));
    const maxSuccessLength = Math.max(...Object.values(counter).map(k => String(k.success).length));
    const sortedCounter = Object.fromEntries(Object.entries(counter).sort(([, a], [, b]) => (b.success || 0) - (a.success || 0)));
    for (const [key, data] of Object.entries(sortedCounter)) {
        showCountData({key: key, counter: sortedCounter, maxKeyLength: maxKeyLength, maxSuccessLength: maxSuccessLength});
    }
}
/**
 * 素材をカウントして表示
 * @param {Object} counter 
 */
function showResourceCount (counter = {}, itemData = {}) {
    let resorceCount = {};
    for (const [key, action] of Object.entries(counter)) {
        const resource = itemData[key]?.resource || {};
        for (const [stuff, num] of Object.entries(resource)) {
            const add = (action.success * num) || 0;
            resorceCount[stuff] ||= {};
            resorceCount[stuff].success = (resorceCount[stuff].success || 0) + add;
        }
    }
    showLabeledCountData(resorceCount);
}
/**
 * 消費MPを表示
 * @param {number} manacost 
 */
function showManaCost (manacost = totalManaCost) {
    resultLogs.push(`${INDENT}${INDENT}ManaPoint: ${subtotalManaCost}`);
}
/**
 * Anatomy のカウントを表示
 * @param {Object} counter 
 */
function showAnatomyCount (counter = totalAnaatomyCount) {
    const maxKeyLength = Math.max(...STRENGTH.map(v => String(v).length));
    const maxCountLength = Math.max(...Object.values(anatomyCount).map(v => String(v).length));
    for (const key of STRENGTH) {
        const count = anatomyCount[key] || 0;
        resultLogs.push(`${INDENT}${INDENT}${String(key).padStart(maxLength, ' ')} ${String(count).padStart(maxCountLength, ' ')}`);
    }
}

/**
 * ログの走査
 * @param {Object} fileData
 * （fileData.fileName, fileData.date,
 *   fileData.character, fileData.lines, fileData.text,
 *   fileData.optionTakeCatch, fileData.optionCraft, fileData.optionSpell, fileData.optionResource, fileData.optionEtc が利用可能）
 */
function researchLogs(fileData) {

    // キャラクターの名前
    const characterName = fileData.character;

    // 解析対象のログの書式
    const logPattern = /^(?:\[(.*?)\]: )?(?:\((.*?)\): )?(.*)$/;

    /**
     * ログの本文を解析して使用スキル・アクション・マッチした単語を返す
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
        }
        if (search instanceof RegExp) {
            const match = text.match(search);
            if (match) {
                // Enchanting/Crystal の場合は match[1] が undefined になるので match[2] を使う
                let matchText = match[1] || match[2] || null;
                // 一部スキルではマッチした単語の頭を大文字にする
                if (matchText) {
                    const skillSet = new Set(['Alchemy', 'Anatomy', 'Fishing', 'Crafting', 'Enchanting', 'SkillLevelUp']);
                    if (skillSet.has(skill)) {
                        matchText = matchText.replace(/(?:^|\/|\s)([a-z]+)/g, (match, word) => {
                            // of は大文字にしない
                            if (word === 'of') return match; 
                            return match.replace(word, word.charAt(0).toUpperCase() + word.slice(1));
                        });
                    }
                    return matchText;
                }
                return true;
            }
        }
        return false;
    }
    /**
     * skillCount, totalSkillCount にカウントを加算
     * @param {Object} {key: string, action: string, counter: object, totalCounter: object, add: number}
     */
    function countUp ({key, action, counter = skillCount, totalCounter = totalSkillCount, add = 1}) {
        counter[key] ||= {};
        counter[key][action] = (counter[key][action] || 0) + add;
        totalCounter[key] ||= {};
        totalCounter[key][action] = (totalCounter[key][action] || 0) + add;
    }
    /**
     * ManaCostの加算
     * @param {number} add 
     */
    function addManaCost (add = 3) {
        subtotalManaCost += add;
        totalManaCost += add;
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

                // 個別処理
                // Lumberjacking, Mining の start の場合は lastGatherDate のタイムスタンプを更新
                if ((skillCode === 'Lumberjacking' || skillCode === 'Mining') && skillAction === 'start') {
                    lastGatherDate[skillCode] = new Date(timeStamp.replace(' ', 'T'));
                    continue;
                }
                // Crafting（Blacksmithing, Tailoring, Tinkering, Woodcrafting および Enchanting/Craft）
                if (skillCode === 'Crafting') {
                    // ready の場合は lastCraftSkill を更新
                    if (skillAction === 'ready') {
                        // 道具の装備ログからスキルを判別
                        const craftMap = {
                            'Blacksmithing Hammer': 'Blacksmithing',
                            'Shears': 'Tailoring',
                            'Tinkering Tools': 'Tinkering',
                            'Woodworking Tools': 'Woodcrafting',
                        };
                        // 現状 ready になるのはこれらと Enchanting しか無いため skillCode は確認せずに決め打ちしている
                        lastCraftSkill = craftMap[matchedText] || skillCode;
                        // これだと Cooking の ready も Enchanting に判定されるが、Cooking は start/fail/success のログで判別できるので気にしない
                        continue;
                    }
                }
                // Magery（Wizard/Cleric/Druid）の success の場合は name が characterName と一致するかチェック
                if (skillCode === 'Magery' && skillAction === 'success') {
                    if (name === characterName) {
                        // 自分の魔法であった場合は lastSpellCode を更新（Fizzle分をカウントから除去するのに使う）
                        lastSpellCode = matchedText;
                        // Magery/Wizard を使って素手のまま何かを Craft した場合は Enchanting とみなす
                        if (SPELL[matchedText]?.skillName === 'Magery/Wizard') {
                            lastCraftSkill = 'Enchanting';
                        }
                    } else {
                        // 自分の魔法でなかった場合は飛ばす
                        continue;
                    }
                }

                // 全体処理
                // Gathering（Lumberjacking, Mining）かつ success の場合 start からの猶予時間外なら Gathering とみなす
                // これでは猶予時間内に何か紛らわしいものを拾うと誤認識してしまうが…
                const gatherName = GATHER[matchedText]?.skillName || null;
                const startDate = counterMap[gatherName]?.lastGatherDate?.[gatherName] || null;
                const successDate = startDate ? new Date(timeStamp.replace(' ', 'T')) : null;
                const diffSec = startDate ? ((successDate - startDate) / 1000) : null;
                const useGather = startDate ? (diffSec <= GATHER_LIMIT) : null;
                // Gathering（Lumberjacking, Mining）
                // Alchemy（Cleric/Druid）
                // Crafting（Blacksmithing, Tailoring, Tinkering, Woodcrafting および Enchanting/Craft）
                // Magery（Wizard/Cleric/Druid）
                // これらの場合はスキル名の正式名称を skillName に入れる
                const skillName = useGather && gatherName
                    || skillCode === 'Alchemy' && POTION[matchedText]?.skillName
                    || skillCode === 'Crafting' && (CRAFT[matchedText]?.skillName || lastCraftSkill)
                    || skillCode === 'Magery' && (SPELL[matchedText]?.skillName || SPELL[lastSpellCode]?.skillName)
                    || skillCode;
                // counterMap からスキルごとの設定値を取得
                const counter = counterMap[skillName]?.counter || {};
                const totalCounter = counterMap[skillName]?.totalCounter || {};

                // スキルのカウントを加算
                countUp({key: skillName, action: skillAction});
                // 副産物を加算
                if (typeof matchedText === 'string') {
                    countUp({key: matchedText, action: skillAction, counter: counter, totalCounter: totalCounter});
                }
                // MP消費をする場合（Alchemy/Enchanting/Magery）
                const resourceData = counterMap[skillName]?.resourceData || {};
                const manaCost = (skillName === 'Enchanting') ? 3 : resourceData[matchedText]?.manaCost || null;
                if (skillAction === 'success' && manaCost) {
                    addManaCost(manaCost);
                }
                // Magery の fail（つまりFizzle）の場合は success と消費MPを減算する
                if (skillCode === 'Magery' && skillAction === 'fail' && lastSpellCode) {
                    const lastSkillName = resourceData[lastSpellCode]?.skillName || null;
                    const lastSpellName = resourceData[lastSpellCode]?.spellName || null;
                    const lastManaCost = resourceData[lastSpellCode]?.manaCost || 0;
                    const lastCounter = counterMap[lastSkillName]?.counter || {};
                    const lastTotalCounter = counterMap[lastSkillName]?.totalCounter || {};
                    if (lastSpellName && lastManaCost) {
                        countUp({key: lastSpellCode, action: 'success', add: -1});
                        countUp({key: lastSpellCode, action: 'success', counter: lastCounter, totalCounter: lastTotalCounter, add: -1});
                        countUp({key: lastSpellCode, action: 'fail'});
                        countUp({key: lastSpellCode, action: 'fail', counter: lastCounter, totalCounter: lastTotalCounter});
                        addManaCost(lastManaCost * -1);
                    }
                }
                continue;
            }

            // スキルレベルアップ
            const skillName = checkMatch(body, SKILL_LEVEL_UP_REGEXP, 'SkillLevelUp');
            if (SKILLS.includes(skillName)) {

                resultLogs.push(``);
                resultLogs.push(`[${timeStamp}]:`);
                resultLogs.push(`${INDENT}${skillName} skill level has increased.`);
                // 集計結果の表示
                showCountData({key: skillName, counter: skillCount});
                // カウントデータを初期化
                clearObject(skillCount[skillName]);

                // counterMap からスキルごとの設定値を取得
                let counter = counterMap[skillName]?.counter || {};
                const showDetail = fileData[counterMap[skillName]?.optionId] || false;
                const showSubDetail = fileData[counterMap[skillName]?.subOptionId] || false;
                const resourceData = counterMap[skillName]?.resourceData || {};
                if (showDetail) {
                    resultLogs.push(`${INDENT}${INDENT}${BAR}`);
                    showLabeledCountData(counter);
                }
                if (showSubDetail) {
                    resultLogs.push(`${INDENT}${INDENT}${BAR}`);
                    showResourceCount(counter, resourceData);
                }
                clearObject(counter);
                // Meditation
                if (skillName === 'Meditation') {
                    if (subtotalManaCost) {
                        showManaCost(subtotalManaCost);
                        subtotalManaCost = 0;
                    }
                }
                // Anatomy
                if (skillName === 'Anatomy') {
                    if (Object.keys(anatomyCount).length) {
                        resultLogs.push(`${INDENT}${BAR}`);
                        showAnatomyCount(anatomyCount);
                        clearObject(anatomyCount);
                    }
                }
                continue;
            }

            // クラスレベルアップ
            const classLevel = checkMatch(body, CLASS_LEVEL_UP_REGEXP);
            if (classLevel) {
                resultLogs.push(``);
                resultLogs.push(`${BAR}`);
                resultLogs.push(`[${timeStamp}]:`);
                resultLogs.push(`${INDENT}Class level ${classLevel}.`);
                resultLogs.push(`${BAR}`);
            }
        }
    }
}

/**
 * 全集計結果の表示
 * @param {Object} setting
 * （setting.optionTakeCatch, setting.optionCraft, setting.optionSpell, setting.optionResource, setting.optionEtc）
 */
function showTotalData(setting) {

    resultLogs.push('');
    resultLogs.push('');
    resultLogs.push('======== Total Summary ========');

    for (const skillName of SKILL_ORDER) {

        if (!totalSkillCount[skillName]) continue;

        resultLogs.push(``);
        resultLogs.push(`${skillName} skill:`);

        // 集計結果の表示
        showCountData({key: skillName});

        // counterMap からスキルごとの設定値を取得
        const counter = counterMap[skillName]?.totalCounter || {};
        const showDetail = setting[counterMap[skillName]?.optionId] || false;
        const showSubDetail = setting[counterMap[skillName]?.subOptionId] || false;
        const resourceData = counterMap[skillName]?.resourceData || {};
        if (showDetail) {
            resultLogs.push(`${INDENT}${INDENT}${BAR}`);
            showLabeledCountData(counter);
        }
        if (showSubDetail) {
            resultLogs.push(`${INDENT}${INDENT}${BAR}`);
            showResourceCount(counter, resourceData);
        }
        clearObject(counter);
        // Meditation
        if (skillName === 'Meditation') {
            if (totalManaCost) {
                showManaCost(totalManaCost);
            }
        }
        // Anatomy
        if (skillName === 'Anatomy') {
            if (Object.keys(totalAnatomyCount).length) {
                resultLogs.push(`${INDENT}${BAR}`);
                showAnatomyCount(totalAnatomyCount);
            }
        }
        continue;
    }

    // Gathering以外のTaken集計（もし必要があれば）
    // showLabeledCountData(totalGatherCount);

}
