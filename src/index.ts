#!/usr/bin/env node
import { getOptionValue } from "./utils/text.js";
import { resolveLanguage } from "./utils/config.js";
import { selectUser } from "./utils/prompt.js";
import { runTodayCommand } from "./commands/today.js";
import { runWeekCommand } from "./commands/week.js";
import { runSinceCommand } from "./commands/since.js";
import { runConfigCommand } from "./commands/config.js";
import { runStatsCommand } from "./commands/stats.js";

// ── フラグ解析 ──────────────────────────────────────────
const args = process.argv.slice(2);

// サブコマンドの抽出
const subcommand = args[0];
const subcommandArgs = args.slice(1);

const showHelp =
  args.includes("--help") || args.includes("-h") || subcommand === "help";
const langArg = getOptionValue(args, "--lang");
const untilArg = getOptionValue(args, "--until");
const sinceArg = getOptionValue(args, "--since");
const hasUserFlag = args.includes("--user");
let userArg = getOptionValue(args, "--user");

if (showHelp) {
  console.log(`
Usage: ai-git-story <command> [options]

Commands:
  today             Generate story from today's commits
  week              Generate story from past 7 days' commits
  since <date>      Generate story from commits since specified date
  stats             Show contributor statistics and analysis
  config            Manage configuration

Today/Week/Since Options:
  --lang <ja|en>    Set language for this run
  --user [name]     Filter commits by author name (interactive select if no name)
  --until <date>    Set end date (only for 'since' command)

Stats Options:
  --since <date>    Start date (default: "1 week ago")
  --until <date>    End date
  --user [name]     Filter by specific user (interactive select if no name)
  --lang <ja|en>    Set language for AI analysis

Config Subcommands:
  config set <key> <value>   Set configuration value
  config get <key>           Get configuration value
  config list                List all configuration

Configuration Keys:
  language          Output language (ja|en)
  api-key           Groq API Key
  model             Model name (default: llama-3.3-70b-versatile)

Global Options:
  --help, -h        Show this help message

Environment:
  GROQ_API_KEY      Your Groq API key (can be set via config or env)
  GROQ_MODEL        Optional model name (default: llama-3.3-70b-versatile)

Examples:
  ai-git-story today
  ai-git-story today --user                    # Interactive user selection
  ai-git-story today --user "John Doe"         # Specific user
  ai-git-story week --lang en
  ai-git-story week --user                     # Interactive selection
  ai-git-story week --user alice
  ai-git-story since "3 days ago"
  ai-git-story since "2024-01-01" --until "2024-01-31"
  ai-git-story since "1 week ago" --user bob
  ai-git-story stats
  ai-git-story stats --user                    # Interactive selection
  ai-git-story stats --since "1 month ago"
  ai-git-story stats --user alice --since "2 weeks ago"
  ai-git-story config set api-key sk-...
  ai-git-story config set language ja
`);
  process.exit(0);
}

if (!subcommand) {
  console.error("❌ コマンドが指定されていません");
  console.error("");
  console.error("📚 利用可能なコマンド:");
  console.error("   ai-git-story today   - 今日のストーリーを生成");
  console.error("   ai-git-story week    - 過去7日間のストーリーを生成");
  console.error("   ai-git-story since <date> - 指定日以降のストーリーを生成");
  console.error("   ai-git-story stats   - 貢献者統計を表示");
  console.error("   ai-git-story config  - 設定管理");
  console.error("");
  console.error("💡 詳しい使い方:");
  console.error("   ai-git-story --help");
  console.error("");
  console.error("🎯 最初に試すなら:");
  console.error("   ai-git-story today");
  process.exit(1);
}

// ── メイン ───────────────────────────────────────────────
async function main() {
  if (subcommand === "config") {
    runConfigCommand(subcommandArgs);
    return;
  }

  // --user フラグが指定されているが値がない場合、インタラクティブに選択
  if (hasUserFlag && !userArg) {
    userArg = await selectUser();
  }

  const language = resolveLanguage(langArg);

  if (subcommand === "today") {
    await runTodayCommand(language, userArg);
    return;
  }

  if (subcommand === "week") {
    await runWeekCommand(language, userArg);
    return;
  }

  if (subcommand === "since") {
    const since = subcommandArgs[0];
    if (!since) {
      console.error("❌ since コマンドには日付を指定してください");
      console.error("");
      console.error("例:");
      console.error('  ai-git-story since "3 days ago"');
      console.error('  ai-git-story since "2024-01-01"');
      process.exit(1);
    }
    await runSinceCommand(since, untilArg, language, userArg);
    return;
  }

  if (subcommand === "stats") {
    await runStatsCommand(sinceArg, untilArg, language, userArg);
    return;
  }

  console.error(`❌ 不明なコマンド: ${subcommand}`);
  console.error("");
  console.error("利用可能なコマンド: today, week, since, stats, config");
  console.error("詳しくは ai-git-story --help を実行してください");
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ 予期しないエラー:", err.message);
  process.exit(1);
});
