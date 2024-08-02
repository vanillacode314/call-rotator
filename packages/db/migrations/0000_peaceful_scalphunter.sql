CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`name` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `list_contact` (
	`listId` integer NOT NULL,
	`contactId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`contactId`, `listId`),
	FOREIGN KEY (`listId`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contactId`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lists` (
	`id` integer PRIMARY KEY NOT NULL,
	`cycleDurationDays` integer DEFAULT 7 NOT NULL,
	`startDate` integer DEFAULT (unixepoch('now')) NOT NULL,
	`userId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parentId` integer,
	`listId` integer,
	`userId` integer NOT NULL,
	`createdAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`deleted` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`parentId`) REFERENCES `nodes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`listId`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`emailVerified` integer,
	`createdAt` integer DEFAULT (unixepoch('now')) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verificationTokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contacts_phone_userId_unique` ON `contacts` (`phone`,`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `nodes_name_parentId_userId_unique` ON `nodes` (`name`,`parentId`,`userId`);