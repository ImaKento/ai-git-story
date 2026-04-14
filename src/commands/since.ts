import type { Language } from "../types.js";
import { getCommits, getDiff } from "../utils/git.js";
import { generateStory } from "../services/ai.js";

/**
 * since コマンドを実行
 */
export async function runSinceCommand(
  since: string,
  until: string | undefined,
  language: Language,
  user?: string,
): Promise<void> {
  if (user) {
    console.log(`📅 ${since} 以降の ${user} のコミットを取得中...`);
  } else {
    console.log(`📅 ${since} 以降のコミットを取得中...`);
  }

  const commits = getCommits(since, until, user);

  if (commits.length === 0) {
    console.log("");
    if (user) {
      console.log(
        `ℹ️  指定期間内に ${user} のコミットが見つかりませんでした`,
      );
    } else {
      console.log("ℹ️  指定期間内にコミットが見つかりませんでした");
    }
    return;
  }

  // 各コミットのdiffを取得
  for (const commit of commits) {
    commit.diff = getDiff(commit.hash);
  }

  console.log(`✅ ${commits.length} 件のコミットを見つけました`);
  console.log("");

  const story = await generateStory(commits, language);

  console.log("");
  console.log(story);
  console.log("");
}
