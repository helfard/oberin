/**
 * common.js
 * 汎用ルーチン
 */

/**
 * ローカルストレージ設定の定数
 */
const STORAGE = Object.freeze({
    code: 'boo',
    version: '1',
});

/**
 * デバッグ用のメッセージをコンソールに出力する
 * @param {...*} msgs - 出力するメッセージやデータ
 */
const logMessage = (...msgs) => {
    msgs.forEach(msg => {
        try {
            console.log(structuredClone(msg));
        } catch (e) {
            console.log(msg);
        }
    });
};

/**
 * ローカルストレージにデータを保存する
 * @param {string} key - ストレージのキー名
 * @param {*} data - 保存するデータ
 * @returns {boolean} 保存成功時はtrue、失敗時はfalse
 */
const saveStorage = (key, data) => {
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    
    try {
        const jsonString = JSON.stringify(data);
        localStorage.setItem(storageCode + key, jsonString);
        return true;
    } catch (error) {
        console.error(`Storage save error for key "${key}":`, error);
        return false;
    }
};

/**
 * ローカルストレージからデータを取得する
 * @param {string} key - ストレージのキー名
 * @param {*} [defaultValue=null] - データが存在しない場合や解析エラー時のデフォルト値
 * @returns {*} 取得したデータ、またはデフォルト値
 */
const loadStorage = (key, defaultValue = null) => {
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    const rawData = localStorage.getItem(storageCode + key);
    
    if (rawData === null) {
        return defaultValue;
    }

    try {
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Storage parse error for key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * ローカルストレージのデータのバージョンをチェックし、
 * バージョンが異なる場合は不具合対策として関連データを消去する（即時実行関数）
 */
const storageVersionCheck = (() => {
    const storageCode = STORAGE.code;
    const appVersion = 'AppVersion';
    // このアプリで使用されているキー全てのリスト
    const storageKeys = ['Lang', 'DateFrom', 'DateTo', 'SplitPerName', 'OptionTakeCatch', 'OptionMagery', 'OptionReagant', appVersion];
    const currentVersion = STORAGE.version;
    
    const savedVersion = loadStorage(appVersion);

    if (savedVersion && savedVersion !== currentVersion) {
        storageKeys.forEach(key => localStorage.removeItem(storageCode + key));
        logMessage('StorageVersionCheck: ローカルストレージのデータを消去しました');
    }
    
    saveStorage(appVersion, currentVersion);
})();

/**
 * 指定された文字列をクリップボードにコピーする
 * @param {string} string - コピーする文字列
 * @returns {Promise<boolean>} コピー成功時はtrue、失敗時はfalse
 */
const execCopy = async (string) => {
    try {
        await navigator.clipboard.writeText(string);
        return true;
    } catch (error) {
        console.error('クリップボードへのコピーに失敗しました:', error);
        return false;
    }
};