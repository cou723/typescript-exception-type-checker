import { assertEquals } from "@std/assert";
import { extractRootFunctions, extractRootFunctionsWithThrows, FunctionInfo, ThrowsInfo } from "./extract-functions.ts";

Deno.test("基本的な関数宣言の抽出", () => {
  const code = `
function hello() {
  return "world";
}

function add(a: number, b: number) {
  return a + b;
}
`;
  const result = extractRootFunctions(code);
  assertEquals(result, ["hello", "add"]);
});

Deno.test("export関数の抽出", () => {
  const code = `
export function exportedFunction() {
  return "exported";
}

function normalFunction() {
  return "normal";
}
`;
  const result = extractRootFunctions(code);
  assertEquals(result.sort(), ["exportedFunction", "normalFunction"]);
});

Deno.test("ネストした関数も検出", () => {
  const code = `
function outer() {
  function inner() {
    return "nested";
  }
  return inner();
}

function standalone() {
  return "standalone";
}
`;
  const result = extractRootFunctions(code);
  assertEquals(result, ["outer", "inner", "standalone"]);
});

Deno.test("関数がない場合", () => {
  const code = `
const variable = 42;
class MyClass {}
interface MyInterface {}
`;
  const result = extractRootFunctions(code);
  assertEquals(result, []);
});

Deno.test("JSDocのthrowsタグを解析", () => {
  const code = `
/**
 * データを処理する関数
 * @throws {ValidationError} 無効なデータの場合
 * @throws {TypeError} 型が不正な場合
 */
function processData(data: unknown) {
  // 実装
}

/**
 * throwsタグがない関数
 */
function simpleFunction() {
  return "hello";
}
`;
  const result = extractRootFunctionsWithThrows(code);
  assertEquals(result.length, 2);
  assertEquals(result[0].name, "processData");
  assertEquals(result[0].throws, [
    { type: "ValidationError", description: "無効なデータの場合" },
    { type: "TypeError", description: "型が不正な場合" }
  ]);
  assertEquals(result[1].name, "simpleFunction");
  assertEquals(result[1].throws, []);
});

Deno.test("複雑なJSDocコメントの解析", () => {
  const code = `
/**
 * ファイルを読み込む関数
 * @param {string} filePath ファイルパス
 * @returns {string} ファイルの内容
 * @throws {FileNotFoundError} ファイルが見つからない場合
 * @throws {PermissionError} 読み込み権限がない場合
 * @throws {IOError} I/Oエラーが発生した場合
 */
function readFile(filePath: string): string {
  // 実装
}
`;
  const result = extractRootFunctionsWithThrows(code);
  assertEquals(result.length, 1);
  assertEquals(result[0].name, "readFile");
  assertEquals(result[0].throws, [
    { type: "FileNotFoundError", description: "ファイルが見つからない場合" },
    { type: "PermissionError", description: "読み込み権限がない場合" },
    { type: "IOError", description: "I/Oエラーが発生した場合" }
  ]);
});

Deno.test("ネストした関数の詳細情報", () => {
  const code = `
function outer() {
  /**
   * @throws {NestedError} ネストした関数のエラー
   */
  function inner() {
    return "nested";
  }
  return inner();
}
`;
  const result = extractRootFunctionsWithThrows(code);
  assertEquals(result.length, 2);
  
  // outer関数
  assertEquals(result[0].name, "outer");
  assertEquals(result[0].nestLevel, 0);
  assertEquals(result[0].parentChain, []);
  
  // inner関数
  assertEquals(result[1].name, "inner");
  assertEquals(result[1].nestLevel, 1);
  assertEquals(result[1].parentChain, ["outer"]);
  assertEquals(result[1].throws, []);
});