CREATE TABLE `community_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`author` text NOT NULL,
	`github_url` text NOT NULL,
	`tags_json` text NOT NULL,
	`images_json` text NOT NULL,
	`feature` text NOT NULL,
	`codex_prompt` text NOT NULL,
	`created_at` integer NOT NULL
);
