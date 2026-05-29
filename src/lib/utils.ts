/**
 * Format a date object into a localized Japanese date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date object into ISO format (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Build an Amazon affiliate link
 */
export function buildAmazonAffiliateLink(asin: string, associateId: string = 'YOUR_AMAZON_ASSOCIATE_ID'): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${associateId}`;
}

/**
 * Category labels mapping
 */
export const categoryLabels: Record<string, string> = {
  'ai-workflow': 'AIワークフロー',
  'framework': 'フレームワーク',
  'team-management': 'チーム運営',
  'crisis-recovery': '炎上対策',
  'tools': 'ツール紹介',
};

/**
 * Category color mapping (Tailwind classes)
 */
export const categoryColors: Record<string, string> = {
  'ai-workflow': 'bg-blue-100 text-blue-800',
  'framework': 'bg-purple-100 text-purple-800',
  'team-management': 'bg-green-100 text-green-800',
  'crisis-recovery': 'bg-red-100 text-red-800',
  'tools': 'bg-amber-100 text-amber-800',
};

/**
 * Truncate a string to a given length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
