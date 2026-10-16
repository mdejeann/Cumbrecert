CREATE TABLE `certificates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`qr_code` text NOT NULL,
	`course_level` integer NOT NULL,
	`final_score` integer NOT NULL,
	`issued_at` integer NOT NULL,
	`expires_at` integer,
	`is_valid` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificates_qr_code_unique` ON `certificates` (`qr_code`);--> statement-breakpoint
CREATE TABLE `course_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`nivel_0_completado` integer DEFAULT 0 NOT NULL,
	`nivel_1_completado` integer DEFAULT 0 NOT NULL,
	`nivel_2_completado` integer DEFAULT 0 NOT NULL,
	`nivel_3_completado` integer DEFAULT 0 NOT NULL,
	`nivel_4_completado` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_progress_user_id_unique` ON `course_progress` (`user_id`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nivel` integer NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text,
	`precio` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_nivel_unique` ON `courses` (`nivel`);--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`module_id` integer,
	`exam_type` text DEFAULT 'module' NOT NULL,
	`pregunta` text NOT NULL,
	`opcion_a` text NOT NULL,
	`opcion_b` text NOT NULL,
	`opcion_c` text NOT NULL,
	`opcion_d` text NOT NULL,
	`respuesta_correcta` text NOT NULL,
	`explicacion` text,
	`orden` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `module_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`course_level` integer NOT NULL,
	`module_number` integer NOT NULL,
	`exam_score` integer DEFAULT 0 NOT NULL,
	`passed` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_module` ON `module_progress` (`user_id`,`course_level`,`module_number`);--> statement-breakpoint
CREATE TABLE `modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`numero` integer NOT NULL,
	`titulo` text NOT NULL,
	`descripcion` text,
	`contenido_markdown` text,
	`pdf_url` text,
	`pdf_nombre` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`uuid_publico` text,
	`nombre` text,
	`apellido` text,
	`email` text,
	`password_hash` text,
	`region` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);