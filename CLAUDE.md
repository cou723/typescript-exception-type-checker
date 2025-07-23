# TypeScript Exception Type Checker

TypeScriptファイルから関数の例外情報を抽出するツール

## 機能

- TypeScriptファイルからルートレベルおよびネストした関数を抽出
- JSDoc `@throws {ErrorType} description` タグからエラー型と説明文を解析
- 関数のネストレベルと親チェーン情報を記録
- doctrineライブラリによる正確なJSDocパース

## 使用方法

### コマンドライン実行

```bash
# 基本的な使用法
deno task extract <ファイルパス>

# 例
deno task extract samples/sample.ts
deno task extract samples/nested-sample.ts
```

### プログラムから使用

```typescript
import { extractRootFunctionsWithThrows, FunctionInfo } from "./extract-functions.ts";

const sourceCode = `
/**
 * @throws {ValidationError} 無効なデータの場合
 */
function validate(data: unknown) {
  // 実装
}
`;

const functions: FunctionInfo[] = extractRootFunctionsWithThrows(sourceCode);
console.log(functions);
```

## プロジェクト構造

```
.
├── extract-functions.ts      # メイン機能
├── extract-functions_test.ts # テストスイート  
├── deno.json                # プロジェクト設定
├── samples/                 # サンプルファイル
│   ├── sample.ts
│   └── nested-sample.ts
└── CLAUDE.md               # このドキュメント
```

## テスト実行

```bash
deno task test
```

## データ型

### FunctionInfo
```typescript
interface FunctionInfo {
  name: string;           // 関数名
  throws: ThrowsInfo[];   // 例外情報の配列
  nestLevel: number;      // ネストレベル (0=ルート)
  parentChain: string[];  // 親関数のチェーン
}
```

### ThrowsInfo
```typescript
interface ThrowsInfo {
  type: string;          // エラー型 (例: "TypeError")
  description?: string;  // 説明文 (例: "引数が無効な場合")
}
```

## サポートしているJSDoc形式

```typescript
/**
 * 関数の説明
 * @param {string} param パラメータの説明
 * @returns {string} 戻り値の説明
 * @throws {ErrorType} エラーの説明
 * @throws {AnotherError} 別のエラーの説明
 */
function example(param: string): string {
  // 実装
}
```