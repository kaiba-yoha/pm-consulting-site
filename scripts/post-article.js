#!/usr/bin/env node
/**
 * post-article.js
 * Discord Bot経由でPMFlowブログ記事を投稿するスクリプト
 *
 * 使用例:
 *   node scripts/post-article.js \
 *     --title "AIで議事録を自動生成する方法" \
 *     --description "whisper+GPT-4でPM業務を効率化" \
 *     --category ai-workflow \
 *     --tags "AI,議事録,自動化" \
 *     --body "記事本文テキスト（改行は\\nでエスケープ）" \
 *     --featured false \
 *     --affiliate false \
 *     --message-id "1234567890123456789"
 *     --dry-run
 */

import minimist from 'minimist';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'blog');
const SITE_URL = 'https://pmflow.karmait.net';

// --- 設定 ---
const VALID_CATEGORIES = [
  'ai-workflow',
  'framework',
  'team-management',
  'crisis-recovery',
  'tools',
];

// --- CLI引数パース ---
const argv = minimist(process.argv.slice(2), {
  string: ['title', 'description', 'category', 'tags', 'body', 'message-id'],
  boolean: ['featured', 'affiliate', 'dry-run', 'help'],
  alias: {
    t: 'title',
    d: 'description',
    c: 'category',
    b: 'body',
    h: 'help',
  },
  default: {
    featured: false,
    affiliate: false,
    'dry-run': false,
    category: 'ai-workflow',
  },
});

// --- ヘルプ ---
if (argv.help) {
  console.log(`
PMFlow 記事投稿スクリプト

使用法:
  node scripts/post-article.js [オプション]

必須オプション:
  --title, -t       記事タイトル
  --description, -d メタディスクリプション（最大160文字）
  --body, -b        記事本文（改行は \\n でエスケープ）

任意オプション:
  --category, -c    カテゴリ（デフォルト: ai-workflow）
                    ${VALID_CATEGORIES.join(' | ')}
  --tags            タグ（カンマ区切り）例: "AI,自動化,PM"
  --featured        注目記事フラグ（true/false）
  --affiliate       アフィリエイト記事フラグ（true/false）
  --message-id      Discord メッセージID（重複チェックに使用）
  --dry-run         git操作をスキップ（ファイル生成のみ）
  --help, -h        このヘルプを表示
`);
  process.exit(0);
}

// --- バリデーション ---
function validate(argv) {
  const errors = [];

  if (!argv.title || argv.title.trim() === '') {
    errors.push('--title は必須です');
  } else if (argv.title.length > 80) {
    errors.push(`--title は80文字以内にしてください（現在: ${argv.title.length}文字）`);
  }

  if (!argv.description || argv.description.trim() === '') {
    errors.push('--description は必須です');
  } else if (argv.description.length > 160) {
    errors.push(`--description は160文字以内にしてください（現在: ${argv.description.length}文字）`);
  }

  if (!argv.body || argv.body.trim() === '') {
    errors.push('--body は必須です');
  }

  if (!VALID_CATEGORIES.includes(argv.category)) {
    errors.push(`--category の値が不正です: "${argv.category}"\n有効な値: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (errors.length > 0) {
    console.error('\n[エラー] 引数バリデーション失敗:');
    errors.forEach(e => console.error(`  • ${e}`));
    console.error('\n--help で使用方法を確認してください。');
    process.exit(1);
  }
}

// --- 重複チェック（message-id） ---
function checkDuplicate(messageId) {
  if (!messageId) return null;

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    // frontmatter内のbotMessageIdを検索
    const match = content.match(/^botMessageId:\s*["']?(\S+?)["']?\s*$/m);
    if (match && match[1] === messageId) {
      return file;
    }
  }
  return null;
}

// --- スラッグ生成（日付+秒数形式） ---
function generateSlug() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `post-${date}-${time}`;
}

// --- ISO日付文字列（YYYY-MM-DD） ---
function getISODate() {
  return new Date().toISOString().split('T')[0];
}

// --- タグ配列をYAML形式に変換 ---
function formatTags(tagsStr) {
  if (!tagsStr || tagsStr.trim() === '') return '[]';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  if (tags.length === 0) return '[]';
  return `[${tags.map(t => `"${t}"`).join(', ')}]`;
}

// --- 本文テキストのエスケープ解除（\\n → 改行） ---
function unescapeBody(body) {
  return body.replace(/\\n/g, '\n');
}

// --- MDXファイル生成 ---
function buildMDX({ title, description, category, tags, body, featured, affiliate, messageId, slug, pubDate }) {
  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"')}"`,
    `pubDate: ${pubDate}`,
    `category: ${category}`,
    `tags: ${formatTags(tags)}`,
    `featured: ${featured === true || featured === 'true'}`,
    `affiliate: ${affiliate === true || affiliate === 'true'}`,
    `draft: false`,
    `postedVia: discord-bot`,
    messageId ? `botMessageId: "${messageId}"` : null,
    '---',
  ].filter(line => line !== null).join('\n');

  const processedBody = unescapeBody(body);
  return `${frontmatter}\n\n${processedBody}\n`;
}

// --- git操作 ---
function gitCommitAndPush(filePath, title) {
  const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
  const commitMsg = `feat(blog): "${title}" を Discord Bot経由で追加`;

  try {
    console.log('\n[git] ファイルをステージング中...');
    execSync(`git -C "${PROJECT_ROOT}" add "${relPath}"`, { stdio: 'inherit' });

    console.log('[git] コミット中...');
    execSync(`git -C "${PROJECT_ROOT}" commit -m "${commitMsg}"`, { stdio: 'inherit' });

    console.log('[git] プッシュ中...');
    execSync(`git -C "${PROJECT_ROOT}" push`, { stdio: 'inherit' });

    console.log('[git] 完了');
  } catch (err) {
    console.error('\n[エラー] git操作に失敗しました:');
    console.error(err.message);
    if (err.stderr) {
      console.error('stderr:', err.stderr.toString());
    }
    process.exit(1);
  }
}

// --- メイン処理 ---
function main() {
  const {
    title,
    description,
    category,
    tags,
    body,
    featured,
    affiliate,
    'message-id': messageId,
    'dry-run': dryRun,
  } = argv;

  // バリデーション
  validate(argv);

  // 重複チェック
  if (messageId) {
    const duplicate = checkDuplicate(messageId);
    if (duplicate) {
      console.error(`\n[エラー] メッセージID "${messageId}" は既に投稿済みです: ${duplicate}`);
      process.exit(1);
    }
  }

  // スラッグ・日付生成
  const slug = generateSlug();
  const pubDate = getISODate();
  const fileName = `${slug}.mdx`;
  const filePath = path.join(BLOG_DIR, fileName);

  // MDXコンテンツ生成
  const content = buildMDX({ title, description, category, tags, body, featured, affiliate, messageId, slug, pubDate });

  console.log('\n[情報] 記事を生成します:');
  console.log(`  タイトル  : ${title}`);
  console.log(`  スラッグ  : ${slug}`);
  console.log(`  カテゴリ  : ${category}`);
  console.log(`  ファイル  : src/content/blog/${fileName}`);
  console.log(`  dry-run   : ${dryRun}`);

  if (dryRun) {
    console.log('\n[dry-run] ファイルを生成します（git操作はスキップ）:');
    console.log('------- MDXプレビュー -------');
    console.log(content.slice(0, 500) + (content.length > 500 ? '\n...(省略)' : ''));
    console.log('----------------------------');
    console.log(`\n[dry-run完了] URL予測: ${SITE_URL}/blog/${slug}`);
    process.exit(0);
  }

  // ファイル書き込み
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n[完了] ファイルを作成しました: ${filePath}`);

  // git操作
  gitCommitAndPush(filePath, title);

  // 完了メッセージ
  const articleUrl = `${SITE_URL}/blog/${slug}`;
  console.log(`\n[投稿完了]`);
  console.log(`URL: ${articleUrl}`);
  console.log(`※ Cloudflare Pagesのデプロイ完了後（約2分）にアクセス可能になります。`);
}

main();
