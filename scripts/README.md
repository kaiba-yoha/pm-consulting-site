# PMFlow 記事投稿スクリプト

Discord Bot から `post-article.js` を呼び出して、ブログ記事を自動投稿します。

---

## インストール手順

```bash
cd D:/Claude_Projects/pm-consulting-site
npm install
```

`minimist` は依存関係に含まれています。

---

## 引数一覧

| 引数 | 短縮形 | 必須 | 説明 |
|------|--------|------|------|
| `--title` | `-t` | ✅ | 記事タイトル（最大80文字） |
| `--description` | `-d` | ✅ | メタディスクリプション（最大160文字） |
| `--body` | `-b` | ✅ | 記事本文（改行は `\n` でエスケープ） |
| `--category` | `-c` | - | カテゴリ（デフォルト: `ai-workflow`） |
| `--tags` | - | - | タグ（カンマ区切り）例: `"AI,自動化,PM"` |
| `--featured` | - | - | 注目記事フラグ（`true`/`false`、デフォルト: `false`） |
| `--affiliate` | - | - | アフィリエイト記事フラグ（デフォルト: `false`） |
| `--message-id` | - | - | Discord メッセージID（重複投稿防止） |
| `--dry-run` | - | - | git操作をスキップ（動作確認用） |
| `--help` | `-h` | - | ヘルプを表示 |

---

## カテゴリ一覧

| 値 | 説明 |
|----|------|
| `ai-workflow` | AIワークフロー（ChatGPT・Claude活用法） |
| `framework` | フレームワーク（PMBOK・スクラム等） |
| `team-management` | チーム運営（1on1・リソース調整等） |
| `crisis-recovery` | 炎上対策（プロジェクト火消し・リスク管理） |
| `tools` | ツール紹介（PM向けSaaSレビュー） |

---

## 使用例

### 基本的な投稿

```bash
node scripts/post-article.js \
  --title "AIで議事録を自動生成する方法" \
  --description "whisper+GPT-4でPM業務を効率化する実践ガイド" \
  --category ai-workflow \
  --tags "AI,議事録,自動化,Whisper" \
  --body "## はじめに\n\n議事録作成は多くのPMが時間を取られる作業です。\n\n## 実装方法\n\nWhisper APIを使って..." \
  --featured false \
  --affiliate false \
  --message-id "1234567890123456789"
```

### npm scripts 経由

```bash
# 通常投稿
npm run post -- \
  --title "スクラムでよくある失敗10選" \
  --description "アジャイル導入時のよくある落とし穴と対策を解説" \
  --category framework \
  --body "## 失敗1: スプリントゴールが曖昧\n\n..."

# dry-run（ファイル生成のみ、git操作なし）
npm run post:dry -- \
  --title "テスト記事" \
  --description "テスト用の記事です" \
  --body "本文テキスト"
```

### Discord Bot からの呼び出しイメージ（Node.js）

```javascript
const { execSync } = require('child_process');

const args = [
  `--title "${article.title}"`,
  `--description "${article.description}"`,
  `--category ${article.category}`,
  `--tags "${article.tags.join(',')}"`,
  `--body "${article.body.replace(/\n/g, '\\n')}"`,
  `--message-id ${message.id}`,
].join(' ');

execSync(`node scripts/post-article.js ${args}`, {
  cwd: 'D:/Claude_Projects/pm-consulting-site',
  stdio: 'inherit',
});
```

---

## アフィリエイトフラグの使い方

`--affiliate true` を指定すると、記事の frontmatter に `affiliate: true` が設定されます。

アフィリエイト記事では `AffiliateInline.astro` コンポーネントが本文中に書籍・ツール広告を表示します。記事本文内で以下のように使用できます:

```mdx
import AffiliateInline from '../../components/ads/AffiliateInline.astro';

<AffiliateInline category="ai-workflow" />
```

カテゴリを指定すると、`src/lib/affiliates.ts` のデータからマッチする書籍・ツールが表示されます。

---

## 出力URL

投稿完了後、以下の形式のURLが出力されます:

```
https://pmflow.karmait.net/blog/post-YYYYMMDD-HHMMSS
```

Cloudflare Pages の自動デプロイ完了後（約2分）にアクセス可能になります。

---

## エラーケース

| エラー | 対処法 |
|--------|--------|
| `--title は必須です` | `--title` 引数を追加 |
| `--category の値が不正` | カテゴリ一覧から正しい値を指定 |
| `メッセージID は既に投稿済みです` | 同じDiscordメッセージからの二重投稿を防止 |
| `git操作に失敗しました` | git認証・リモート設定を確認 |
