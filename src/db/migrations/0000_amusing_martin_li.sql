CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`date` text NOT NULL,
	`day` text NOT NULL,
	`arrival_time` text NOT NULL,
	`status` text DEFAULT 'present' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`email` text,
	`phone` text,
	`created_at` integer
);
