/**
 * readme.js
 * 説明書の読み込みと表示
 */

/**
 * 説明書の読み込み
 */
function loadReadme() {
    const readmeContainer = document.getElementById('readme-container');
    const readmeFile = {
        ja: 'readme_ja.md',
        en: 'readme_en.md'
    };
    const lang = currentLang || 'ja';
    fetch(`${readmeFile[lang]}`)
        .then(response => response.text())
        .then(text => readmeContainer.innerHTML = marked.parse(text));
};
