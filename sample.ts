/**
 * 数値を加算する関数
 * @param {number} a 最初の数値
 * @param {number} b 二番目の数値
 * @returns {number} 加算結果
 * @throws {TypeError} 引数が数値でない場合
 */
export function addNumbers(a: number, b: number): number {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('引数は数値である必要があります');
  }
  return a + b;
}

/**
 * ファイルを読み込む関数
 * @param {string} filePath ファイルのパス
 * @returns {string} ファイルの内容
 * @throws {FileNotFoundError} ファイルが見つからない場合
 * @throws {PermissionError} 読み込み権限がない場合
 * @throws {IOError} I/Oエラーが発生した場合
 */
function readFileContent(filePath: string): string {
  // 実装は省略
  return "content";
}

/**
 * JSDocコメントはあるがthrowsタグがない関数
 * @param {string} message メッセージ
 * @returns {string} 処理結果
 */
function simpleProcess(message: string): string {
  return `処理済み: ${message}`;
}

// JSDocコメントがない関数
function noDocFunction() {
  return "no doc";
}