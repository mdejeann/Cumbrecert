ALTER TABLE `users` DROP INDEX `users_uuid_publico_unique`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `uuid_publico` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `nombre` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `apellido` text;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320);