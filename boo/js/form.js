/**
 * form.js
 * 　オプションフォームの処理
 */

/**
 * ローカルストレージに各種設定を保存
 */
function saveOptions() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const characterName = document.getElementById('characterName').value.trim();
    const splitPerName = document.getElementById('splitPerName').checked;
    const optionTakeCatch = document.getElementById('optionTakeCatch').checked;
    const optionPotion = document.getElementById('optionPotion').checked;
    const optionSpell = document.getElementById('optionSpell').checked;
    const optionReagent = document.getElementById('optionReagent').checked;

    saveStorage('FromDate', fromDate);
    saveStorage('ToDate', toDate);
    saveStorage('CharacterName', characterName);
    saveStorage('SplitPerName', splitPerName);
    saveStorage('OptionTakeCatch', optionTakeCatch);
    saveStorage('OptionPotion', optionPotion);
    saveStorage('OptionSpell', optionSpell);
    saveStorage('OptionReagent', optionReagent);
}

/**
 * ローカルストレージから各種設定を読み込み、フォームに反映する
 */
function loadOptions() {
    const fromDate = loadStorage('FromDate');
    const toDate = loadStorage('ToDate')
    const characterName = loadStorage('CharacterName');
    const splitPerName = loadStorage('SplitPerName');
    const optionTakeCatch = loadStorage('OptionTakeCatch');
    const optionPotion = loadStorage('OptionPotion');
    const optionSpell = loadStorage('OptionSpell');
    const optionReagent = loadStorage('OptionReagent');

    document.getElementById('fromDate').value = fromDate;
    document.getElementById('toDate').value = toDate;
    document.getElementById('characterName').value = characterName;
    document.getElementById('splitPerName').checked = splitPerName;
    document.getElementById('optionTakeCatch').checked = optionTakeCatch;
    document.getElementById('optionPotion').checked = optionPotion;
    document.getElementById('optionSpell').checked = optionSpell;
    document.getElementById('optionReagent').checked = optionReagent;
}

document.addEventListener('DOMContentLoaded', loadOptions);
