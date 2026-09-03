import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const communitySkills = sqliteTable("community_skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  author: text("author").notNull(),
  githubUrl: text("github_url").notNull(),
  tagsJson: text("tags_json").notNull(),
  imagesJson: text("images_json").notNull(),
  feature: text("feature").notNull(),
  codexPrompt: text("codex_prompt").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
