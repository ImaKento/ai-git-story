import type { Language } from "../types.js";
import { getCommits, getDiff, getContributorStats } from "../utils/git.js";
import { generateContributorAnalysis } from "../services/ai.js";

/**
 * stats コマンドを実行
 */
export async function runStatsCommand(
  since: string | undefined,
  until: string | undefined,
  language: Language,
  user?: string,
  useAI: boolean = true,
): Promise<void> {
  const period = since || "1 week ago";
  const periodText = until ? `${period} 〜 ${until}` : period;

  if (user) {
    console.log(`📊 ${user} の統計を取得中...（期間: ${periodText}）`);
  } else {
    console.log(`📊 貢献者統計を取得中...（期間: ${periodText}）`);
  }

  const commits = getCommits(period, until, user);

  if (commits.length === 0) {
    console.log("");
    if (user) {
      console.log(`ℹ️  指定期間内に ${user} のコミットが見つかりませんでした`);
    } else {
      console.log("ℹ️  指定期間内にコミットが見つかりませんでした");
    }
    return;
  }

  // 各コミットのdiffを取得
  for (const commit of commits) {
    commit.diff = getDiff(commit.hash);
  }

  const stats = getContributorStats(commits);

  console.log(`✅ ${commits.length} 件のコミットを見つけました`);
  console.log("");

  // 合計変更行数でソート
  const sortedStats = stats.sort((a, b) => b.totalChanges - a.totalChanges);

  // 貢献度ランキングを表示
  console.log("## 📊 貢献度ランキング");
  console.log("");

  sortedStats.forEach((contributor, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
    const commitPercentage = ((contributor.commits / commits.length) * 100).toFixed(1);

    console.log(`${medal} **${contributor.name}**`);
    console.log(`   - コミット数: ${contributor.commits} (${commitPercentage}%)`);
    console.log(`   - 追加: +${contributor.additions.toLocaleString()} 行`);
    console.log(`   - 削除: -${contributor.deletions.toLocaleString()} 行`);
    console.log(`   - 合計変更: ${contributor.totalChanges.toLocaleString()} 行`);
    console.log(`   - 変更ファイル数: ${contributor.filesChanged.toLocaleString()} ファイル`);
    console.log("");
  });

  // AI による分析
  if (useAI) {
    const analysis = await generateContributorAnalysis(commits, language);
    console.log("");
    console.log(analysis);
    console.log("");
  }
}
