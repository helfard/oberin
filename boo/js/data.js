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
    'Tinkering',
    'Tracking',
    'Woodcrafting',
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
    // Blacksmithing, Tailoring, Tinkering, Woodcrafting, Enchanting/Craft
    'Crafting': {
        ready: /^You remove your (.*) from your bag\.$/,
        start: /^You begin to make (?:a|the) (.*)\.\.\.$/,
        success: /^You successfully craft (?:a|the) (.*)\.$/,
        fail: /You fail to craft (?:a|the) (.*)\./
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
        // Anatomyはパッシブになっておりこのログは経験値に影響しない
        success: /^That creature appears to be (extremely weak|somewhat weak|of average strength|quite strong|very strong|unbelievably strong)\.$/,
        fail: 'You are unable to determine anything useful.'
    },
    // 'Archery': {},
    // Blacksmithing は Crafting に統合,
    'Cooking': {
    //    start: 'You begin to cook the food...',
        success: 'You successfully cook the food.',
        fail: 'You fail to cook the food.'
    },
    'Detecting Hidden': {
        success: 'Hidden creatures are revealed.',
        fail: 'No hidden creatures are detected.'
    },
    'Enchanting': {
        ready: /^You free your hands\.$/,
    //    start: /^You begin to (?:extract (Etherite)|infuse the (crystal))\.\.\.$/,
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

// Gathering (Lumberjacking, Mining)
const GATHER = {
    'Log'               : { skillName: 'Lumberjacking' },
    'Amber'             : { skillName: 'Lumberjacking' },
    '2 Logs'            : { skillName: 'Lumberjacking' }, // Dwarven Hand Axe
    '2 Ambers'          : { skillName: 'Lumberjacking' }, // Dwarven Hand Axe
    'Ferrite'           : { skillName: 'Mining' },
    'Pieces of Coal'    : { skillName: 'Mining' },
    'Black Ferrite'     : { skillName: 'Mining' },
    'Imperfect Ferrite' : { skillName: 'Mining' },
    'Red Crystal'       : { skillName: 'Mining' },
    'Green Crystal'     : { skillName: 'Mining' },
    'Purple Crystal'    : { skillName: 'Mining' },
    'Blue Crystal'      : { skillName: 'Mining' },
    'Orange Crystal'    : { skillName: 'Mining' },
    'Black Crystal'     : { skillName: 'Mining' },
    'Yellow Crystal'    : { skillName: 'Mining' },
    'Fire Crystal'      : { skillName: 'Mining' }, // 本当に掘れるか？
    'Ice Crystal'       : { skillName: 'Mining' }, // 本当に掘れるか？
    'Zionidic Crystal'  : { skillName: 'Mining' }, // 本当に掘れるか？
}

// Alchemy (Clecic, Druid)
const POTION = {
    // Cleric
    'Lesser Heal Potion': {
        resource: {
            'Ginseng': 1,
        },
        manaCost: 3,
        skillName: 'Alchemy/Cleric'
    },
    'Lesser Detoxify Potion': {
        resource: {
            'Mandrake Root': 1,
        },
        manaCost: 3,
        skillName: 'Alchemy/Cleric'
    },
    'Elevate Mind Potion': {
        resource: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Ginseng': 1,
        },
        manaCost: 6,
        skillName: 'Alchemy/Cleric'
    },
    'Strength Potion': {
        resource: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 9,
        skillName: 'Alchemy/Cleric'
    },
    'Agility Potion': {
        resource: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Mandrake Root': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Heal Potion': {
        resource: {
            'Ginseng': 1,
            'Lotus Flower': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Detoxify Potion': {
        resource: {
            'Mandrake Root': 1,
            'Lotus Flower': 1,
        },
        manaCost: 18,
        skillName: 'Alchemy/Cleric'
    },
    'Lesser Mana Potion': {
        resource: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Mandrake Root': 1,
        },
        manaCost: 9,
        skillName: 'Alchemy/Cleric'
    },
    'Full Detoxify Potion': {
        resource: {
            'Mandrake Root': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 18,
        skillName: 'Alchemy/Cleric'
    },
    'Full Heal Potion': {
        resource: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 21,
        skillName: 'Alchemy/Cleric'
    },
    'Greater Mana Potion': {
        resource: {
            'Ginseng': 3,
            'Piece of Coal': 3,
            'Mandrake Root': 3,
        },
        manaCost: 26,
        skillName: 'Alchemy/Cleric'
    },
    // Druid
    'Nourish Potion': {
        resource: {
            'Piece of Coal': 1,
            'Lotus Flower': 1,
            'Garlic': 1,
        },
        manaCost: 5,
        skillName: 'Alchemy/Druid'
    },
    'Night Vision Potion': {
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 8,
        skillName: 'Alchemy/Druid'
    },
    'Invisibility Potion': {
        resource: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 12,
        skillName: 'Alchemy/Druid'
    },
    'Evasion Potion': {
        resource: {
            'Amber': 1,
            'Electric Eel': 1,
            'Piece of Coal': 1,
        },
        manaCost: 15,
        skillName: 'Alchemy/Druid'
    },
}

// Magery (Cleric, Wizard, Druid)
const SPELL = {
    // Wizard
    '* bur *': {
        spellName: 'Magic Arrow',
        resource: {
            'Piece of Coal': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Wizard'
    },
    '* bur pos *': {
        spellName: 'Poison',
        resource: {
            'Piece of Coal': 1,
            'Poison Gland': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* bur ber flas *': {
        spellName: 'Magic Trap',
        resource: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1,
            'Amber': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* shel clar ber *': {
        spellName: 'Magic Disarm',
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1
        },
        manaCost: 18,
        skillName: 'Magery/Wizard'
    },
    '* flas bur *': {
        spellName: 'Explosion',
        resource: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* ber clar *': {
        spellName: 'Simple Mind',
        resource: {
            'Amber': 1,
            'Lotus Flower': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* clar pos *': {
        spellName: 'Clumsy',
        resource: {
            'Lotus Flower': 1,
            'Poison Gland': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* clar bol *': {
        spellName: 'Weaken',
        resource: {
            'Lotus Flower': 1,
            'Electric Eel': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* shel rel bol *': {
        spellName: 'Paralyze',
        resource: {
            'Mandrake Root': 1,
            'Garlic': 1,
            'Electric Eel': 1
        },
        manaCost: 24,
        skillName: 'Magery/Wizard'
    },
    '* bol flas *': {
        spellName: 'Lightning Bolt',
        resource: {
            'Volcanic Ash': 1,
            'Electric Eel': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* clar flas bur *': {
        spellName: 'Fire Field',
        resource: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Volcanic Ash': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* clar pos *': {
        spellName: 'Drain Mana',
        resource: {
            'Lotus Flower': 1,
            'Poison Gland': 1
        },
        manaCost: 30,
        skillName: 'Magery/Wizard'
    },
    '* rel pos bol *': {
        spellName: 'Disorient',
        resource: {
            'Garlic': 1,
            'Poison Gland': 1,
            'Electric Eel': 1
        },
        manaCost: 36,
        skillName: 'Magery/Wizard'
    },
    '* rel des bol *': {
        spellName: 'Paralyze Field',
        resource: {
            'Garlic': 1,
            'Electric Eel': 1,
            'Dragon Tooth': 1
        },
        manaCost: 42,
        skillName: 'Magery/Wizard'
    },
    '* bur pos des *': {
        spellName: 'Poison Field',
        resource: {
            'Piece of Coal': 1,
            'Poison Gland': 1,
            'Dragon Tooth': 1
        },
        manaCost: 48,
        skillName: 'Magery/Wizard'
    },
    '* flas bur des *': {
        spellName: 'Fireball',
        resource: {
            'Piece of Coal': 1,
            'Volcanic Ash': 1,
            'Dragon Tooth': 1
        },
        manaCost: 54,
        skillName: 'Magery/Wizard'
    },
    '* rel pos des *': {
        spellName: 'Disorient Field',
        resource: {
            'Garlic': 1,
            'Poison Gland': 1,
            'Dragon Tooth': 1
        },
        manaCost: 60,
        skillName: 'Magery/Wizard'
    },
    // Cleric
    '* pur *': {
        spellName: 'Lesser Heal',
        resource: {
            'Ginseng': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* shel *': {
        spellName: 'Lesser Detoxify',
        resource: {
            'Mandrake Root': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* rel *': {
        spellName: 'Holy Arrow',
        resource: {
            'Garlic': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Cleric'
    },
    '* flas rel *': {
        spellName: 'Radiance',
        resource: {
            'Volcanic Ash': 1,
            'Garlic': 1,
        },
        manaCost: 16,
        skillName: 'Magery/Cleric'
    },
    '* pur clar *': {
        spellName: 'Greater Heal',
        resource: {
            'Ginseng': 1,
            'Lotus Flower': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* clar shel *': {
        spellName: 'Greater Detoxify',
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur bur rel *': {
        spellName: 'Strength',
        resource: {
            'Ginseng': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur shel bur *': {
        spellName: 'Agility',
        resource: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Piece of Coal': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur clar bur *': {
        spellName: 'Elevate Mind',
        resource: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Piece of Coal': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* clar bur bol *': {
        spellName: 'Reflective Armor',
        resource: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Electric Eel': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* clar ber bur *': {
        spellName: 'Magic Reflection',
        resource: {
            'Lotus Flower': 1,
            'Amber': 1,
            'Piece of Coal': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* pur clar ber *': {
        spellName: 'Remove Curse',
        resource: {
            'Lotus Flower': 1,
            'Ginseng': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Cleric'
    },
    '* pur rel flas *': {
        spellName: 'Smite',
        resource: {
            'Volcanic Ash': 1,
            'Ginseng': 1,
            'Garlic': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Cleric'
    },
    '* clar shel des *': {
        spellName: 'Full Detoxify',
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1,
        },
        manaCost: 36,
        skillName: 'Magery/Cleric'
    },
    '* clar bur rel *': {
        spellName: 'Turn Undead',
        resource: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Garlic': 1,
        },
        manaCost: 42,
        skillName: 'Magery/Cleric'
    },
    '* pur clar des *': {
        spellName: 'Full Heal',
        resource: {
            'Ginseng': 1,
            'Lotus Flower': 1,
            'Dragon Tooth': 1
        },
        manaCost: 42,
        skillName: 'Magery/Cleric'
    },
    '* pur shel des *': {
        spellName: 'Resurrect',
        resource: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1
        },
        manaCost: 48,
        skillName: 'Magery/Cleric'
    },
    '* flas pur rel des *': {
        spellName: 'Purifying Flames',
        resource: {
            'Volcanic Ash': 1,
            'Ginseng': 1,
            'Garlic': 1,
            'Dragon Tooth': 1
        },
        manaCost: 54,
        skillName: 'Magery/Cleric'
    },
    '* pur des *': {
        spellName: 'Mass Heal',
        resource: {
            'Ginseng': 3,
            'Dragon Tooth': 1
        },
        manaCost: 60,
        skillName: 'Magery/Cleric'
    },
    // Druid
    '* ber *': {
        spellName: 'Reveal',
        resource: {
            'Amber': 1,
        },
        manaCost: 6,
        skillName: 'Magery/Druid'
    },
    '* pur ber *': {
        spellName: 'Heal Pet',
        resource: {
            'Ginseng': 1,
            'Amber': 1,
        },
        manaCost: 22,
        skillName: 'Magery/Druid'
    },
    '* bur ber *': {
        spellName: 'Pacify',
        resource: {
            'Piece of Coal': 1,
            'Amber': 1,
        },
        manaCost: 9,
        skillName: 'Magery/Druid'
    },
    '* ber flas *': {
        spellName: 'Night Vision',
        resource: {
            'Amber': 1,
            'Volcanic Ash': 1,
        },
        manaCost: 12,
        skillName: 'Magery/Druid'
    },
    '* clar ber *': {
        spellName: 'Invisibility',
        resource: {
            'Lotus Flower': 1,
            'Amber': 1,
        },
        manaCost: 18,
        skillName: 'Magery/Druid'
    },
    '* pur rel ber *': {
        spellName: 'Create Food',
        resource: {
            'Ginseng': 1,
            'Garlic': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Druid'
    },
    '* clar bur ber *': {
        spellName: 'Calm',
        resource: {
            'Lotus Flower': 1,
            'Piece of Coal': 1,
            'Amber': 1,
        },
        manaCost: 24,
        skillName: 'Magery/Druid'
    },
    '* shel ber bur *': {
        spellName: 'Summon Pet',
        resource: {
            'Mandrake Root': 1,
            'Amber': 1,
            'Piece of Coal': 1,
        },
        manaCost: 30,
        skillName: 'Magery/Druid'
    },
    '* pur rel shel ber *': {
        spellName: 'Lesser Shapeshift',
        resource: {
            'Ginseng': 1,
            'Garlic': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 60,
        skillName: 'Magery/Druid'
    },
    '* clar flas ber *': {
        spellName: 'Teleport',
        resource: {
            'Lotus Flower': 1,
            'Volcanic Ash': 1,
            'Amber': 1,
        },
        manaCost: 36,
        skillName: 'Magery/Druid'
    },
    '* clar shel ber *': {
        spellName: 'Summon Creature',
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 42,
        skillName: 'Magery/Druid'
    },
    '* rel des ber *': {
        spellName: 'Provocation',
        resource: {
            'Garlic': 1,
            'Dragon Tooth': 1,
            'Amber': 1,
        },
        manaCost: 48,
        skillName: 'Magery/Druid'
    },
    '* pur rel des ber *': {
        spellName: 'Shapeshift',
        resource: {
            'Ginseng': 1,
            'Mandrake Root': 1,
            'Dragon Tooth': 1,
            'Garlic': 1,
        },
        manaCost: 76,
        skillName: 'Magery/Druid'
    },
    '* bur bol des ber *': {
        spellName: 'Evasion',
        resource: {
            'Piece of Coal': 1,
            'Electric Eel': 1,
            'Dragon Tooth': 1,
            'Amber': 1,
        },
        manaCost: 60,
        skillName: 'Magery/Druid'
    },
    '* clar shel ber pur *': {
        spellName: 'Greater Summon Creature',
        resource: {
            'Lotus Flower': 1,
            'Mandrake Root': 1,
            'Amber': 1,
            'Ginseng': 1,
        },
        manaCost: 52,
        skillName: 'Magery/Druid'
    },
    '* pur des shel ber *': {
        spellName: 'Greater Shapeshift',
        resource: {
            'Ginseng': 1,
            'Dragon Tooth': 1,
            'Mandrake Root': 1,
            'Amber': 1,
        },
        manaCost: 92,
        skillName: 'Magery/Druid'
    },
}

// Crafting（Blacksmithing, Tailoring, Tinkering, Woodcrafting, Enchanting/Craft）
const CRAFT = {
    // Blacksmithing/Weapon
    'Dagger': {
        level: 1,
        resource: {
            'Board': 1,
            'Ingot': 1,
        },
        skillName: 'Blacksmithing',
    },
    'Broadsword': {
        level: 2,
        resource: {
            'Board': 1,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Spear': {
        level: 3,
        resource: {
            'Board': 2,
            'Ingot': 1,
        },
        skillName: 'Blacksmithing',
    },
    'Flail': {
        level: 4,
        resource: {
            'Board': 1,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Mace': {
        level: 4,
        resource: {
            'Board': 1,
            'Ingot': 1,
        },
        skillName: 'Blacksmithing',
    },
    'Katana': {
        level: 5,
        resource: {
            'Board': 1,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Scimitar': {
        level: 5,
        resource: {
            'Board': 1,
            'Ingot': 3,
        },
        skillName: 'Blacksmithing',
    },
    'War Hammer': {
        level: 5,
        resource: {
            'Board': 1,
            'Ingot': 1,
        },
        skillName: 'Blacksmithing',
    },
    'Sickle': {
        level: 6,
        resource: {
            'Board': 2,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Long Sword': {
        level: 7,
        resource: {
            'Board': 1,
            'Ingot': 4,
        },
        skillName: 'Blacksmithing',
    },
    'Battle Axe': {
        level: 8,
        resource: {
            'Board': 1,
            'Ingot': 3,
        },
        skillName: 'Blacksmithing',
    },
    'Glaive': {
        level: 8,
        resource: {
            'Board': 2,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Dagger of Durability': {
        level: 10,
        resource: {
            'Dagger': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Broadsword of Durability': {
        level: 10,
        resource: {
            'Broadsword': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Spear of Durability': {
        level: 10,
        resource: {
            'Spear': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Flail of Durability': {
        level: 10,
        resource: {
            'Flail': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Mace of Durability': {
        level: 10,
        resource: {
            'Mace': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Katana of Durability': {
        level: 10,
        resource: {
            'Katana': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Scimitar of Durability': {
        level: 10,
        resource: {
            'Scimitar': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'War Hammer of Durability': {
        level: 10,
        resource: {
            'War Hammer': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Sickle of Durability': {
        level: 10,
        resource: {
            'Sickle': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Long Sword of Durability': {
        level: 10,
        resource: {
            'Long Sword': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Battle Axe of Durability': {
        level: 10,
        resource: {
            'Battle Axe': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Glaive of Durability': {
        level: 10,
        resource: {
            'Glaive': 1,
            'Essence of Durability': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Dagger of Power': {
        level: 11,
        resource: {
            'Dagger': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Broadsword of Power': {
        level: 11,
        resource: {
            'Broadsword': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Spear of Power': {
        level: 11,
        resource: {
            'Spear': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Flail of Power': {
        level: 11,
        resource: {
            'Flail': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Mace of Power': {
        level: 11,
        resource: {
            'Mace': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Katana of Power': {
        level: 11,
        resource: {
            'Katana': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Scimitar of Power': {
        level: 11,
        resource: {
            'Scimitar': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'War Hammer of Power': {
        level: 11,
        resource: {
            'War Hammer': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Sickle of Power': {
        level: 11,
        resource: {
            'Sickle': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Long Sword of Power': {
        level: 11,
        resource: {
            'Long Sword': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Battle Axe of Power': {
        level: 11,
        resource: {
            'Battle Axe': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Glaive of Power': {
        level: 11,
        resource: {
            'Glaive': 1,
            'Essence of Power': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Dagger of Speed': {
        level: 12,
        resource: {
            'Dagger': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Broadsword of Speed': {
        level: 12,
        resource: {
            'Broadsword': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Spear of Speed': {
        level: 12,
        resource: {
            'Spear': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Flail of Speed': {
        level: 12,
        resource: {
            'Flail': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Mace of Speed': {
        level: 12,
        resource: {
            'Mace': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Katana of Speed': {
        level: 12,
        resource: {
            'Katana': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Scimitar of Speed': {
        level: 12,
        resource: {
            'Scimitar': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'War Hammer of Speed': {
        level: 12,
        resource: {
            'War Hammer': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Sickle of Speed': {
        level: 12,
        resource: {
            'Sickle': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Long Sword of Speed': {
        level: 12,
        resource: {
            'Long Sword': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Battle Axe of Speed': {
        level: 12,
        resource: {
            'Battle Axe': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Glaive of Speed': {
        level: 12,
        resource: {
            'Glaive': 1,
            'Essence of Speed': 1,
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    // Blacksmithing/Armer
    'Chain Mail Coif': {
        level: 3,
        resource: {
            'Ingot': 4,
        },
        skillName: 'Blacksmithing',
    },
    'Chain Mail Arms': {
        level: 4,
        resource: {
            'Ingot': 6,
        },
        skillName: 'Blacksmithing',
    },
    'Chain Mail Legs': {
        level: 4,
        resource: {
            'Ingot': 6,
        },
        skillName: 'Blacksmithing',
    },
    'Chain Mail Gloves': {
        level: 5,
        resource: {
            'Ingot': 3,
        },
        skillName: 'Blacksmithing',
    },
    'Metal Shield': {
        level: 5,
        resource: {
            'Ingot': 5,
        },
        skillName: 'Blacksmithing',
    },
    'Open Plate Helmet': {
        level: 5,
        resource: {
            'Ingot': 6,
        },
        skillName: 'Blacksmithing',
    },
    'Slotted Plate Helmet': {
        level: 5,
        resource: {
            'Ingot': 8,
        },
        skillName: 'Blacksmithing',
    },
    'Viking Helmet': {
        level: 5,
        resource: {
            'Ingot': 7,
        },
        skillName: 'Blacksmithing',
    },
    'Chain Breast': {
        level: 6,
        resource: {
            'Ingot': 9,
        },
        skillName: 'Blacksmithing',
    },
    'Closed Plate Helmet': {
        level: 6,
        resource: {
            'Ingot': 10,
        },
        skillName: 'Blacksmithing',
    },
    'Plate Arms': {
        level: 7,
        resource: {
            'Ingot': 8,
        },
        skillName: 'Blacksmithing',
    },
    'Plate Gauntlets': {
        level: 7,
        resource: {
            'Ingot': 4,
        },
        skillName: 'Blacksmithing',
    },
    'Plate Legs': {
        level: 7,
        resource: {
            'Ingot': 8,
        },
        skillName: 'Blacksmithing',
    },
    'Plate Breast': {
        level: 8,
        resource: {
            'Ingot': 12,
        },
        skillName: 'Blacksmithing',
    },
    'Black Open Plate Helmet': {
        level: 9,
        resource: {
            'Black Ingot': 12,
        },
        skillName: 'Blacksmithing',
    },
    'Black Plate Gauntlets': {
        level: 9,
        resource: {
            'Black Ingot': 9,
        },
        skillName: 'Blacksmithing',
    },
    'Black Slotted Plate Helmet': {
        level: 9,
        resource: {
            'Black Ingot': 12,
        },
        skillName: 'Blacksmithing',
    },
    'Black Closed Plate Helmet': {
        level: 10,
        resource: {
            'Black Ingot': 12,
        },
        skillName: 'Blacksmithing',
    },
    'Black Plate Arms': {
        level: 11,
        resource: {
            'Black Ingot': 16,
        },
        skillName: 'Blacksmithing',
    },
    'Black Viking Helmet': {
        level: 11,
        resource: {
            'Black Ingot': 13,
        },
        skillName: 'Blacksmithing',
    },
    'Black Plate Legs': {
        level: 12,
        resource: {
            'Black Ingot': 18,
        },
        skillName: 'Blacksmithing',
    },
    'Black Metal Shield': {
        level: 13,
        resource: {
            'Black Ingot': 20,
        },
        skillName: 'Blacksmithing',
    },
    'Black Plate Breast': {
        level: 13,
        resource: {
            'Black Ingot': 20,
        },
        skillName: 'Blacksmithing',
    },
    // Blacksmithing/Miscellaneous
    '3 Ingots': {
        level: 1,
        resource: {
            'Ferrite': 1,
        },
        skillName: 'Blacksmithing',
    },
    '3 Black Ingots': {
        level: 1,
        resource: {
            'Black Ferrite': 1,
        },
        skillName: 'Blacksmithing',
    },
    // Blacksmithing/Tool
    'Blacksmigh Hammer': {
        level: 1,
        resource: {
            'Board': 1,
            'Ingot': 2,
            'Pach of Nails': 1,
        },
        skillName: 'Blacksmithing',
    },
    'Hand Axe': {
        level: 1,
        resource: {
            'Board': 1,
            'Ingot': 2,
        },
        skillName: 'Blacksmithing',
    },
    'Mining Axe': {
        level: 1,
        resource: {
            'Board': 1,
            'Ingot': 2,
            'Pach of Nails': 1,
        },
        skillName: 'Blacksmithing',
    },
    // Woodcrafting
    '3 Boards': {
        level: 1,
        resource: {
            'Log': 1,
        },
        skillName: 'Woodcrafting',
    },
    'Bundle of Kindling': {
        level: 1,
        resource: {
            'Log': 1,
        },
        skillName: 'Woodcrafting',
    },
    'Fishing Pole': {
        level: 2,
        resource: {
            'Boards': 2,
            'Pack of Nails': 1,
            'Ingot': 1,
        },
        skillName: 'Woodcrafting',
    },
    'Club': {
        level: 3,
        resource: {
            'Boards': 2,
        },
        skillName: 'Woodcrafting',
    },
    'Stave': {
        level: 4,
        resource: {
            'Boards': 2,
        },
        skillName: 'Woodcrafting',
    },
    '20 Shafts': {
        level: 5,
        resource: {
            'Board': 1,
        },
        skillName: 'Woodcrafting',
    },
    '20 Arrows': {
        level: 5,
        resource: {
            'Shaft': 1,
            'Feather': 1,
        },
        skillName: 'Woodcrafting',
    },
    'Wooden Shield': {
        level: 5,
        resource: {
            'Board': 5,
            'Ingot': 1,
            'Pack of Nails': 1,
        },
        skillName: 'Woodcrafting',
    },
    'Short Bow': {
        level: 5,
        resource: {
            'Boards': 2,
        },
        skillName: 'Woodcrafting',
    },
    'Long Bow': {
        level: 6,
        resource: {
            'Boards': 4,
        },
        skillName: 'Woodcrafting',
    },
    'Raft': {
        level: 8,
        resource: {
            'Logs': 8,
            'Packs of Nails': 3,
        },
        skillName: 'Woodcrafting',
    },
    'Club of Durability': {
        level: 9,
        resource: {
            'Club or Stave': 1,
            'Essence of Durability': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Stave of Durability': {
        level: 9,
        resource: {
            'Club or Stave': 1,
            'Essence of Durability': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Short Bow of Durability': {
        level: 10,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Durability': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
     'Long Bow of Durability': {
        level: 10,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Durability': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Short Bow of Power': {
        level: 11,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Power': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Long Bow of Power': {
        level: 11,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Power': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Short Bow of Speed': {
        level: 12,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Speed': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    'Long Bow of Speed': {
        level: 12,
        resource: {
            'Short Bow or Long Bow': 1,
            'Essence of Speed': 1,
            'Boards': 5,
        },
        skillName: 'Woodcrafting',
    },
    // Tinkering
    'Set of Woodworking Tools': {
        level: 1,
        resource: {
            'Pach of Nails': 1,
            'Boards': 1,
            'Ingot': 1,
        },
        skillName: 'Tinkering',
    },
    'Set of Tinkering Tools': {
        level: 2,
        resource: {
            'Pach of Nails': 1,
            'Boards': 1,
            'Ingot': 1,
        },
        skillName: 'Tinkering',
    },
    'Shears': {
        level: 3,
        resource: {
            'Ingot': 1,
        },
        skillName: 'Tinkering',
    },
    'Sextant': {
        level: 3,
        resource: {
            'Pach of Nails': 1,
            'Ingot': 1,
        },
        skillName: 'Tinkering',
    },
    'Trap': {
        level: 5,
        resource: {
            'Pach of Nails': 1,
            'Ingot': 1,
            'Volcanic Ash': 2,
        },
        manaCost: 3,
        skillName: 'Tinkering',
    },
    // Tailoring
    '10 Bandages': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
        },
        skillName: 'Tailoring',
    },
    'Roll of Cloth': {
        level: 1,
        resource: {
            'Bundles of Wool': 3,
        },
        skillName: 'Tailoring',
    },
    'Leather Belt': {
        level: 1,
        resource: {
            'Leather Hide': 1,
        },
        skillName: 'Tailoring',
    },
    'Gray Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Shirt': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Gray Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Pair of Pants': {
        level: 2,
        resource: {
            'Roll of Cloth': 1,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Gray Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Robe': {
        level: 3,
        resource: {
            'Rolls of Cloth': 2,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Gray Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Wizard Hat': {
        level: 3,
        resource: {
            'Enchanted Cloth': 2,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Gray Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Light Blue Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Red Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Blue Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Brown Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Black Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Green Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Purple Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Pair of Yellow Boots': {
        level: 4,
        resource: {
            'Leather Hide': 1,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Leather Arms': {
        level: 4,
        resource: {
            'Leather Hides': 3,
        },
        skillName: 'Tailoring',
    },
    'Leather Legs': {
        level: 5,
        resource: {
            'Leather Hides': 3,
        },
        skillName: 'Tailoring',
    },
    'Black / Yellow Leather Arms': {
        level: 6,
        resource: {
            'Leather Hides': 3,
            'Rolls of Cloth': 2,
            'Black or Yellow Dye': 3,
        },
        skillName: 'Tailoring',
    },
    'Jester Hat': {
        level: 6,
        resource: {
            'Rolls of cloth': 1,
            'dye': 1,
        },
        skillName: 'Tailoring',
    },
    '2 Leather Hides': {
        level: 6,
        resource: {
            'Bear Skin': 1,
        },
        skillName: 'Tailoring',
    },
    'Leather Breast': {
        level: 6,
        resource: {
            'Leather Hides': 3,
        },
        skillName: 'Tailoring',
    },
    'Black / Yellow Leather Legs': {
        level: 7,
        resource: {
            'Leather Hides': 3,
            'Rolls of Cloth': 4,
            'Black or Yellow Dye': 4,
        },
        skillName: 'Tailoring',
    },
    'Black / Yellow Leather Breast': {
        level: 8,
        resource: {
            'Leather Hides': 3,
            'Rolls of Cloth': 6,
            'Black or Yellow Dye': 5,
        },
        skillName: 'Tailoring',
    },
    'Gray Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Robe of Resistance': {
        level: 11,
        resource: {
            'Enchanted Cloth': 3,
            'Nevia Flower': 1,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Gray Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
        },
        skillName: 'Tailoring',
    },
    'Light Blue Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Light Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Red Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Red Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Blue Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Blue Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Brown Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Brown Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Black Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Black Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Green Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Purple Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Purple Dye': 1,
        },
        skillName: 'Tailoring',
    },
    'Yellow Robe of Protection': {
        level: 12,
        resource: {
            'Enchanted Cloth': 3,
            'Merfolk Hair': 1,
            'Bottle of Yellow Dye': 1,
        },
        skillName: 'Tailoring',
    },
    // Enchanting/Etherite
    // Etheriteは色々あるけどログでは判別できないようだ
    'Etherite': {
        level: 1,
        manaCost: 3,
        skillName: 'Enchanting',
    },
    // Enchanting/Crystal
    // Crystalは色々あるけどログでは判別できないようだ
    'Crystal': {
        level: 1,
        skillName: 'Enchanting',
    },
    // 一応データは用意しておく
    'Infused Green Crystal': {
        level: 1,
        resource: {
            'Green Crystal': 1,
            'Etherite': 10,
        },
        manaCost: 3,
        skillName: 'Enchanting',
    },
    'Infused Red Crystal': {
        level: 2,
        resource: {
            'Red Crystal': 1,
            'Etherite': 20,
        },
        manaCost: 6,
        skillName: 'Enchanting',
    },
    'Infused Blue Crystal': {
        level: 2,
        resource: {
            'Blue Crystal': 1,
            'Etherite': 20,
        },
        manaCost: 6,
        skillName: 'Enchanting',
    },
    'Infused Yellow Crystal': {
        level: 3,
        resource: {
            'Yellow Crystal': 1,
            'Etherite': 30,
        },
        manaCost: 9,
        skillName: 'Enchanting',
    },
    'Infused Orange Crystal': {
        level: 3,
        resource: {
            'Orange Crystal': 1,
            'Etherite': 30,
        },
        manaCost: 9,
        skillName: 'Enchanting',
    },
    'Infused Purple Crystal': {
        level: 4,
        resource: {
            'Purple Crystal': 1,
            'Etherite': 40,
        },
        manaCost: 12,
        skillName: 'Enchanting',
    },
    'Infused Black Crystal': {
        level: 5,
        resource: {
            'Black Crystal': 1,
            'Etherite': 50,
        },
        manaCost: 15,
        skillName: 'Enchanting',
    },
    'Infused Pure Green Crystal': {
        level: 6,
        resource: {
            'Pure Green Crystal': 1,
            'Etherite': 60,
        },
        manaCost: 18,
        skillName: 'Enchanting',
    },
    'Infused Pure Red Crystal': {
        level: 7,
        resource: {
            'Pure Red Crystal': 1,
            'Etherite': 70,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    'Infused Pure Blue Crystal': {
        level: 7,
        resource: {
            'Pure Blue Crystal': 1,
            'Etherite': 70,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    'Infused Pure Yellow Crystal': {
        level: 8,
        resource: {
            'Pure Yellow Crystal': 1,
            'Etherite': 80,
        },
        manaCost: 24,
        skillName: 'Enchanting',
    },
    'Infused Pure Orange Crystal': {
        level: 8,
        resource: {
            'Pure Orange Crystal': 1,
            'Etherite': 80,
        },
        manaCost: 24,
        skillName: 'Enchanting',
    },
    'Infused Pure Purple Crystal': {
        level: 9,
        resource: {
            'Pure Purple Crystal': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Infused Pure Black Crystal': {
        level: 10,
        resource: {
            'Pure Black Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Infused Fire Crystal': {
        level: 10,
        resource: {
            'Fire Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Infused Ice Crystal': {
        level: 10,
        resource: {
            'Ice Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Infused Crystal Skull': {
        level: 10,
        resource: {
            'Shattered Crystal Skull': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    // Enchanting/Ring
    'Ring of Lightning Bolt': {
        level: 11,
        resource: {
            'Pure Crystal Ring': 1,
            'Bone Mage Stave': 1,
            'Bracken Root': 1,
            'Elemental Dusts': 10,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Discretion Ring': {
        level: 4,
        resource: {
            'Bronze Ring': 1,
            'Spider Leg': 1,
            'Blink Hound Fur': 1,
            'Etherite': 40,
        },
        manaCost: 12,
        skillName: 'Enchanting',
    },
    'Ring of Stealth': {
        level: 6,
        resource: {
            'Silver Ring': 1,
            'Infused Blue Crystal': 1,
            'Blink Hound Fur': 1,
            'Etherite': 60,
        },
        manaCost: 18,
        skillName: 'Enchanting',
    },
    'Ring of Shadow': {
        level: 7,
        resource: {
            'Gold Ring': 1,
            'Infused Pure Blue Crystal': 1,
            'Small Moon Fragment': 1,
            'Spider Leg': 1,
            'Blink Hound Fur': 1,
            'Etherite': 70,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    'Ring of Lesser Mana': {
        level: 7,
        resource: {
            'Gold Ring': 1,
            'Amethyst': 1,
            'Bracken Root': 1,
            'Etherite': 70,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    'Ring of Medium Mana': {
        level: 8,
        resource: {
            'Platinum Ring': 1,
            'Amethyst': 1,
            'Bracken Root': 1,
            'Infused Purple Crystal': 1,
            'Etherite': 80,
        },
        manaCost: 24,
        skillName: 'Enchanting',
    },
    'Ring of Greater Mana': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Amethyst': 1,
            'Bracken Root': 1,
            'Ancient Rune': 1,
            'Infused Pure Purple Crystal': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Ring of Strength': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Aquamarine': 1,
            'Giant Heart': 1,
            'Infused Orange Crystal': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Ring of Brute Strength': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Aquamarine': 1,
            'Bloodstone': 1,
            'Giant Heart': 1,
            'Infused Pure Orange Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Lesser Vitality Ring': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Jacinth': 1,
            'Giant Heart': 1,
            'Etherite': 90,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    'Medium Vitality Ring': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Jacinth': 1,
            'Giant Heart': 1,
            'Infused Red Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Greater Vitality Ring': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Jacinth': 1,
            'Giant Heart': 1,
            'Magic Stone': 1,
            'Infused Pure Red Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Ring of Beast Mastery': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Azurite': 1,
            'Harpie Beak': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Ring of Feral Might': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Azurite': 1,
            'Harpie Beak': 1,
            'Infused Red Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Ring of Primal Dominance': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Azurite': 1,
            'Nevia Flower': 1,
            'Harpie Beak': 1,
            'Infused Pure Red Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Ring of Vicious Strike': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Bloodstone': 1,
            'Spider Fang': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Ring of Deadly Strikes': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Bloodstone': 1,
            'Spider Fang': 1,
            'Infused Black Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Ring of Assassination': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Bloodstone': 1,
            'Small Moon Fragment': 1,
            'Spider Fang': 1,
            'Infused Pure Black Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Lesser Restoration Ring': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Topaz': 1,
            'Silver Dragon Claw': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Medium Restoration Ring': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Topaz': 1,
            'Silver Dragon Claw': 1,
            'Infused Purple Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Greater Restoration Ring': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Topaz': 1,
            'Pearl': 1,
            'Silver Dragon Claw': 1,
            'Infused Pure Purple Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Lesser Amplification Ring': {
        level: 9,
        resource: {
            'Crystal Ring': 1,
            'Emerald': 1,
            'Bone Mage Stave': 1,
            'Etherite': 90,
        },
        manaCost: 27,
        skillName: 'Enchanting',
    },
    'Medium Amplification Ring': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Emerald': 1,
            'Bone Mage Stave': 1,
            'Infused Purple Crystal': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Greater Amplification Ring': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Emerald': 1,
            'Bone Mage Stave': 1,
            'Infused Pure Purple Crystal': 1,
            'Seashell Horn': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Lesser Meditation Ring': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Opal': 1,
            'Amber Fossil': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Medium Meditation Ring': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Opal': 1,
            'Amber Fossil': 1,
            'Infused Fire Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Greater Meditation Ring': {
        level: 12,
        resource: {
            'Diamond Ring': 1,
            'Opal': 1,
            'Amber Fossil': 1,
            'Infused Fire Crystal': 1,
            'Infused Ice Crystal': 1,
            'Etherite': 120,
        },
        manaCost: 36,
        skillName: 'Enchanting',
    },
    'Ring of Lesser Haste': {
        level: 10,
        resource: {
            'Pure Crystal Ring': 1,
            'Sapphire': 1,
            'Bat Wing': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Ring of Medium Haste': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Sapphire': 1,
            'Bat Wing': 1,
            'Infused Green Crystal': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Ring of Greater Haste': {
        level: 12,
        resource: {
            'Diamond Ring': 1,
            'Sapphire': 1,
            'Bat Wing': 1,
            'Small Moon Fragment': 1,
            'Infused Pure Green Crystal': 1,
            'Etherite': 120,
        },
        manaCost: 36,
        skillName: 'Enchanting',
    },
    'Ring of Sharpness': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Star Diamond': 1,
            'Diamond Dust': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Ring of Piercing': {
        level: 12,
        resource: {
            'Diamond Ring': 1,
            'Star Diamond': 1,
            'Diamond Dust': 1,
            'Infused Yellow Crystal': 1,
            'Etherite': 120,
        },
        manaCost: 36,
        skillName: 'Enchanting',
    },
    'Ring of Shattering': {
        level: 13,
        resource: {
            'Moonstone Ring': 1,
            'Star Diamond': 1,
            'Small Moon Fragment': 1,
            'Diamond Dust': 1,
            'Infused Pure Yellow Crystal': 1,
            'Etherite': 130,
        },
        manaCost: 39,
        skillName: 'Enchanting',
    },
    'Lesser Endurance Ring': {
        level: 11,
        resource: {
            'Ruby Ring': 1,
            'Star Ruby': 1,
            'Ivory Tusk': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Medium Endurance Ring': {
        level: 12,
        resource: {
            'Diamond Ring': 1,
            'Star Ruby': 1,
            'Ivory Tusk': 1,
            'Infused Red Crystal': 1,
            'Etherite': 120,
        },
        manaCost: 36,
        skillName: 'Enchanting',
    },
    'Greater Endurance Ring': {
        level: 13,
        resource: {
            'Moonstone Ring': 1,
            'Star Ruby': 1,
            'Ivory Tusk': 1,
            'Infused Pure Red Crystal': 1,
            'Infused Fire Crystal': 1,
            'Etherite': 130,
        },
        manaCost: 39,
        skillName: 'Enchanting',
    },
    // Enchanting/Charm
    'Charm of Undead Cleansing': {
        level: 5,
        resource: {
            'Tarnished Necklace': 1,
            'Infused Black Crystal': 1,
            'Zombie Brain': 1,
            'Bone Mage Stave': 1,
            'Etherite': 50,
        },
        manaCost: 15,
        skillName: 'Enchanting',
    },
    'Charm of Swiftness': {
        level: 6,
        resource: {
            'Infused Green Crystal': 1,
            'Infused Yellow Crystal': 1,
            'Elemental Dusts': 5,
            'Spider Leg': 4,
            'Etherite': 60,
        },
        manaCost: 18,
        skillName: 'Enchanting',
    },
    'Charm of Loyalty': {
        level: 6,
        resource: {
            'Nevia Flower': 1,
            'Infused Red Crystal': 1,
            'Tusker Tail': 1,
            'Gaper Eye': 1,
            'Etherite': 60,
        },
        manaCost: 18,
        skillName: 'Enchanting',
    },
    'Charm of Purity': {
        level: 7,
        resource: {
            'Tarnished Necklace': 1,
            'Infused Black Crystal': 1,
            'Zombie Brain': 1,
            'Elemental Dust': 5,
            'Etherite': 70,
        },
        manaCost: 21,
        skillName: 'Enchanting',
    },
    // Enchanting/Miscellaneous
    'Enchanted Cloth': {
        level: 1,
        resource: {
            'Roll of Cloth': 1,
            'Elemental Dust': 2,
            'Etherite': 10,
        },
        manaCost: 3,
        skillName: 'Enchanting',
    },
    'Diamond Dust': {
        level: 2,
        resource: {
            'Diamond': 1,
            'Harpie Beak': 1,
            'Etherite': 20,
        },
        manaCost: 6,
        skillName: 'Enchanting',
    },
    '2 Explosive Dust': {
        level: 4,
        resource: {
            'Acidic Gland': 1,
            'Goo': 1,
            'Slime': 1,
            'Elemental Dust': 1,
            'Etherite': 40,
        },
        manaCost: 12,
        skillName: 'Enchanting',
    },
    'Essence of Durability': {
        level: 10,
        resource: {
            'Infused Fire Crystal': 1,
            'Magic Stone': 1,
            'Etherite': 100,
        },
        manaCost: 30,
        skillName: 'Enchanting',
    },
    'Essence of Power': {
        level: 11,
        resource: {
            'Infused Crystal Skull': 1,
            'Ancient Rune': 1,
            'Etherite': 110,
        },
        manaCost: 33,
        skillName: 'Enchanting',
    },
    'Essence of Speed': {
        level: 12,
        resource: {
            'Infused Ice Crystal': 1,
            'Snakk Niib Ftragment': 1,
            'Etherite': 120,
        },
        manaCost: 36,
        skillName: 'Enchanting',
    },
    // Enchanting/Orb
    'Orb of Seeing': {
        level: 3,
        resource: {
            'Gaper Eye': 1,
            'Diamond Dust': 1,
            'Elemental Dust': 1,
            'Etherite': 30,
        },
        manaCost: 15,
        skillName: 'Enchanting',
    },

    

}

// スキルレベルアップ時のメッセージ
const SKILL_LEVEL_UP_REGEXP = /^Your (.*) skill level has increased\.$/;
// クラスレベルアップ時のメッセージ
const CLASS_LEVEL_UP_REGEXP = /^Congratulations, your class level reached (\d+)!$/;
