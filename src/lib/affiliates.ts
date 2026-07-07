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
  /** 直リンク (a8urlが未設定の場合に使用) */
  url: string;
  /**
   * A8.netアフィリエイトリンク (設定時はこちらを優先使用)
   * A8管理画面 > プログラム > 広告素材 > テキストリンク のURLを設定
   * 例: "https://px.a8.net/svt/ejp?a8mat=XXXXXXXX"
   */
  a8url?: string;
  /**
   * A8.net CV計測用トラッキングピクセルURL
   * 広告素材のimg src (0.gif) を設定するとCV計測精度が上がる
   * 例: "https://www14.a8.net/0.gif?a8mat=XXXXXXXX"
   */
  a8pixel?: string;
  categories: string[];
}

export const affiliateSaaS: AffiliateSaaS[] = [
  {
    id: 'techclips',
    name: 'TechClipsエージェント',
    description: 'ITエンジニア専門の転職エージェント。高年収・自社開発案件に特化',
    url: 'https://agent.tech-clips.com/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1H1I+230N02+3SWM+5YJRM',
    categories: ['ai-workflow', 'tools'],
  },
  {
    id: 'atproman',
    name: '@PRO人（アットプロジン）',
    description: '未経験からITエンジニアへ。初めての転職も徹底サポートするIT専門エージェント',
    url: 'https://www.and-plus.net/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1H1I+27S3UA+4GWI+HV7V6',
    categories: ['ai-workflow', 'team-management', 'tools'],
  },
  {
    id: 'dmm-kabu',
    name: 'DMM 株',
    description: '日本株も米国株もNISAも。ポイントを貯めながらアプリで取引',
    url: 'https://kabu.dmm.com/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1H1I+1SW9PU+1WP2+15ORS2',
    categories: ['framework'],
  },
  {
    id: 'matsui',
    name: '松井証券',
    description: '株式・先物・投資信託など豊富な投資サービスを取り扱う老舗ネット証券',
    url: 'https://www.matsui.co.jp/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1H1I+1QIJAQ+3XCC+64C3M',
    categories: ['framework'],
  },
  {
    id: 'onamae',
    name: 'お名前.com',
    description: '国内シェアNo.1のドメイン取得サービス。.com/.net 0円〜',
    url: 'https://www.onamae.com/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1DXI+E39C6Q+50+2HHG82',
    categories: ['tools', 'ai-workflow'],
  },
  {
    id: 'itsuki-hikari',
    name: 'イツキ光',
    description: '最短翌日開通・v6プラス対応の高速光回線。現金キャッシュバック実施中',
    url: 'https://itsuki-hikari.com/',
    a8url: 'https://px.a8.net/svt/ejp?a8mat=4B1H1I+34IY42+4VXM+60OXE',
    categories: ['tools'],
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
 * SaaSツールの有効なリンクURLを返す (A8リンク優先)
 */
export function getSaaSUrl(tool: AffiliateSaaS): string {
  return tool.a8url ?? tool.url;
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
