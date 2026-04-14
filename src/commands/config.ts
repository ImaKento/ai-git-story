import { loadConfig, saveConfig, parseLanguage } from "../utils/config.js";

/**
 * config コマンドを実行
 */
export function runConfigCommand(args: string[]): void {
  const subcommand = args[0];

  if (!subcommand) {
    console.error("❌ サブコマンドを指定してください");
    console.error("");
    console.error("使い方:");
    console.error("  ai-git-story config set <key> <value>");
    console.error("  ai-git-story config get <key>");
    console.error("  ai-git-story config list");
    process.exit(1);
  }

  if (subcommand === "list") {
    const config = loadConfig();
    if (!config) {
      console.log("設定ファイルが見つかりません");
      return;
    }
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  if (subcommand === "get") {
    const key = args[1];
    if (!key) {
      console.error("❌ キーを指定してください");
      process.exit(1);
    }

    const config = loadConfig();
    if (!config) {
      console.log("設定ファイルが見つかりません");
      return;
    }

    const value = (config as any)[key];
    if (value === undefined) {
      console.log(`${key} は設定されていません`);
      return;
    }

    console.log(value);
    return;
  }

  if (subcommand === "set") {
    const key = args[1];
    const value = args[2];

    if (!key || !value) {
      console.error("❌ キーと値を指定してください");
      console.error("");
      console.error("使い方: ai-git-story config set <key> <value>");
      process.exit(1);
    }

    if (key === "language") {
      const lang = parseLanguage(value);
      if (!lang) {
        console.error("❌ language は ja または en を指定してください");
        process.exit(1);
      }
      saveConfig({ language: lang });
      console.log(`✅ language を '${lang}' に設定しました`);
      return;
    }

    if (key === "api-key" || key === "apiKey") {
      saveConfig({ apiKey: value });
      console.log("✅ API Key を設定しました");
      return;
    }

    if (key === "model") {
      saveConfig({ model: value });
      console.log(`✅ model を '${value}' に設定しました`);
      return;
    }

    console.error(`❌ 不明な設定キー: ${key}`);
    console.error("");
    console.error("利用可能なキー:");
    console.error("  language  - 出力言語 (ja|en)");
    console.error("  api-key   - OpenAI API Key");
    console.error("  model     - 使用するモデル名");
    process.exit(1);
  }

  console.error(`❌ 不明なサブコマンド: ${subcommand}`);
  process.exit(1);
}
