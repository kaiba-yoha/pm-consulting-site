/**
 * affiliates.ts
 * アフィリエイトリンク・書籍・SaaSツールの一元管理
 */

export const AMAZON_ASSOCIATE_ID = process.env.AMAZON_ASSOCIATE_ID ?? 'YOUR-ASSOCIATE-ID-22';

// --- 書籍アフィリエイト ---
export interface AffiliateBook {
  id: string;
  title: string;
  author: string;
  asin: string;
  description: string;
  categories: string[];
}

export const affiliateBooks: AffiliateBook[] = [
  {
    id: 'trouble-resolution',
    title: 'プロジェクトのトラブル解決大全',
    author: '木部智之',
    asin: '4046055316',
    description: '「再生工場」と呼ばれた著者による炎上プロジェクトの火消し術86を収録',
    categories: ['crisis-recovery', 'framework'],
  },
  {
    id: 'pmbok-v7',
    title: 'PMBOK ガイド 第7版',
    author: 'PMI',
    asin: '4274227375',
    description: 'ウォーターフォール・アジャイル・ハイブリッド対応の業界標準PM教科書',
    categories: ['framework', 'ai-workflow'],
  },
  {
    id: 'rescue-problem-project',
    title: 'Rescue the Problem Project',
    author: 'Todd C. Williams',
    asin: '0814416454',
    description: '炎上プロジェクト立て直しに特化した英語書籍',
    categories: ['crisis-recovery'],
  },
];

// --- SaaSツールアフィリエイト ---
export interface AffiliateSaaS {
  id: string;
  name: string;
  description: string;
  url: string;
  categories: string[];
}

export const affiliateSaaS: AffiliateSaaS[] = [
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'AI Brain込みで$9/ユーザー/月。少人数PMチームに最適なオールインワンPMツール',
    url: 'https://clickup.com/', // アフィリエイトリンクに差し替え
    categories: ['ai-workflow', 'team-management'],
  },
  {
    id: 'notion-ai',
    name: 'Notion AI',
    description: '議事録・週次レポート・PRDをAI自動生成。月額$10/ユーザー追加',
    url: 'https://www.notion.so/', // アフィリエイトリンクに差し替え
    categories: ['ai-workflow'],
  },
  {
    id: 'otterai',
    name: 'Otter.ai',
    description: '会議後2時間以内に要約・アクションアイテム・議事録を自動生成',
    url: 'https://otter.ai/', // アフィリエイトリンクに差し替え
    categories: ['ai-workflow', 'team-management'],
  },
];

/**
 * AmazonアフィリエイトリンクをASINから生成
 */
export function buildAmazonLink(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_ASSOCIATE_ID}`;
}

/**
 * カテゴリでフィルタリングした書籍一覧を返す
 */
export function getBooksByCategory(category: string): AffiliateBook[] {
  return affiliateBooks.filter(book => book.categories.includes(category));
}

/**
 * カテゴリでフィルタリングしたSaaSツール一覧を返す
 */
export function getSaaSByCategory(category: string): AffiliateSaaS[] {
  return affiliateSaaS.filter(tool => tool.categories.includes(category));
}

/**
 * カテゴリにマッチする書籍からランダムに1件返す
 * マッチなしの場合は全体からランダム
 */
export function getRandomBook(category?: string): AffiliateBook {
  const pool = category ? getBooksByCategory(category) : affiliateBooks;
  const source = pool.length > 0 ? pool : affiliateBooks;
  return source[Math.floor(Math.random() * source.length)];
}

/**
 * カテゴリにマッチするSaaSツールからランダムに1件返す
 * マッチなしの場合は全体からランダム
 */
export function getRandomSaaS(category?: string): AffiliateSaaS {
  const pool = category ? getSaaSByCategory(category) : affiliateSaaS;
  const source = pool.length > 0 ? pool : affiliateSaaS;
  return source[Math.floor(Math.random() * source.length)];
}
