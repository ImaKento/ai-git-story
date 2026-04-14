# ai-git-story

Gitのコミット履歴をAIで解析し、開発の「物語」として可読性の高い日記形式のレポートを生成するCLIツールです。

## 特徴

- 今日・過去7日間・任意期間のコミットから開発ストーリーを自動生成
- 日報・週報にそのまま使えるMarkdown形式で出力
- 貢献度ランキング（コミット数・追加/削除行数・変更ファイル数）
- インタラクティブなユーザー選択UI
- 日本語・英語の両方に対応

## インストール

```bash
npm install -g ai-git-story
```

開発版として試す場合：

```bash
git clone <repository-url>
cd ai-git-story
npm install
npm run build
npm link
```

## セットアップ

### 環境変数

API キーの取得先: [Groq Console](https://console.groq.com/keys)

**macOS / Linux (bash/zsh):**

```bash
export GROQ_API_KEY="your_api_key"
```

永続化する場合は `~/.bashrc` や `~/.zshrc` に追記してください。

**Windows (コマンドプロンプト):**

```cmd
setx GROQ_API_KEY "your_api_key"
```

**Windows (PowerShell):**

```powershell
[System.Environment]::SetEnvironmentVariable("GROQ_API_KEY", "your_api_key", "User")
```

> `setx` / `SetEnvironmentVariable` はユーザー環境変数として永続保存されます。設定後は**ターミナルを再起動**してください。

**Windows (Git Bash):**

```bash
echo 'export GROQ_API_KEY="your_api_key"' >> ~/.bashrc
source ~/.bashrc
```

任意でモデル指定も可能です（デフォルト: `Llama 3.3 70B Versatile`）。

```bash
# macOS / Linux / Git Bash
export GROQ_MODEL="llama-3.3-70b-versatile"

# Windows コマンドプロンプト
setx GROQ_MODEL "llama-3.3-70b-versatile"
```

### 設定ファイル

環境変数の代わりに、設定ファイルにAPI Keyを保存することもできます：

```bash
ai-git-story config set api-key your_api_key
ai-git-story config set language ja
ai-git-story config set model llama-3.3-70b-versatile
```

## 使い方

### 今日のストーリーを生成

```bash
ai-git-story today
```

今日のコミットから、以下のような形式でストーリーを生成します：

```markdown
# 📖 GitStory - 2024-04-14

## Summary
今日は認証モジュールのリファクタリングと、新しいAPIエンドポイントの追加を行いました。

## Milestones
- ✨ `/api/users` エンドポイントを追加（JWT認証対応）
- ✨ `/api/auth/refresh` エンドポイントを実装
- 🔧 `auth.go` のトークン検証ロジックを改善
- 🔧 セッション管理機能を追加
- 📝 API ドキュメントを更新
- ✅ 認証関連のテストケースを追加

## Refactoring
- `handlers/` 配下のエラーハンドリングを統一
- 冗長な条件分岐を削除（-45 lines）
- 共通のミドルウェア関数を抽出

## Challenges
- トークンのリフレッシュ処理でタイムゾーンの扱いに苦戦
- CORS設定の調整に時間を要した
```

### 過去7日間のストーリーを生成

```bash
ai-git-story week
```

過去7日間のコミットからストーリーを生成します。

### 期間を指定してストーリーを生成

```bash
# 3日前から今日まで
ai-git-story since "3 days ago"

# 特定の日付から
ai-git-story since "2024-01-01"

# 期間を指定
ai-git-story since "2024-01-01" --until "2024-01-31"
```

### 特定のユーザーでフィルタリング

```bash
# インタラクティブにユーザーを選択
ai-git-story today --user
# → リポジトリの貢献者リストから選択できます

# ユーザー名を直接指定
ai-git-story today --user alice

# 今週の bob のコミットのみ
ai-git-story week --user bob

# 期間指定 + ユーザーフィルタ
ai-git-story since "1 week ago" --user "John Doe"
```

**インタラクティブ選択の例:**
```
$ ai-git-story today --user
✔ ユーザーを選択してください: ›
  すべてのユーザー
❯ Kento Imamura
  Alice Smith
  Bob Johnson
```

### 貢献者統計を表示

```bash
# 過去1週間の貢献者統計（デフォルト）
ai-git-story stats

# 過去1ヶ月の統計
ai-git-story stats --since "1 month ago"

# 特定ユーザーの統計
ai-git-story stats --user alice --since "2 weeks ago"

# 期間指定
ai-git-story stats --since "2024-01-01" --until "2024-01-31"
```

**出力例:**
```markdown
## 📊 貢献度ランキング

🥇 **Alice Smith**
   - コミット数: 45 (52.3%)
   - 追加: +2,340 行
   - 削除: -1,120 行
   - 合計変更: 3,460 行
   - 変更ファイル数: 128 ファイル

🥈 **Bob Johnson**
   - コミット数: 28 (32.6%)
   - 追加: +1,890 行
   - 削除: -920 行
   - 合計変更: 2,810 行
   - 変更ファイル数: 89 ファイル

🥉 **Charlie Brown**
   - コミット数: 13 (15.1%)
   - 追加: +540 行
   - 削除: -230 行
   - 合計変更: 770 行
   - 変更ファイル数: 34 ファイル
```

その後、AI による各貢献者の詳細な分析が続きます。

### 英語で出力

```bash
ai-git-story today --lang en
ai-git-story stats --lang en
```

## コマンド一覧

| コマンド | 説明 |
|---------|------|
| `ai-git-story today` | 今日のストーリーを生成 |
| `ai-git-story week` | 過去7日間のストーリーを生成 |
| `ai-git-story since <date>` | 指定日以降のストーリーを生成 |
| `ai-git-story stats` | 貢献者統計と分析を表示 |
| `ai-git-story config` | 設定管理 |

### オプション

| オプション | 説明 | 対応コマンド |
|-----------|------|-------------|
| `--lang <ja\|en>` | 出力言語を指定 | today, week, since, stats |
| `--user <name>` | 特定ユーザーでフィルタリング | today, week, since, stats |
| `--since <date>` | 開始日を指定 | stats |
| `--until <date>` | 終了日を指定 | since, stats |
| `--help`, `-h` | ヘルプを表示 | すべて |

### 設定コマンド

```bash
# 設定の一覧表示
ai-git-story config list

# 設定値の取得
ai-git-story config get language

# 設定値の設定
ai-git-story config set language ja
ai-git-story config set api-key sk-...
ai-git-story config set model gpt-4o
```

## ユースケース

### 日報作成

毎日の終わりに実行して、その日の成果を自動的にまとめる：

```bash
ai-git-story today
```

生成されたMarkdownをそのままNotionやSlackにコピペ。

### 週報作成

週次ミーティングの前に実行して、過去7日間の進捗を把握：

```bash
ai-git-story week
```

### 休暇明けのキャッチアップ

不在の間に何が起きたかを素早く把握：

```bash
ai-git-story since "1 week ago"
```

### チームメンバーの貢献確認

誰がどんな作業をしているかを把握：

```bash
# チーム全体の統計
ai-git-story stats

# 特定メンバーの貢献内容を詳しく確認
ai-git-story stats --user alice --since "1 month ago"
```

## 開発

```bash
# 依存パッケージのインストール
npm install

# ビルド
npm run build

# 開発モード（TypeScriptを直接実行）
npm run dev today
```

## 技術スタック

- **言語**: TypeScript
- **CLI**: Node.js
- **AI**: Groq API (Llama 3.3 70B Versatile)
- **インタラクティブUI**: prompts
- **Git操作**: child_process (git コマンド)

## ロードマップ

### Phase 1: MVP（完了）
- [x] `ai-git-story today` の実装
- [x] `ai-git-story week` の実装
- [x] `ai-git-story since` の実装
- [x] Git log/diff の抽出
- [x] OpenAI API連携
- [x] Markdown出力

### Phase 2: 拡張機能（一部完了）
- [x] `--user` オプションでの絞り込み
- [x] 貢献者分析機能（`stats` コマンド）
- [x] 貢献度ランキング（コミット数・変更行数・ファイル数）
- [ ] ファイル変遷追跡（`trace` コマンド）
- [ ] JSON/HTML出力形式

### Phase 3: UX向上（予定）
- [ ] インタラクティブモード（TUI）
- [ ] プログレスバー表示
- [ ] キャッシュ機構

## ライセンス

MIT

## 関連プロジェクト

- [ai-git-tool](https://github.com/your-org/ai-git-tool) - AIによるコミットメッセージ・PR説明文の自動生成ツール

## フィードバック・貢献

Issue や Pull Request をお待ちしています！
