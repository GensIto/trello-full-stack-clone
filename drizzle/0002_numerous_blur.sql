CREATE TABLE `workspace_invitations` (
	`invitation_id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`invited_email` text NOT NULL,
	`invited_by` text NOT NULL,
	`role_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`workspace_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`role_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `workspace_memberships` ADD `updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL;