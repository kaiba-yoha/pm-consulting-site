import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    category: z.enum(['ai-workflow', 'framework', 'team-management', 'crisis-recovery', 'tools']),
    tags: z.array(z.string()).default([]),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    affiliate: z.boolean().default(false),
    ogImage: z.string().optional(),
    noindex: z.boolean().default(false),
    postedVia: z.enum(['discord-bot', 'manual', 'factory-sonnet5']).default('manual'),
    botMessageId: z.string().optional(),
  }),
});

export const collections = { blog };
