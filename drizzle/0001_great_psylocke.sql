CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`qr_code` varchar(64) NOT NULL,
	`course_level` int NOT NULL,
	`final_score` int NOT NULL,
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp,
	`is_valid` int NOT NULL DEFAULT 1,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_qr_code_unique` UNIQUE(`qr_code`)
);
--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`nivel_0_completado` int NOT NULL DEFAULT 0,
	`nivel_1_completado` int NOT NULL DEFAULT 0,
	`nivel_2_completado` int NOT NULL DEFAULT 0,
	`nivel_3_completado` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`course_level` int NOT NULL,
	`module_number` int NOT NULL,
	`exam_score` int NOT NULL DEFAULT 0,
	`passed` int NOT NULL DEFAULT 0,
	`attempts` int NOT NULL DEFAULT 0,
	`completed_at` timestamp,
	CONSTRAINT `module_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_user_module` UNIQUE(`user_id`,`course_level`,`module_number`)
);
--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_progress` ADD CONSTRAINT `course_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;