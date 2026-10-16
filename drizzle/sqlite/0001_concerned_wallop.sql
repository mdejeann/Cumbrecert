CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nombre` text,
	`region` text,
	`interes` text DEFAULT 'newsletter' NOT NULL,
	`mensaje` text,
	`created_at` integer NOT NULL
);
