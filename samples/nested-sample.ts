/**
 * 外側の関数
 * @throws {OuterError} 外側のエラー
 */
function outer() {
  /**
   * 内側の関数
   * @throws {InnerError} 内側のエラー
   */
  function inner() {
    /**
     * さらに深い関数
     * @throws {DeepError} 深いエラー
     */
    function deepNested() {
      return "deep";
    }
    return deepNested();
  }
  return inner();
}

/**
 * 独立した関数
 * @returns {string} 処理結果
 */
function standalone() {
  return "standalone";
}