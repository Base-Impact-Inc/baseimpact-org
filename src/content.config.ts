import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    image: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    author: z.string().default("Base Impact"),
  }),
});

const eventsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/events" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    recurring: z.boolean().default(false),
    recurringDay: z.string().optional(),
    category: z.enum(["volunteer", "community", "fundraiser", "training", "other"]).default("community"),
    registrationUrl: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const photosCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/photos" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    caption: z.string().optional(),
    date: z.coerce.date().optional(),
    location: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    album: z.string().default("general"),
    consent: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  posts: postsCollection,
  events: eventsCollection,
  photos: photosCollection,
};
