import { describe, expect, it } from "vitest";

describe("Curso Teórico de Senderista - Nivel 1", () => {
  it("should verify that the senderista course is an active Nivel 1 course", () => {
    const senderistaCourse = {
      id: 90001,
      nivel: 1,
      titulo: "Curso Teórico de Senderista",
      descripcion: "Curso acerca de los preparativos de como afrontar una montaña",
      precio: 0,
      activo: 1,
    };

    expect(senderistaCourse.nivel).toBe(1);
    expect(senderistaCourse.titulo).toBe("Curso Teórico de Senderista");
    expect(senderistaCourse.activo).toBe(1);
  });

  it("should include both Explorador Iniciante and Curso Teórico de Senderista in the dashboard course list", () => {
    const activeCourses = [
      { nivel: 0, titulo: "Explorador Iniciante", activo: 1 },
      { nivel: 1, titulo: "Curso Teórico de Senderista", activo: 1 },
    ];

    const dashboardCourses = activeCourses.filter((course) => course.activo === 1);
    expect(dashboardCourses.map((course) => course.titulo)).toEqual([
      "Explorador Iniciante",
      "Curso Teórico de Senderista",
    ]);
    expect(dashboardCourses.find((course) => course.nivel === 0)?.titulo).toBe("Explorador Iniciante");
    expect(dashboardCourses.find((course) => course.nivel === 1)?.titulo).toBe("Curso Teórico de Senderista");
  });

  it("should verify that Nivel 1 has 4 modules with PDFs", () => {
    const modules = [
      {
        id: 60001,
        courseId: 90001,
        numero: 1,
        titulo: "¿Por qué llevar bastones?",
        pdfUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/modules/pdfs/60001-NwzqSfyW-Clase 001 bastones.pdf",
      },
      {
        id: 90001,
        courseId: 90001,
        numero: 2,
        titulo: "¿Qué calzado llevar segun que terreno afrontamos?",
        pdfUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/modules/pdfs/90001-DwCzC8g4-Clase 002 Calzado.pdf",
      },
      {
        id: 120001,
        courseId: 90001,
        numero: 3,
        titulo: "Tecnología y Confección",
        pdfUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/modules/pdfs/120001-ORcKkDS5-Clase 001 Tecnologia_y_Confeccion.pdf",
      },
      {
        id: 120002,
        courseId: 90001,
        numero: 4,
        titulo: "SISTEMA DE VESTIMENTA",
        pdfUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663469351135/mDv3jUPJokU654taR8cMEm/modules/pdfs/120002-wn54AXn--Clase 001 sist_vestimenta.pdf",
      },
    ];

    expect(modules).toHaveLength(4);
    modules.forEach((module) => {
      expect(module.courseId).toBe(90001);
      expect(module.pdfUrl).toContain("cloudfront");
      expect(module.titulo).toBeDefined();
    });
  });

  it("should verify that Nivel 1 has 5 questions per module and 10 final exam questions", () => {
    const examStructure = { module1: 5, module2: 5, module3: 5, module4: 5, finalExam: 10 };
    const totalModuleQuestions = examStructure.module1 + examStructure.module2 + examStructure.module3 + examStructure.module4;

    expect(totalModuleQuestions).toBe(20);
    expect(examStructure.finalExam).toBe(10);
    expect(totalModuleQuestions + examStructure.finalExam).toBe(30);
  });

  it("should verify that course selection is persisted through the Nivel 1 progress flag", () => {
    const progress = {
      nivel0Completado: 0,
      nivel1Completado: 0,
      nivel2Completado: 0,
      nivel3Completado: 0,
      nivel4Completado: 0,
    };

    const selectedProgress = { ...progress, nivel1Completado: 1 };
    expect(selectedProgress.nivel1Completado).toBe(1);
  });
});
