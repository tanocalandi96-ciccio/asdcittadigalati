import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const news = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
  }),
});
const giocatori = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/giocatori" }),
  schema: z.object({
    nome: z.string(),
    ruolo: z.enum(["Portiere", "Difensore", "Centrocampista", "Attaccante"]),
    numero: z.number().int().optional(),
    foto: z.string().optional(),
  }),
});
const staff = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/staff" }),
  schema: z.object({
    nome: z.string(),
    incarico: z.string(),
    foto: z.string().optional(),
    ordine: z.number().int().default(99),
  }),
});
const sponsor = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/sponsor" }),
  schema: z.object({
    nome: z.string(),
    livello: z.enum(["main", "tecnico", "partner"]),
    logo: z.string(),
    url: z.string().url().optional(),
  }),
});
export const collections = { news, giocatori, staff, sponsor };
