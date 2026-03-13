import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  featured: z.boolean().optional()
});

const posts = defineCollection({
  schema: baseSchema
});

const acts = defineCollection({
  schema: baseSchema.extend({
    tag: z.string().optional(),
    featured: z.boolean().optional()
  })
});

export const collections = {
  posts,
  acts
};