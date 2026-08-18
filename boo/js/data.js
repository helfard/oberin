/**
 * data.js
 * 　スキル一覧およびスキルごとの判定・成功・失敗のログパターン
 */

// スキル一覧
const SKILLS = [
    'Alchemy/Cleric',
    'Alchemy/Druid',
    'Anatomy',
    'Archery',
    'Blacksmithing',
    'Detecting Hidden',
    'Enchanting',
    'Fishing',
    'Healing',
    'Hiding',
    'Lockpicking',
    'Lumberjacking',
    'Magery/Cleric',
    'Magery/Druid',
    'Magery/Wizard',
    'Meditation',
    'Melee',
    'Mining',
    'Parring',
    'Poisoning',
    'Removing Traps',
    'Resisting Magic',
    'Special/Fighter',
    'Special/Ranger',
    'Special/Rogue',
    'Stealth',
    'Tailoring',
    'Taming',
    'Thinkering',
    'Tracking',
    'Woodworking',
    'Wrestling',
];

const LOGS = {
    // Alchemyは全てのクラスでまとめる
    'Alchemy': {
        // Alchemyは正規表現なのでALCHEMY_REGEXPに
        start: '',
        success: '',
        fail: ''
    },
    'Anatomy': {
        start: '',
        success: '',
        fail: ''
    },
    'Archery': {
        start: '',
        success: '',
        fail: ''
    },
    'Cooking': {
        start: 'You begin to cook the food...',
        success: 'You successfully cook the food.',
        fail: 'You fail to cook the food.'
    },
    // Blacksmithing・Tailoring・Tinkering・Woodcraftingはまとめる
    'Crafting': {
        start: 'You begin to make the item...',
        success: 'You successfully craft the item.',
        fail: 'You fail to craft the item.'
    },
    'Detecting Hidden': {
        start: '',
        success: 'Hidden creatures are revealed.',
        fail: 'No hidden creatures are detected.'
    },
    'Enchanting': {
        start: '',
        success: '',
        fail: ''
    },
    'Fishing': {
        start: 'You begin fishing...',
        success: '', // Caught:  (...)
        fail: 'You fail to catch any fish.'
    },
    'Healing': {
        start: '',
        success: 'You apply the bandages.',
        fail: 'You fail to properly apply the bandages.'
    },
    'Hiding': {
        start: '',
        success: 'You are hidden.',
        fail: 'You fail to hide.'
    },
    'Lockpicking': {
        start: '',
        success: 'You have successfully picked the lock.',
        fail: 'You fail to pick the lock.' // これは正しいか？
    },
    'Lumberjacking': {
        start: 'You start chopping the tree...',
        continue: 'You continue chopping the tree...',
        success: '',
        fail: 'You fail to harvest any logs.'
    },
    // Mageryは全てのクラスでまとめる
    'Magery': {
        start: '', // (name): * (...) *
        success: '',
        fail: 'The spell fizzles.'
    },
    'Meditation': {
        start: '',
        success: '',
        fail: ''
    },
    'Melee': {
        start: '',
        success: '',
        fail: ''
    },
    'Mining': {
        start: 'You start mining for ore...',
        continue: 'You continue mining for ore...',
        success: '',
        fail: 'You fail to mine any ore.'
    },
    'Parring': {
        start: '',
        success: '',
        fail: ''
    },
    'Poisoning': {
        start: 'You prepare the poison...',
        success: 'You successfully prepare the poison.',
        fail: 'You fail to prepare the poison.'
    },
    'Removing Traps': {
        start: 'You remove the trap...',
        success: 'You successfully remove the trap.',
        fail: 'You fail to remove the trap.'
    },
    'Resisting Magic': {
        start: '',
        success: '',
        fail: ''
    },
    'Special/Fighter': {
        start: '',
        success: '',
        fail: ''
    },
    'Special/Ranger': {
        start: '',
        success: '',
        fail: ''
    },
    'Special/Rogue': {
        start: '',
        success: '',
        fail: ''
    },
    'Stealth': {
        start: '',
        success: '',
        fail: ''
    },
    'Taming': {
        start: '',
        success: '',
        fail: ''
    },
    'Tracking': {
        start: '',
        success: '',
        fail: ''
    },
    'Wrestling': {
        start: '',
        success: '',
        fail: ''
    },
}
// Alchemy
const ALCHEMY_REGEXP = {
    start: /^You begin to mix the (.*)...$/,
    success: /^You successfully mix the (.*).$/,
    fail: /^You fail to mix the (.*).$/
}
const POTION = {
    // Cleric
    'Lesser Heal Potion': {
        manaCost: 3,
    },
    'Lesser Detoxify Potion': {
        manaCost: 3,
    },
    'Elevate Mind Potion': {
        manaCost: 6,
    },
    'Strength Potion': {
        manaCost: 9,
    },
    'Agility Potion': {
        manaCost: 12,
    },
    'Greater Heal Potion': {
        manaCost: 12,
    },
    'Greater Detoxify Potion': {
        manaCost: 18,
    },
    'Lesser Mana Potion': {
        manaCost: 9,
    },
    'Full Detoxify Potion': {
        manaCost: 18,
    },
    'Full Heal Potion': {
        manaCost: 21,
    },
    'Greater Mana Potion': {
        manaCost: 26,
    },
    // Druid
    'Nourish Potion': {
        manaCost: 5,
    },
    'Night Vision Potion': {
        manaCost: 8,
    },
    'Invisibility Potion': {
        manaCost: 12,
    },
    'Evasion Potion': {
        manaCost: 15,
    },
}
// Magery
const MAGERY_REGEXP = /^\* (?:(ber|bol|bur|clar|des|flas|pos|pur|rel|shel) ){1,4}\*$/
// Fishing
const FISH_REGEXP = /^Caught:  (.*)$/
// アイテム入手時のメッセージ
const TAKE_REGEXP = /^Taken:  ((?:(\d+) )?(.*))$/;
// 収集スキルで手に入るもの
const GATHER_STUFF = {
    'Lumberjacking': ['Log', 'Amber', '2 Ambers'],
    // 採掘はクリスタル類も落ちるけど…
    'Mining': ['Ferrite', 'Pieces of Coal', 'Black Ferrite', 'ImanaCosterfect Ferrite'],
}
// スキルレベルアップ時のメッセージ
const Skill_LEVEL_UP_MESSAGE = 'Your (skillName) skill level has increased.';
// クラスレベルアップ時のメッセージ
const CLASS_LEVEL_UP_REGEXP = /^Congratulations, your class level reached (\d+)!$/;

// 魔法一覧
const SPELL = {
    // Wizard
    '* bur *': {
        name: 'Magic Arrow',
        manaCost: 6,
    },
    '* bur pos *': {
        name: 'Poison (or Drain Mana)',
        manaCost: 18,
    },
    '* bur ber flas *': {
        name: 'Magic Trap',
        manaCost: 18,
    },
    '* shel clar ber *': {
        name: 'Magic Disarm',
        manaCost: 18,
    },
    '* flas bur *': {
        name: 'Explosion',
        manaCost: 24,
    },
    '* ber clar *': {
        name: 'SimanaCostle Mind',
        manaCost: 24,
    },
    '* clar pos *': {
        name: 'Clumsy',
        manaCost: 24,
    },
    '* clar bol *': {
        name: 'Weaken',
        manaCost: 24,
    },
    '* shel rel bol *': {
        name: 'Paralyze',
        manaCost: 24,
    },
    '* bol flas *': {
        name: 'Lightning Bolt',
        manaCost: 30,
    },
    '* clar flas bur *': {
        name: 'Fire Field',
        manaCost: 30,
    },
    /*
    '* clar pos *': {
        name: 'Drain Mana',
        manaCost: 30,
    },
    */
    '* rel pos bol *': {
        name: 'Disorient',
        manaCost: 36,
    },
    '* rel des bol *': {
        name: 'Paralyze Field',
        manaCost: 42,
    },
    '* bur pos des *': {
        name: 'Poison Field',
        manaCost: 48,
    },
    '* flas bur des *': {
        name: 'Fireball',
        manaCost: 54,
    },
    '* rel pos des *': {
        name: 'Disorient Field',
        manaCost: 60,
    },
    //Cleric
    '* pur *': {
        name: 'Lesser Heal',
        manaCost: 6,
    },
    '* shel *': {
        name: 'Lesser Detoxify',
        manaCost: 6,
    },
    '* rel *': {
        name: 'Holy Arrow',
        manaCost: 6,
    },
    '* flas rel *': {
        name: 'Radiance',
        manaCost: 16,
    },
    '* pur clar *': {
        name: 'Greater Heal',
        manaCost: 24,
    },
    '* clar shel *': {
        name: 'Greater Detoxify',
        manaCost: 24,
    },
    '* pur bur rel *': {
        name: 'Strength',
        manaCost: 24,
    },
    '* pur shel bur *': {
        name: 'Agility',
        manaCost: 24,
    },
    '* pur clar bur *': {
        name: 'Elevate Mind',
        manaCost: 24,
    },
    '* clar bur bol *': {
        name: 'Reflective Armor',
        manaCost: 30,
    },
    '* clar ber bur *': {
        name: 'Magic Reflection',
        manaCost: 30,
    },
    '* pur clar ber *': {
        name: 'Remove Curse',
        manaCost: 24,
    },
    '* pur rel flas *': {
        name: 'Smite',
        manaCost: 30,
    },
    '* clar shel des *': {
        name: 'Full Detoxify',
        manaCost: 36,
    },
    '* clar bur rel *': {
        name: 'Turn Undead',
        manaCost: 42,
    },
    '* pur clar des *': {
        name: 'Full Heal',
        manaCost: 42,
    },
    '* pur shel des *': {
        name: 'Resurrect',
        manaCost: 48,
    },
    '* flas pur rel des *': {
        name: 'Purifying Flames',
        manaCost: 54,
    },
    '* pur des *': {
        name: 'Mass Heal',
        manaCost: 60,
    },
    // Druid
    '* ber *': {
        name: 'Reveal',
        manaCost: 6,
    },
    '* pur ber *': {
        name: 'Heal Pet',
        manaCost: 22,
    },
    '* bur ber *': {
        name: 'Pacify',
        manaCost: 9,
    },
    '* ber flas *': {
        name: 'Night Vision',
        manaCost: 12,
    },
    '* clar ber *': {
        name: 'Invisibility',
        manaCost: 18,
    },
    '* pur rel ber *': {
        name: 'Create Food',
        manaCost: 24,
    },
    '* clar bur ber *': {
        name: 'Calm',
        manaCost: 24,
    },
    '* shel ber bur *': {
        name: 'Summon Pet',
        manaCost: 30,
    },
    '* pur rel shel ber *': {
        name: 'Lesser Shapeshift',
        manaCost: 60,
    },
    '* clar flas ber *': {
        name: 'Teleport',
        manaCost: 36,
    },
    '* clar shel ber *': {
        name: 'Summon Creature',
        manaCost: 42,
    },
    '* rel des ber *': {
        name: 'Provocation',
        manaCost: 48,
    },
    '* pur rel des ber *': {
        name: 'Shapeshift',
        manaCost: 76,
    },
    '* bur bol des ber *': {
        name: 'Evasion',
        manaCost: 60,
    },
    '* clar shel ber pur *': {
        name: 'Greater Summon Creature',
        manaCost: 52,
    },
    '* pur des shel ber *': {
        name: 'Greater Shapeshift',
        manaCost: 92,
    },
}