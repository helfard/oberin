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
    const optionCraft = document.getElementById('optionCraft').checked;
    const optionSpell = document.getElementById('optionSpell').checked;
    const optionResource = document.getElementById('optionResource').checked;
    const optionEtc = document.getElementById('optionEtc').checked;

    saveStorage('FromDate', fromDate);
    saveStorage('ToDate', toDate);
    saveStorage('CharacterName', characterName);
    saveStorage('SplitPerName', splitPerName);
    saveStorage('OptionTakeCatch', optionTakeCatch);
    saveStorage('OptionCraft', optionCraft);
    saveStorage('OptionSpell', optionSpell);
    saveStorage('OptionResource', optionResource);
    saveStorage('OptionEtc', optionEtc);
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
    const optionCraft = loadStorage('OptionCraft');
    const optionSpell = loadStorage('OptionSpell');
    const optionResource = loadStorage('OptionResource');
    const optionEtc = loadStorage('OptionEtc');

    document.getElementById('fromDate').value = fromDate;
    document.getElementById('toDate').value = toDate;
    document.getElementById('characterName').value = characterName;
    document.getElementById('splitPerName').checked = splitPerName;
    document.getElementById('optionTakeCatch').checked = optionTakeCatch;
    document.getElementById('optionCraft').checked = optionCraft;
    document.getElementById('optionSpell').checked = optionSpell;
    document.getElementById('optionResource').checked = optionResource;
    document.getElementById('optionEtc').checked = optionEtc;
}

document.addEventListener('DOMContentLoaded', loadOptions);
