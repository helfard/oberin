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
    'Cooking',
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

// スキルごとの判定・成功・失敗のログ（文字列もしくは正規表現）
const LOG = {
    // Alchemy/Cleric, Alchemy/Druid
    'Alchemy': {
        start: /^You begin to mix the (.*)\.\.\.$/,
        success: /^You successfully mix the (.*)\.$/,
        fail: /^You fail to mix the (.*)\.$/
    },
    // Blacksmithing, Tailoring, Tinkering, Woodcrafting
    'Crafting': {
        ready: /^You remove your (.*) from your bag\.$/,
        start: 'You begin to make the item...',
        success: 'You successfully craft the item.',
        fail: 'You fail to craft the item.'
    },
    // Lumberjacking, Mining
    'Gathering': {
        success: /^Taken:  (.*)$/,
    },
    // Magery/Cleric, Magery/Druid, Magery/Wizard
    'Magery': {
        success: /^(\* (?:(?:ber|bol|bur|clar|des|flas|pos|pur|rel|shel) ){1,4}\*)$/,
        fail: 'The spell fizzles.'
    },
    // Alchemy/Cleric は Alchemy に統合
    // Alchemy/Druid は Alchemy に統合
    'Anatomy': {
        success: /^That creature appears to be (extremely weak|somewhat weak|of average strength|quite strong|very strong|unbelievably strong)$/,
        fail: ''
    },
    // 'Archery': {},
    // Blacksmithing は Crafting に統合,
    'Cooking': {
        start: 'You begin to cook the food...',
        success: 'You successfully cook the food.',
        fail: 'You fail to cook the food.'
    },
    'Detecting Hidden': {
        success: 'Hidden creatures are revealed.',
        fail: 'No hidden creatures are detected.'
    },
    'Enchanting': {
        ready: /^You free your hands\.$/,
        start: /^You begin to (?:extract (Etherite)|infuse the (crystal))\.\.\.$/,
        success: /^You successfully (?:extract (Etherite)|infuse the (crystal))\.$/,
        fail: /^You fail to (?:extract (Etherite)|infuse the (crystal))\.$/
    },
    'Fishing': {
        start: 'You begin fishing...',
        success: /^Caught:  (.*)$/,
        fail: 'You fail to catch any fish.'
    },
    'Healing': {
        success: 'You apply the bandages.',
        fail: 'You fail to properly apply the bandages.'
    },
    'Hiding': {
        success: 'You are hidden.',
        fail: 'You fail to hide.'
    },
    'Lockpicking': {
        success: 'You have successfully picked the lock.',
        fail: 'You have failed to pick the lock.'
    },
    'Lumberjacking': { 
        start: /^You (?:start|continue) chopping the tree\.\.\.$/,
    //    success は Gathering に統合,
        fail: 'You fail to harvest any logs.'
    },
    // Magery/Cleric は Magery に統合
    // Magery/Druid は Magery に統合
    // Magery/Wizard は Magery に統合
    // 'Meditation': {},
    // 'Melee': {},
    'Mining': {
        start: /^You (?:start|continue) mining for ore\.\.\.$/,
    //    success は Gathering に統合,
        fail: 'You fail to mine any ore.'
    },
    // 'Parring': {},
    'Poisoning': {
        start: '',
        success: '',
        fail: ''
    },
    'Removing Traps': {
        start: '',
        success: '',
        fail: ''
    },
    // 'Resisting Magic': {},
    // 'Special/Fighter': {},
    // 'Special/Ranger': {},
    // 'Special/Rogue': {},
    'Stealth': {
        start: '',
        success: '',
        fail: ''
    },
    // Tailoring は Crafting に統合
    'Taming': {
        // これは厳密にはTamingの経験値ではないが…
        success: 'The beast has been tamed.',
        fail: 'You fail to tame the creature.'
    },
    'Tracking': {
        fail: 'You fail to track any creature.'
    },
    // Woodcrafting は Crafting に統合
    // 'Wrestling': {},
};

// Magery (Cleric, Wizard, Druid)
const SPELL = {
    // Cleric
    '* pur *': {
        name: 'Lesser Heal',
        reagent: {
            'Ginseng': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* shel *': {
        name: 'Lesser Detoxify',
        reagent: {
            'Mandrake Root': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* rel *': {
        name: 'Holy Arrow',
        reagent: {
            'Garlic': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* flas rel *': {
        name: 'Radiance',
        reagent: {
            'Volcanic Ash': 1,
            'Garlic': 1,
        },
        manaCost: 16,
        skillName: 'Magery/Cleric'
    },
    '* pur clar *': {
        name: 'Greater Heal',
        reagent: {
            'Ginseng': 1,
            'Lotus Flower': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* clar shel *': {
        name: 'Greater Detoxify',
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur bur rel *': {
        name: 'Strength',
        reagent: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur shel bur *': {
        name: 'Agility',
        reagent: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Piece of Coal': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur clar bur *': {
        name: 'Elevate Mind',
        reagent: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Piece of Coal': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* clar bur bol *': {
        name: 'Reflective Armor',
        reagent: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Electric Eel': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* clar ber bur *': {
        name: 'Magic Reflection',
        reagent: {
            'Lotus Flower': 1,
            'Amber': 1,
            'Piece of Coal': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* pur clar ber *': {
        name: 'Remove Curse',
        reagent: {
            'Lotus Flower': 1,
            'Ginseng': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur rel flas *': {
        name: 'Smite',
        reagent: {
            'Volcanic Ash': 1,
            'Ginseng': 1,
            'Garlic': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* clar shel des *': {
        name: 'Full Detoxify',
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 36,
        skillName: 'Magery/Cleric'
    },
    '* clar bur rel *': {
        name: 'Turn Undead',
        reagent: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 42,
        skillName: 'Magery/Cleric'
    },
    '* pur clar des *': {
        name: 'Full Heal',
        reagent: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1
        },
        manaCost: 42,
        skillName: 'Magery/Cleric'
    },
    '* pur shel des *': {
        name: 'Resurrect',
        reagent: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1
        },
        manaCost: 48,
        skillName: 'Magery/Cleric'
    },
    '* flas pur rel des *': {
        name: 'Purifying Flames',
        reagent: {
            'Volcanic Ash': 1,
            'Ginseng': 1,
            'Garlic': 1,
            'Dragon Tooth': 1
        },
        manaCost: 54,
        skillName: 'Magery/Cleric'
    },
    '* pur des *': {
        name: 'Mass Heal',
        reagent: {
            'Ginseng': 3,
            'Dragon Tooth': 1
        },
        manaCost: 60,
        skillName: 'Magery/Cleric'
    },
    // Wizard
    '* bur *': {
        name: 'Magic Arrow',
        reagent: {
            'Piece of Coal': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Wizard'
    },
    '* bur pos *': {
        name: 'Poison',
        reagent: {
            'Piece of Coal': 1,
            'Poison Gland': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* bur ber flas *': {
        name: 'Magic Trap',
        reagent: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1,
            'Amber': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* shel clar ber *': {
        name: 'Magic Disarm',
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* flas bur *': {
        name: 'Explosion',
        reagent: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* ber clar *': {
        name: 'Simple Mind',
        reagent: {
            'Amber': 1,
            'Lotus Flower': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* clar pos *': {
        name: 'Clumsy',
        reagent: {
            'Lotus Flower': 1,
            'Poison Gland': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* clar bol *': {
        name: 'Weaken',
        reagent: {
            'Lotus Flower': 1,
            'Electric Eel': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* shel rel bol *': {
        name: 'Paralyze',
        reagent: {
            'Mandrake Root': 1,
            'Garlic': 1,
            'Electric Eel': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* bol flas *': {
        name: 'Lightning Bolt',
        reagent: {
            'Volcanic Ash': 1,
            'Electric Eel': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* clar flas bur *': {
        name: 'Fire Field',
        reagent: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Volcanic Ash': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* clar pos *': {
        name: 'Drain Mana',
        reagent: {
            'Lotus Flower': 1,
            'Poison Gland': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* rel pos bol *': {
        name: 'Disorient',
        reagent: {
            'Garlic': 1,
            'Poison Gland': 1,
            'Electric Eel': 1
        },
        manaCost: 36,
        skillName: 'Magery/Wizard'
    },
    '* rel des bol *': {
        name: 'Paralyze Field',
        reagent: {
            'Garlic': 1,
            'Electric Eel': 1,
            'Dragon Tooth': 1
        },
        manaCost: 42,
        skillName: 'Magery/Wizard'
    },
    '* bur pos des *': {
        name: 'Poison Field',
        reagent: {
            'Piece of Coal': 1,
            'Poison Gland': 1,
            'Dragon Tooth': 1
        },
        manaCost: 48,
        skillName: 'Magery/Wizard'
    },
    '* flas bur des *': {
        name: 'Fireball',
        reagent: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1,
            'Dragon Tooth': 1
        },
        manaCost: 54,
        skillName: 'Magery/Wizard'
    },
    '* rel pos des *': {
        name: 'Disorient Field',
        reagent: {
            'Garlic': 1,
            'Poison Gland': 1,
            'Dragon Tooth': 1
        },
        manaCost: 60,
        skillName: 'Magery/Wizard'
    },
    // Druid
    '* ber *': {
        name: 'Reveal',
        reagent: {
            'Amber': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Druid'
    },
    '* pur ber *': {
        name: 'Heal Pet',
        reagent: {
            'Ginseng': 1,
            'Amber': 1,
        },
        manaCost: 22,
        skillName: 'Magery/Druid'
    },
    '* bur ber *': {
        name: 'Pacify',
        reagent: {
            'Piece of Coal': 1,
            'Amber': 1,
        },
        manaCost: 9,
        skillName: 'Magery/Druid'
    },
    '* ber flas *': {
        name: 'Night Vision',
        reagent: {
            'Amber': 1,
            'Volcanic Ash': 1,
        },
        manaCost: 12,
        skillName: 'Magery/Druid'
    },
    '* clar ber *': {
        name: 'Invisibility',
        reagent: {
            'Lotus Flower': 1,
            'Amber': 1,
        },
        manaCost: 18,
        skillName: 'Magery/Druid'
    },
    '* pur rel ber *': {
        name: 'Create Food',
        reagent: {
            'Ginseng': 1,
            'Garlic': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Druid'
    },
    '* clar bur ber *': {
        name: 'Calm',
        reagent: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Druid'
    },
    '* shel ber bur *': {
        name: 'Summon Pet',
        reagent: {
            'Mandrake Root': 1,
            'Amber': 1,
            'Piece of Coal': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Druid'
    },
    '* pur rel shel ber *': {
        name: 'Lesser Shapeshift',
        reagent: {
            'Ginseng': 1,
            'Garlic': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 60,
        skillName: 'Magery/Druid'
    },
    '* clar flas ber *': {
        name: 'Teleport',
        reagent: {
            'Lotus Flower': 1,
            'Volcanic Ash': 1,
            'Amber': 1,
        },
        manaCost: 36,
        skillName: 'Magery/Druid'
    },
    '* clar shel ber *': {
        name: 'Summon Creature',
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 42,
        skillName: 'Magery/Druid'
    },
    '* rel des ber *': {
        name: 'Provocation',
        reagent: {
            'Garlic': 1,
            'Dragon Tooth': 1,
            'Amber': 1,
        },
        manaCost: 48,
        skillName: 'Magery/Druid'
    },
    '* pur rel des ber *': {
        name: 'Shapeshift',
        reagent: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1,
            'Garlic': 1,
        },
        manaCost: 76,
        skillName: 'Magery/Druid'
    },
    '* bur bol des ber *': {
        name: 'Evasion',
        reagent: {
            'Piece of Coal': 1,
            'Electric Eel': 1,
            'Dragon Tooth': 1,
            'Amber': 1,
        },
        manaCost: 60,
        skillName: 'Magery/Druid'
    },
    '* clar shel ber pur *': {
        name: 'Greater Summon Creature',
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
            'Ginseng': 1,
        },
        manaCost: 52,
        skillName: 'Magery/Druid'
    },
    '* pur des shel ber *': {
        name: 'Greater Shapeshift',
        reagent: {
            'Ginseng': 1,
            'Dragon Tooth': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 92,
        skillName: 'Magery/Druid'
    },
}

// Alchemy (Clecic, Druid)
const POTION = {
    // Cleric
    'Lesser Heal Potion': {
        reagent: {
            'Ginseng': 1,
        },
        manaCost: 3,
        skillName: 'Alchemy/Cleric'
    },
    'Lesser Detoxify Potion': {
        reagent: {
            'Mandrake Root': 1,
        },
        manaCost: 3,
        skillName: 'Alchemy/Cleric'
    },
    'Elevate Mind Potion': {
        reagent: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Ginseng': 1,
        },
        manaCost: 6,
        skillName: 'Alchemy/Cleric'
    },
    'Strength Potion': {
        reagent: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 9,
        skillName: 'Alchemy/Cleric'
    },
    'Agility Potion': {
        reagent: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Mandrake Root': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Heal Potion': {
        reagent: {
            'Ginseng': 1,
            'Lotus Flower': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Detoxify Potion': {
        reagent: {
            'Mandrake Root': 1,
            'Lotus Flower': 1,
        },
        manaCost: 18,
        skillName: 'Alchemy/Cleric'
    },
    'Lesser Mana Potion': {
        reagent: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Mandrake Root': 1,
        },
        manaCost: 9,
        skillName: 'Alchemy/Cleric'
    },
    'Full Detoxify Potion': {
        reagent: {
            'Mandrake Root': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 18,
        skillName: 'Alchemy/Cleric'
    },
    'Full Heal Potion': {
        reagent: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 21,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Mana Potion': {
        reagent: {
            'Ginseng': 3,
            'Piece of Coal': 3,
            'Mandrake Root': 3,
        },
        manaCost: 26,
        skillName: 'Alchemy/Cleric'
    },
    // Druid
    'Nourish Potion': {
        reagent: {
            'Piece of Coal': 1,
            'Lotus Flower': 1,
            'Garlic': 1,
        },
        manaCost: 5,
        skillName: 'Alchemy/Druid'
    },
    'Night Vision Potion': {
        reagent: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 8,
        skillName: 'Alchemy/Druid'
    },
    'Invisibility Potion': {
        reagent: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Druid'
    },
    'Evasion Potion': {
        reagent: {
            'Amber': 1,
            'Electric Eel': 1,
            'Piece of Coal': 1,
        },
        manaCost: 15,
        skillName: 'Alchemy/Druid'
    },
}

// Gathering (Lumberjacking, Mining)
const GATHER_STUFF = {
    'Lumberjacking': [
        'Log',
        'Amber',
        '2 Logs', // Dwarven Hand Axe
        '2 Ambers' // Dwarven Hand Axe
    ],
    'Mining': [
        'Ferrite',
        'Pieces of Coal',
        'Black Ferrite',
        'ImanaCosterfect Ferrite',
        'Red Crystal',
        'Green Crystal',
        'Purple Crystal',
        'Blue Crystal',
        'Orange Crystal',
        'Black Crystal',
        'Yellow Crystal',
        'Fire Crystal', // 本当に掘れるか？
        'Ice Crystal', // 本当に掘れるか？
        'Zionidic Crystal', // 本当に掘れるか？
    ],
}

// スキルレベルアップ時のメッセージ
const SKILL_LEVEL_UP_REGEXP = /^Your (.*) skill level has increased\.$/;
// クラスレベルアップ時のメッセージ
const CLASS_LEVEL_UP_REGEXP = /^Congratulations, your class level reached (\d+)!$/;
