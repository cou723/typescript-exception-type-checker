import * as ts from "typescript";
import * as doctrine from "doctrine";

/**
 * 例外情報を格納する型
 */
export interface ThrowsInfo {
  type: string;
  description?: string;
}

/**
 * 関数の情報を格納する型
 */
export interface FunctionInfo {
  name: string;
  throws: ThrowsInfo[];
  nestLevel: number;
  parentChain: string[];
}

/**
 * JSDocのthrowsタグを解析する（doctrineライブラリを使用）
 */
function parseThrowsTags(node: ts.FunctionDeclaration): ThrowsInfo[] {
  const throws: ThrowsInfo[] = [];
  
  // JSDocコメントを取得
  const jsDoc = ts.getJSDocCommentsAndTags(node);
  
  for (const comment of jsDoc) {
    if (ts.isJSDoc(comment) && comment.comment) {
      // JSDocコメント全体のテキストを取得
      const fullText = comment.getFullText();
      
      try {
        // doctrineでパース
        const parsed = doctrine.parse(fullText, { unwrap: true });
        
        // throwsタグを抽出
        for (const tag of parsed.tags) {
          if (tag.title === 'throws') {
            let errorType = 'Error';
            let description: string | undefined;
            
            // 型情報がある場合
            if (tag.type) {
              errorType = tag.type.name || tag.type.type || 'Error';
            }
            
            // 説明文がある場合
            if (tag.description) {
              description = tag.description.trim();
            }
            
            throws.push({
              type: errorType,
              description: description
            });
          }
        }
      } catch (error) {
        // パースエラーの場合は無視
        continue;
      }
    }
  }
  
  return throws;
}

/**
 * TypeScriptファイルからルートレベルの関数宣言を抽出する（関数名のみ）
 */
export function extractRootFunctions(sourceCode: string): string[] {
  const functions = extractRootFunctionsWithThrows(sourceCode);
  return functions.map(f => f.name);
}

/**
 * TypeScriptファイルからルートレベルの関数宣言とthrows情報を抽出する
 */
export function extractRootFunctionsWithThrows(sourceCode: string): FunctionInfo[] {
  const sourceFile = ts.createSourceFile(
    "temp.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: FunctionInfo[] = [];

  function visit(node: ts.Node, parentChain: string[] = [], nestLevel: number = 0) {
    // 関数宣言をチェック
    if (ts.isFunctionDeclaration(node) && node.name) {
      const throws = parseThrowsTags(node);
      
      functions.push({
        name: node.name.text,
        throws: throws,
        nestLevel: nestLevel,
        parentChain: [...parentChain]
      });
      
      // この関数の中を探索する際は、親チェーンと深さを更新
      const newParentChain = [...parentChain, node.name.text];
      ts.forEachChild(node, (child) => visit(child, newParentChain, nestLevel + 1));
    } else {
      // 関数以外のノードも探索
      ts.forEachChild(node, (child) => visit(child, parentChain, nestLevel));
    }
  }

  ts.forEachChild(sourceFile, (child) => visit(child));
  return functions;
}

// CLIとして実行する場合
if (import.meta.main) {
  const args = Deno.args;
  if (args.length === 0) {
    console.error("使用法: deno run --allow-read extract-functions.ts <ファイルパス>");
    Deno.exit(1);
  }

  const filePath = args[0];
  
  try {
    const sourceCode = await Deno.readTextFile(filePath);
    const functions = extractRootFunctionsWithThrows(sourceCode);
    
    console.log(`${filePath} のルートレベル関数:`);
    if (functions.length === 0) {
      console.log("  関数が見つかりませんでした");
    } else {
      functions.forEach(func => {
        console.log(`  - ${func.name}`);
        if (func.throws.length > 0) {
          console.log(`    throws:`);
          func.throws.forEach(throwInfo => {
            if (throwInfo.description) {
              console.log(`      - ${throwInfo.type}: ${throwInfo.description}`);
            } else {
              console.log(`      - ${throwInfo.type}`);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error(`エラー: ${error instanceof Error ? error.message : String(error)}`);
    Deno.exit(1);
  }
}