/**
 * Database schema.
 *
 * Portability rules (SQLite/libSQL → Postgres):
 * - ids are app-generated UUID strings (→ uuid / text)
 * - timestamps are integer milliseconds mapped to Date (→ timestamptz)
 * - no SQLite-specific functions or column types
 * Migrating means rewriting this file with pg-core equivalents; the rest of the
 * app only goes through `src/server`.
 */
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

const createdAt = () =>
  timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    /** IANA timezone, used to compute "today" for due cards and streaks. */
    timezone: text("timezone").notNull().default("UTC"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

// ---------------------------------------------------------------------------
// Decks & cards
// ---------------------------------------------------------------------------

export const decks = sqliteTable(
  "decks",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("decks_user_idx").on(t.userId)],
);

export const cardSources = ["manual", "text", "pdf"] as const;
export type CardSource = (typeof cardSources)[number];

export const cards = sqliteTable(
  "cards",
  {
    id: id(),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    /** Denormalized owner for fast per-user due queries. */
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    tag: text("tag"),
    source: text("source", { enum: cardSources }).notNull().default("manual"),

    // --- FSRS state (mirrors ts-fsrs Card) ---
    due: timestamp("due")
      .notNull()
      .$defaultFn(() => new Date()),
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    learningSteps: integer("learning_steps").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    /** 0=New 1=Learning 2=Review 3=Relearning */
    state: integer("state").notNull().default(0),
    lastReview: timestamp("last_review"),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("cards_user_due_idx").on(t.userId, t.due),
    index("cards_deck_idx").on(t.deckId),
  ],
);

export const reviewLogs = sqliteTable(
  "review_logs",
  {
    id: id(),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 1=Again 2=Hard 3=Good 4=Easy */
    rating: integer("rating").notNull(),
    /** Card state *before* this review. */
    state: integer("state").notNull(),
    due: timestamp("due").notNull(),
    stability: real("stability").notNull(),
    difficulty: real("difficulty").notNull(),
    scheduledDays: integer("scheduled_days").notNull(),
    learningSteps: integer("learning_steps").notNull(),
    reviewAt: timestamp("review_at").notNull(),
    durationMs: integer("duration_ms"),
  },
  (t) => [
    index("review_logs_user_time_idx").on(t.userId, t.reviewAt),
    index("review_logs_card_idx").on(t.cardId),
  ],
);

// ---------------------------------------------------------------------------
// Generation jobs (AI). Source documents are never stored.
// ---------------------------------------------------------------------------

export const jobSources = ["text", "pdf"] as const;
export const jobStatuses = [
  "pending",
  "running",
  "review",
  "done",
  "failed",
] as const;
export type JobStatus = (typeof jobStatuses)[number];

export const generationJobs = sqliteTable(
  "generation_jobs",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deckId: text("deck_id")
      .notNull()
      .references(() => decks.id, { onDelete: "cascade" }),
    source: text("source", { enum: jobSources }).notNull(),
    sourceName: text("source_name"),
    requestedCount: integer("requested_count").notNull(),
    totalChunks: integer("total_chunks").notNull(),
    doneChunks: integer("done_chunks").notNull().default(0),
    status: text("status", { enum: jobStatuses }).notNull().default("pending"),
    error: text("error"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("generation_jobs_user_idx").on(t.userId, t.createdAt)],
);

export const chunkStatuses = ["pending", "done", "failed"] as const;

export const generationChunks = sqliteTable(
  "generation_chunks",
  {
    id: id(),
    jobId: text("job_id")
      .notNull()
      .references(() => generationJobs.id, { onDelete: "cascade" }),
    index: integer("index").notNull(),
    pageFrom: integer("page_from"),
    pageTo: integer("page_to"),
    targetCount: integer("target_count").notNull(),
    status: text("status", { enum: chunkStatuses })
      .notNull()
      .default("pending"),
    attempts: integer("attempts").notNull().default(0),
    error: text("error"),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("generation_chunks_job_idx_uq").on(t.jobId, t.index)],
);

export const draftStatuses = ["pending", "approved", "discarded"] as const;

export const draftCards = sqliteTable(
  "draft_cards",
  {
    id: id(),
    jobId: text("job_id")
      .notNull()
      .references(() => generationJobs.id, { onDelete: "cascade" }),
    chunkIndex: integer("chunk_index").notNull(),
    position: integer("position").notNull(),
    front: text("front").notNull(),
    back: text("back").notNull(),
    tag: text("tag"),
    status: text("status", { enum: draftStatuses })
      .notNull()
      .default("pending"),
    /** Set by dedup: id of the draft this one duplicates (hidden by default). */
    duplicateOf: text("duplicate_of"),
  },
  (t) => [index("draft_cards_job_idx").on(t.jobId, t.chunkIndex, t.position)],
);

// ---------------------------------------------------------------------------
// Rate limiting (sliding window, works across serverless instances)
// ---------------------------------------------------------------------------

export const rateLimitHits = sqliteTable(
  "rate_limit_hits",
  {
    id: id(),
    key: text("key").notNull(),
    ts: integer("ts").notNull(),
  },
  (t) => [index("rate_limit_key_ts_idx").on(t.key, t.ts)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, { fields: [decks.userId], references: [users.id] }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, { fields: [cards.deckId], references: [decks.id] }),
  reviewLogs: many(reviewLogs),
}));

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
  card: one(cards, { fields: [reviewLogs.cardId], references: [cards.id] }),
}));

export const generationJobsRelations = relations(
  generationJobs,
  ({ many, one }) => ({
    chunks: many(generationChunks),
    drafts: many(draftCards),
    deck: one(decks, { fields: [generationJobs.deckId], references: [decks.id] }),
  }),
);

export const generationChunksRelations = relations(
  generationChunks,
  ({ one }) => ({
    job: one(generationJobs, {
      fields: [generationChunks.jobId],
      references: [generationJobs.id],
    }),
  }),
);

export const draftCardsRelations = relations(draftCards, ({ one }) => ({
  job: one(generationJobs, {
    fields: [draftCards.jobId],
    references: [generationJobs.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Deck = typeof decks.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;
export type ReviewLogRow = typeof reviewLogs.$inferSelect;
export type GenerationJob = typeof generationJobs.$inferSelect;
export type GenerationChunk = typeof generationChunks.$inferSelect;
export type DraftCard = typeof draftCards.$inferSelect;
