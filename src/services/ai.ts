import OpenAI from "openai";
import type { Language, CommitInfo, StorySection } from "../types.js";
import { getApiKey, getModel } from "../utils/config.js";

/**
 * Groq クライアントを初期化
 */
function createClient(): OpenAI {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY が未設定です");
    console.error("");
    console.error("AI 機能を使用するには Groq API キーが必要です");
    console.error("");
    console.error("セットアップ手順:");
    console.error("  1. Groq にサインアップ（無料）: https://console.groq.com/");
    console.error("  2. API キーを取得: https://console.groq.com/keys");
    console.error("  3. 環境変数に設定:");
    console.error('     - 一時的: export GROQ_API_KEY="gsk_..."');
    console.error("     - 永続的: ~/.bashrc や ~/.zshrc に上記を追加");
    console.error("  4. または設定ファイルに保存:");
    console.error("     ai-git-story config set api-key gsk_...");
    process.exit(1);
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

/**
 * プロンプトを生成
 */
function createStoryPrompt(
  commits: CommitInfo[],
  language: Language,
): string {
  const commitSummary = commits
    .map((c) => `- ${c.date.toISOString()} [${c.author}] ${c.message}`)
    .join("\n");

  if (language === "ja") {
    return `あなたはシニアソフトウェアエンジニア兼テクニカルライターです。
以下のGitコミット履歴から、開発者の「物語」を日本語で書いてください。

# 制約
- Markdown形式で出力
- 見出しは ## Summary, ## Milestones, ## Refactoring, ## Challenges
- Summary は1-2文で全体を要約
- Milestones は全ての重要な機能追加・変更を漏れなくリストアップ（数が多くてもOK）
- Refactoring はコード品質向上への貢献をリストアップ
- Challenges はデバッグや試行錯誤の痕跡があれば記載
- 絵文字を適度に使用（✨, 🔧, 🐛 など）

# コミット履歴
${commitSummary}

# 出力形式
以下のフォーマットに従ってください:

## Summary
...

## Milestones
- ...
- ...（全ての重要な変更を列挙）

## Refactoring
- ...（該当があれば）

## Challenges
- ...（該当があれば）
`;
  }

  return `You are a senior software engineer and technical writer.
Write a development "story" in English from the following Git commit history.

# Constraints
- Output in Markdown format
- Use headings: ## Summary, ## Milestones, ## Refactoring, ## Challenges
- Summary should be 1-2 sentences summarizing the overall work
- Milestones should list ALL important features/changes without limitation (as many as needed)
- Refactoring should list code quality improvements
- Challenges should note any debugging or trial-and-error work if evident
- Use emojis appropriately (✨, 🔧, 🐛, etc.)

# Commit History
${commitSummary}

# Output Format
Follow this format:

## Summary
...

## Milestones
- ...
- ... (list all important changes)

## Refactoring
- ... (if applicable)

## Challenges
- ... (if applicable)
`;
}

/**
 * 日次ストーリーを生成
 */
export async function generateStory(
  commits: CommitInfo[],
  language: Language,
): Promise<string> {
  if (commits.length === 0) {
    return language === "ja"
      ? "# 📖 本日のストーリー\n\n今日はコミットがありませんでした。"
      : "# 📖 Today's Story\n\nNo commits found today.";
  }

  const client = createClient();
  const model = getModel();
  const prompt = createStoryPrompt(commits, language);

  console.log("🤖 AI がストーリーを生成中...");

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI からの応答が空でした");
  }

  return content;
}

/**
 * 貢献者分析を生成
 */
export async function generateContributorAnalysis(
  commits: CommitInfo[],
  language: Language,
): Promise<string> {
  const contributorMap = new Map<string, CommitInfo[]>();

  for (const commit of commits) {
    const existing = contributorMap.get(commit.author) || [];
    contributorMap.set(commit.author, [...existing, commit]);
  }

  const contributorSummaries: string[] = [];
  for (const [author, authorCommits] of contributorMap.entries()) {
    const messages = authorCommits.map((c) => c.message).join("\n- ");
    contributorSummaries.push(
      `### ${author} (${authorCommits.length} commits)\n- ${messages}`,
    );
  }

  let prompt: string;
  if (language === "ja") {
    prompt = `以下は開発者によるコミット履歴です。
各開発者がどのような貢献をしたかを日本語で詳しく分析してください。

# 制約
- Markdown形式で出力
- 開発者ごとに ## <開発者名> の見出しを付ける
- 各開発者について以下を分析:
  - 主な貢献内容（具体的に）
  - 得意領域の推測（例: フロントエンド、バックエンド、API設計、テスト、ドキュメント）
  - 特筆すべき変更やインパクトの大きい作業
- 絵文字を適度に使用（👤, 💻, 🎯 など）

# コミット履歴
${contributorSummaries.join("\n\n")}

# 出力形式
## <開発者名>

- 主な貢献: ...
- 得意領域: ...
- 特筆事項: ...
`;
  } else {
    prompt = `Analyze the following commit history by developers in English.

# Constraints
- Output in Markdown format
- Use ## <Developer Name> heading for each developer
- For each developer, analyze:
  - Main contributions (specific details)
  - Inferred expertise areas (e.g., frontend, backend, API design, testing, documentation)
  - Notable changes or high-impact work
- Use emojis appropriately (👤, 💻, 🎯, etc.)

# Commit History
${contributorSummaries.join("\n\n")}

# Output Format
## <Developer Name>

- Main contributions: ...
- Expertise areas: ...
- Notable work: ...
`;
  }

  const client = createClient();
  const model = getModel();

  console.log("🤖 AI が貢献者分析を生成中...");

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI からの応答が空でした");
  }

  return content;
}
