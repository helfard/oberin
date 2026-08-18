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

    saveStorage('FromDate', fromDate);
    saveStorage('ToDate', toDate);
    saveStorage('CharacterName', characterName);
    saveStorage('SplitPerName', splitPerName);
}

/**
 * ローカルストレージから各種設定を読み込み、フォームに反映する
 */
function loadOptions() {
    const fromDate = loadStorage('FromDate');
    const toDate = loadStorage('ToDate')
    const characterName = loadStorage('CharacterName');
    const splitPerName = loadStorage('SplitPerName');

    document.getElementById('fromDate').value = fromDate;
    document.getElementById('toDate').value = toDate;
    document.getElementById('characterName').value = characterName;
    document.getElementById('splitPerName').checked = splitPerName;
}

document.addEventListener('DOMContentLoaded', loadOptions);
