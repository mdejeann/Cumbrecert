CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nivel` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descripcion` text,
	`precio` int NOT NULL DEFAULT 0,
	`activo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_nivel_unique` UNIQUE(`nivel`)
);
--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`module_id` int,
	`exam_type` enum('module','final') NOT NULL DEFAULT 'module',
	`pregunta` text NOT NULL,
	`opcion_a` text NOT NULL,
	`opcion_b` text NOT NULL,
	`opcion_c` text NOT NULL,
	`opcion_d` text NOT NULL,
	`respuesta_correcta` enum('a','b','c','d') NOT NULL,
	`explicacion` text,
	`orden` int NOT NULL DEFAULT 0,
	`activo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`numero` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descripcion` text,
	`contenido_markdown` text,
	`pdf_url` text,
	`pdf_nombre` varchar(255),
	`activo` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exam_questions` ADD CONSTRAINT `exam_questions_module_id_modules_id_fk` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `modules` ADD CONSTRAINT `modules_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;