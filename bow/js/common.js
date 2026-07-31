// common.js
// 　汎用ルーチン

// ローカルストレージ情報
const STORAGE = {
    code: 'bow',
    version: '1',
}

// デバッグ用のメッセージの表示
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

// ローカルストレージにデータを保存
const saveStorage = (key, data) => {
    // 外部変数 STORAGE が存在しない場合の安全弁
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    // ローカルストレージにデータを保存
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
// ローカルストレージからデータを所得
const loadStorage = (key, defaultValue = null) => {
    // 外部変数が無い場合の安全弁（無ければ空文字にするなど）
    const storageCode = typeof STORAGE !== 'undefined' ? STORAGE.code : '';
    // ローカルストレージから生データを所得
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
// ローカルストレージのデータのバージョンをチェック
// バージョンが違ったら不具合対策として一旦消去する
const storageVersionCheck = (() => {
    // ローカルストレージのキーの頭に付ける符号
    const storageCode = STORAGE.code;
    // ローカルストレージのバージョンデータのキー
    // コンフリクト対策に実際のキーは先頭にアプリごとのコードが追加される
    const appVersion = 'AppVersion';
    // このアプリで使用されているキー全てのリスト
    const storageKeys = ['Lang', '', appVersion];
    // 現行のバージョン
    const currentVersion = STORAGE.version;
    // 保存されていたバージョン
    const savedVersion = loadStorage(appVersion);
    // バージョンが違ったら全てのデータを消去
    if (savedVersion && savedVersion !== currentVersion) {
        storageKeys.forEach (key => localStorage.removeItem(storageCode + key));
        // localStorage.clear();は使うべきではない（他のアプリ用のデータが巻き込まれる）
        log('StorageVersionCheck: ローカルストレージのデータを消去');
    }
    saveStorage(appVersion, currentVersion); // 改めて現行バージョンを保存
})();

// クリップボードへコピー
const execCopy = async (string) => {
    try {
        await navigator.clipboard.writeText(string);
        return true; // コピー成功
    } catch (error) {
        console.error('クリップボードへのコピーに失敗しました:', error);
        return false; // コピー失敗（権限がないなど）
    }
};
