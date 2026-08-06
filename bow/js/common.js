/**
 * common.js
 * 汎用ルーチン
 */

/**
 * ローカルストレージ設定の定数
 */
const STORAGE = {
    code: 'bow',
    version: '1',
};

/**
 * デバッグ用のメッセージをコンソールに出力する
 * @param {...*} msgs - 出力するメッセージやデータ
 */
const log = (...msgs) => {
    msgs.forEach(msg => {
        try {
            // 配列、オブジェクト、Set、Mapなどを完全に複製して出力
            console.log(structuredClone(msg));
        } catch (e) {
            // 関数やDOM要素など、複製できないデータはそのまま出力
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
    // 外部変数 STORAGE が存在しない場合の安全弁
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    
    try {
        const jsonString = JSON.stringify(data);
        localStorage.setItem(storageCode + key, jsonString);
        return true; // 保存成功のサイン
    } catch (error) {
        // 容量オーバー（QuotaExceededError）や、JSON.stringify のエラーをキャッチ
        console.error(`Storage save error for key "${key}":`, error);
        return false; // 保存失敗のサイン
    }
};

/**
 * ローカルストレージからデータを取得する
 * @param {string} key - ストレージのキー名
 * @param {*} [defaultValue=null] - データが存在しない場合や解析エラー時のデフォルト値
 * @returns {*} 取得したデータ、またはデフォルト値
 */
const loadStorage = (key, defaultValue = null) => {
    // 外部変数が無い場合の安全弁
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    
    // ローカルストレージから生データを取得
    const rawData = localStorage.getItem(storageCode + key);
    
    // データが存在しない場合は、指定された初期値を返す
    if (rawData === null) {
        return defaultValue;
    }

    // データの解析
    try {
        return JSON.parse(rawData);
    } catch (error) {
        // JSONの解析に失敗した場合はエラーを出して初期値を返す
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
    const storageKeys = ['Lang', 'ShowTimeStamp', 'ShowChatLog', 'ShowSystemLog', 'maskHoles', appVersion];
    const currentVersion = STORAGE.version;
    
    // 保存されていたバージョンを取得
    const savedVersion = loadStorage(appVersion);

    // バージョンが違ったら全ての関連データを消去
    if (savedVersion && savedVersion !== currentVersion) {
        storageKeys.forEach(key => localStorage.removeItem(storageCode + key));
        // ※localStorage.clear()は他アプリのデータを巻き込むため不使用
        log('StorageVersionCheck: ローカルストレージのデータを消去しました');
    }
    
    // 改めて現行バージョンを保存
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
        return true; // コピー成功
    } catch (error) {
        console.error('クリップボードへのコピーに失敗しました:', error);
        return false; // コピー失敗（権限がないなど）
    }
};