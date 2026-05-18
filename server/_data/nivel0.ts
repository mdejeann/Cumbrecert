// ============================================================
// NIVEL 0 — Explorador Iniciante  (seed data)
// This data is used to populate the DB on first run.
// After seeding, all content is managed from the admin panel.
// ============================================================

export const NIVEL0_COURSE = {
  nivel: 0,
  titulo: "Nivel 0 — Explorador Iniciante",
  descripcion: "El primer paso en tu camino de certificación. Fundamentos del senderismo responsable, equipamiento, climatología y Leave No Trace.",
  precio: 0,
  activo: 1,
};

export const NIVEL0_MODULES = [
  {
    numero: 1,
    titulo: "¿Por qué caminamos en la montaña?",
    descripcion: "Historia, cultura y ética del senderismo",
    contenidoMarkdown: `# Módulo 1: ¿Por qué caminamos en la montaña?

## Historia del senderismo en Argentina

El senderismo en Argentina tiene raíces profundas que se remontan a las primeras expediciones científicas del siglo XIX. Naturalistas como Francisco Moreno y Germán Burmeister recorrieron la Patagonia y los Andes, documentando una geografía que hoy es patrimonio de todos los argentinos.

## La montaña como espacio compartido

La montaña no es un lugar de conquista, sino de encuentro. Cada vez que subimos un cerro, compartimos ese espacio con otros senderistas, comunidades locales, fauna y flora nativa, y guardaparques que trabajan para preservar el entorno.

## Ética del senderista responsable

El senderismo responsable se basa en tres principios fundamentales:

**1. No dejar rastro (Leave No Trace)**
Todo lo que llevás, lo traés de vuelta.

**2. Respeto por la vida silvestre**
Mantené distancia de los animales. No los alimentes.

**3. Consideración con otros visitantes**
La montaña es un espacio de silencio y contemplación.

## El rol del CCAM

El Centro Cultural Argentino de Montaña (CCAM) lleva más de 22 años promoviendo la cultura de montaña segura y responsable. CumbreCert nace de ese trabajo.

## Resumen

- El senderismo tiene una historia rica en Argentina
- La montaña es un espacio compartido que debemos cuidar
- La ética del senderista: no dejar rastro, respetar la fauna, considerar a otros
- Certificarse es una forma de comprometerse con estos valores`,
  },
  {
    numero: 2,
    titulo: "¿Qué llevar? Equipamiento esencial",
    descripcion: "Mochila, calzado, hidratación y nutrición",
    contenidoMarkdown: `# Módulo 2: ¿Qué llevar? Equipamiento esencial

## Las 10 esenciales del senderista

Toda salida a la montaña requiere llevar los elementos básicos de seguridad:

1. **Navegación:** Mapa topográfico, brújula, GPS offline
2. **Protección solar:** FPS 50+, anteojos UV, sombrero
3. **Aislamiento térmico:** Ropa de abrigo extra, capa impermeable
4. **Iluminación:** Linterna frontal con pilas de repuesto
5. **Primeros auxilios:** Kit básico, medicación personal
6. **Fuego:** Encendedor (solo para emergencias)
7. **Herramientas:** Navaja multiuso, cinta adhesiva
8. **Nutrición:** Comida extra para un día adicional
9. **Hidratación:** Mínimo 2 litros por persona
10. **Refugio de emergencia:** Manta de supervivencia

## Calzado: la decisión más importante

**Para senderos marcados:** Zapatillas trail running o botas bajas
**Para trekking de varios días:** Botas medianas/altas con tobillo reforzado
**Nunca usar:** Zapatillas urbanas, sandalias, botas de lluvia de goma

## Mochila: tamaño y distribución

- **Día:** 20-30 litros
- **Fin de semana:** 40-50 litros
- **Travesía:** 60-80 litros
- Peso máximo: 20-25% de tu peso corporal
- Lo más pesado: cerca de la espalda y arriba

## Resumen

- Las 10 esenciales son obligatorias en toda salida
- El calzado adecuado previene la mayoría de los accidentes
- Hidratación mínima: 2 litros; en altura o calor, más
- Peso máximo de mochila: 20-25% de tu peso corporal`,
  },
  {
    numero: 3,
    titulo: "Clima y meteorología de montaña",
    descripcion: "Cómo leer el tiempo y cuándo no salir",
    contenidoMarkdown: `# Módulo 3: Clima y meteorología de montaña

## Por qué el clima de montaña es diferente

La montaña genera su propio microclima. Los cambios pueden ser extremadamente rápidos y violentos.

**Regla de oro:** Por cada 1000 metros de altitud, la temperatura baja entre 6°C y 10°C.

## Las amenazas climáticas principales

### Tormenta eléctrica
Es la amenaza más peligrosa. Señales: cielo que se oscurece desde el oeste, viento que cambia de dirección, cumulonimbos, cabello que se eriza.

**Qué hacer:** Descender de cimas y crestas, alejarse de árboles aislados y agua.

### Hipotermia
Ocurre cuando la temperatura corporal baja de 35°C. Puede ocurrir con 10°C si hay viento y humedad.

**Síntomas:** Temblores, confusión mental, torpeza, somnolencia.

## Cómo leer el pronóstico

**Fuentes confiables:** SMN (smn.gob.ar), Windy.com, Mountain-forecast.com

**Qué revisar:** Precipitación, viento en altura, temperatura mínima, probabilidad de tormenta.

## La regla del retorno

Si salís a las 8am, debés estar de regreso en la cima antes del mediodía.

**Nunca subas si:** El pronóstico indica tormentas en las próximas 6 horas, hay nubes que cubren la cumbre, visibilidad menor a 100 metros.

## Resumen

- La temperatura baja 6-10°C por cada 1000m
- Las tormentas eléctricas son la principal amenaza
- Consultá siempre el SMN antes de salir
- Regla del retorno: en la cima antes del mediodía`,
  },
  {
    numero: 4,
    titulo: "Orientación y señalización",
    descripcion: "Cómo no perderse y qué hacer si te perdés",
    contenidoMarkdown: `# Módulo 4: Orientación y señalización

## Los sistemas de señalización en Argentina

### Cairns (hitos de piedra)
Acumulaciones de piedras que marcan el camino. Son el sistema más común en la Patagonia.

**Reglas:** Nunca muevas un cairn. Si encontrás uno caído, levantalo.

### Marcas en árboles y rocas
- **Rojo:** Sendero principal
- **Amarillo:** Sendero secundario
- **Azul:** Acceso a refugio

## Orientación con mapa y brújula

Las curvas de nivel representan la forma del terreno:
- Curvas juntas = pendiente empinada
- Curvas separadas = terreno suave
- Escala más común en Argentina: 1:50.000 (1cm = 500m)

## Aplicaciones GPS recomendadas (offline)

- **Wikiloc:** Rutas de la comunidad
- **Maps.me:** Mapas offline con senderos
- **Gaia GPS:** Mapas topográficos detallados

**Importante:** Descargá los mapas ANTES de salir.

## ¿Qué hacer si te perdés? Protocolo STOP

1. **S - Stop (Parate):** No sigas caminando
2. **T - Think (Pensá):** ¿Cuándo estabas seguro del camino?
3. **O - Observe (Observá):** Mirá el terreno, el sol, las marcas
4. **P - Plan (Planificá):** Decidí una acción concreta

**Si no podés orientarte:** Quedáte en el lugar. 3 señales = pedido de socorro.

## Resumen

- Respetá y no muevas los cairns
- Llevá mapa impreso + brújula + GPS offline
- Si te perdés: STOP
- 3 señales = pedido de socorro`,
  },
  {
    numero: 5,
    titulo: "Conducta en la montaña y Leave No Trace",
    descripcion: "Cómo cuidar el entorno y convivir con otros",
    contenidoMarkdown: `# Módulo 5: Conducta en la montaña y Leave No Trace

## Los 7 principios de Leave No Trace

1. **Planificá y preparate** — Conocé las regulaciones, viajá en grupos pequeños
2. **Caminá en superficies resistentes** — Usá senderos marcados, acampá a 60m del agua
3. **Gestioná correctamente los residuos** — Todo lo que llevás, lo traés de vuelta
4. **Dejá lo que encontrás** — No recojas flores, piedras ni artefactos
5. **Minimizá el impacto del fuego** — En Argentina el fuego está prohibido en la mayoría de los parques
6. **Respetá la vida silvestre** — 30 metros de distancia mínima, no alimentes animales
7. **Sé considerado con otros** — Cedé el paso a quien sube y a animales de carga

## Convivencia en refugios

- Llegá antes de las 18hs
- Reservá con anticipación en temporada alta
- Respetá los horarios de silencio (22hs)
- Pagá la tarifa correspondiente

## Residuos orgánicos

- Alejate 60m del agua, senderos y campamentos
- Cavá un hoyo de 15-20cm (cathole)
- El papel higiénico va en bolsa hermética y lo traés de vuelta

## Resumen

- Los 7 principios LNT son el estándar internacional
- Todo residuo que llevás, lo traés de vuelta
- El fuego está prohibido en la mayoría de los parques argentinos
- Respetá la fauna: 30 metros de distancia mínima
- Cedé el paso a quien sube y a animales de carga`,
  },
];

const idxToLetter = (i: number): "a" | "b" | "c" | "d" => (["a", "b", "c", "d"] as const)[i];

// Each module has 5 questions; correct is a 0-based index → converted to "a"/"b"/"c"/"d"
export const NIVEL0_MODULE_QUESTIONS: {
  moduleNumero: number;
  questions: { pregunta: string; opcionA: string; opcionB: string; opcionC: string; opcionD: string; respuestaCorrecta: "a" | "b" | "c" | "d"; explicacion?: string; orden: number }[];
}[] = [
  {
    moduleNumero: 1,
    questions: [
      { pregunta: "¿Cuál es el primer principio ético del senderismo responsable?", opcionA: "Conquistar la cumbre a cualquier costo", opcionB: "No dejar rastro (Leave No Trace)", opcionC: "Ir siempre con guía certificado", opcionD: "Llevar GPS obligatorio", respuestaCorrecta: idxToLetter(1), orden: 1 },
      { pregunta: "¿Qué institución avala CumbreCert?", opcionA: "Club Andino Bariloche", opcionB: "CCAM (Centro Cultural Argentino de Montaña)", opcionC: "Parques Nacionales Argentina", opcionD: "Ministerio de Turismo", respuestaCorrecta: idxToLetter(1), orden: 2 },
      { pregunta: "¿Cuántos años lleva el CCAM promoviendo la cultura de montaña?", opcionA: "5 años", opcionB: "10 años", opcionC: "22 años", opcionD: "50 años", respuestaCorrecta: idxToLetter(2), orden: 3 },
      { pregunta: "La montaña como espacio compartido implica:", opcionA: "Que solo pueden acceder senderistas certificados", opcionB: "Respetar a otros visitantes, fauna y comunidades locales", opcionC: "Que el primero en llegar tiene prioridad", opcionD: "Que se puede acampar en cualquier lugar", respuestaCorrecta: idxToLetter(1), orden: 4 },
      { pregunta: "¿Qué significa 'Leave No Trace'?", opcionA: "Dejar huellas para que otros puedan seguirte", opcionB: "No dejar rastro de tu paso por la naturaleza", opcionC: "Usar solo senderos marcados", opcionD: "Llevar ropa de colores neutros", respuestaCorrecta: idxToLetter(1), orden: 5 },
    ],
  },
  {
    moduleNumero: 2,
    questions: [
      { pregunta: "¿Cuántos litros de agua mínimo debe llevar cada persona en una salida de día?", opcionA: "0.5 litros", opcionB: "1 litro", opcionC: "2 litros", opcionD: "5 litros", respuestaCorrecta: idxToLetter(2), orden: 1 },
      { pregunta: "¿Qué porcentaje máximo de tu peso corporal debe pesar la mochila?", opcionA: "10%", opcionB: "20-25%", opcionC: "40%", opcionD: "50%", respuestaCorrecta: idxToLetter(1), orden: 2 },
      { pregunta: "¿Cuál es el calzado INCORRECTO para senderismo?", opcionA: "Botas de trekking con tobillo reforzado", opcionB: "Zapatillas trail running", opcionC: "Zapatillas de deporte urbanas", opcionD: "Botas con suela Vibram", respuestaCorrecta: idxToLetter(2), orden: 3 },
      { pregunta: "¿Qué elemento de las 10 esenciales NO debe faltar para emergencias nocturnas?", opcionA: "Cámara de fotos", opcionB: "Linterna frontal con pilas de repuesto", opcionC: "Mapa de la ciudad", opcionD: "Auriculares", respuestaCorrecta: idxToLetter(1), orden: 4 },
      { pregunta: "¿Dónde deben ir los elementos más pesados de la mochila?", opcionA: "En el fondo, lo más lejos posible de la espalda", opcionB: "Cerca de la espalda y arriba", opcionC: "En los bolsillos laterales", opcionD: "No importa la distribución", respuestaCorrecta: idxToLetter(1), orden: 5 },
    ],
  },
  {
    moduleNumero: 3,
    questions: [
      { pregunta: "¿Cuántos grados baja la temperatura por cada 1000 metros de altitud?", opcionA: "1-2°C", opcionB: "3-5°C", opcionC: "6-10°C", opcionD: "15-20°C", respuestaCorrecta: idxToLetter(2), orden: 1 },
      { pregunta: "¿Cuál es la regla del retorno para evitar tormentas de tarde?", opcionA: "Estar de regreso en la cima antes de las 8am", opcionB: "Estar en la cima antes del mediodía", opcionC: "Llegar a la cumbre al atardecer", opcionD: "No hay regla específica", respuestaCorrecta: idxToLetter(1), orden: 2 },
      { pregunta: "¿Qué fuente es confiable para el pronóstico meteorológico en Argentina?", opcionA: "WhatsApp", opcionB: "SMN (Servicio Meteorológico Nacional)", opcionC: "Redes sociales", opcionD: "El color del cielo solamente", respuestaCorrecta: idxToLetter(1), orden: 3 },
      { pregunta: "¿Cuál es un síntoma de hipotermia?", opcionA: "Sudoración excesiva", opcionB: "Temblores incontrolables y confusión mental", opcionC: "Aumento de la temperatura corporal", opcionD: "Hambre intensa", respuestaCorrecta: idxToLetter(1), orden: 4 },
      { pregunta: "¿Cuándo NO debes salir a la montaña?", opcionA: "Cuando hay sol y viento leve", opcionB: "Cuando el pronóstico indica tormentas en las próximas 6 horas", opcionC: "Cuando la temperatura es de 15°C", opcionD: "Cuando hay pocas nubes", respuestaCorrecta: idxToLetter(1), orden: 5 },
    ],
  },
  {
    moduleNumero: 4,
    questions: [
      { pregunta: "¿Qué significa el protocolo STOP cuando te perdés?", opcionA: "Saltar, Trepar, Observar, Pedir ayuda", opcionB: "Parate, Pensá, Observá, Planificá", opcionC: "Seguir, Trotar, Orientarse, Progresar", opcionD: "Señalizar, Tomar agua, Orientarse, Protegerse", respuestaCorrecta: idxToLetter(1), orden: 1 },
      { pregunta: "¿Cuántas señales internacionales equivalen a un pedido de socorro?", opcionA: "1 señal", opcionB: "2 señales", opcionC: "3 señales", opcionD: "5 señales", respuestaCorrecta: idxToLetter(2), orden: 2 },
      { pregunta: "¿Qué son los cairns?", opcionA: "Señales pintadas en árboles", opcionB: "Acumulaciones de piedras que marcan el camino", opcionC: "Carteles de parques nacionales", opcionD: "Aplicaciones GPS", respuestaCorrecta: idxToLetter(1), orden: 3 },
      { pregunta: "¿Qué escala es la más común en mapas topográficos de Argentina?", opcionA: "1:1.000", opcionB: "1:10.000", opcionC: "1:50.000", opcionD: "1:1.000.000", respuestaCorrecta: idxToLetter(2), orden: 4 },
      { pregunta: "Si te perdés, ¿qué es lo primero que debes hacer?", opcionA: "Correr en busca de señal de celular", opcionB: "Parar y no seguir caminando", opcionC: "Trepar al árbol más alto", opcionD: "Encender una fogata", respuestaCorrecta: idxToLetter(1), orden: 5 },
    ],
  },
  {
    moduleNumero: 5,
    questions: [
      { pregunta: "¿A cuántos metros mínimo de fuentes de agua se debe acampar?", opcionA: "10 metros", opcionB: "30 metros", opcionC: "60 metros", opcionD: "100 metros", respuestaCorrecta: idxToLetter(2), orden: 1 },
      { pregunta: "¿Qué se debe hacer con los residuos orgánicos en la montaña?", opcionA: "Enterrarlos en cualquier lugar", opcionB: "Quemarlos", opcionC: "Usar cathole a 60m del agua y llevar el papel de vuelta", opcionD: "Dejarlos cubiertos con hojas", respuestaCorrecta: idxToLetter(2), orden: 2 },
      { pregunta: "¿Cuál es la distancia mínima recomendada para observar mamíferos silvestres?", opcionA: "5 metros", opcionB: "15 metros", opcionC: "30 metros", opcionD: "100 metros", respuestaCorrecta: idxToLetter(2), orden: 3 },
      { pregunta: "¿A quién se le cede el paso en un sendero?", opcionA: "A quien baja (tiene prioridad)", opcionB: "A quien sube (tiene prioridad) y a animales de carga", opcionC: "Al grupo más grande", opcionD: "No hay reglas de paso", respuestaCorrecta: idxToLetter(1), orden: 4 },
      { pregunta: "¿Por qué NO se deben alimentar animales silvestres?", opcionA: "Porque pueden atacarte", opcionB: "Porque los hace dependientes del humano y altera su comportamiento natural", opcionC: "Porque está prohibido por ley en todos los casos", opcionD: "Porque pueden tener enfermedades", respuestaCorrecta: idxToLetter(1), orden: 5 },
    ],
  },
];

export const NIVEL0_FINAL_QUESTIONS: {
  pregunta: string; opcionA: string; opcionB: string; opcionC: string; opcionD: string;
  respuestaCorrecta: "a" | "b" | "c" | "d"; orden: number;
}[] = [
  { pregunta: "¿Cuál es el principio fundamental de Leave No Trace?", opcionA: "Conquistar la cumbre siempre", opcionB: "No dejar rastro de tu paso por la naturaleza", opcionC: "Ir siempre en grupo grande", opcionD: "Llevar guía obligatorio", respuestaCorrecta: idxToLetter(1), orden: 1 },
  { pregunta: "¿Cuántos litros de agua mínimo se necesitan por persona en una salida de día?", opcionA: "0.5 litros", opcionB: "1 litro", opcionC: "2 litros", opcionD: "4 litros", respuestaCorrecta: idxToLetter(2), orden: 2 },
  { pregunta: "¿Cuántos grados baja la temperatura por cada 1000m de altitud?", opcionA: "1-2°C", opcionB: "3-5°C", opcionC: "6-10°C", opcionD: "20°C", respuestaCorrecta: idxToLetter(2), orden: 3 },
  { pregunta: "¿Qué significa la 'S' del protocolo STOP?", opcionA: "Señalizar", opcionB: "Subir", opcionC: "Parate (Stop)", opcionD: "Seguir", respuestaCorrecta: idxToLetter(2), orden: 4 },
  { pregunta: "¿Cuántas señales internacionales equivalen a un pedido de socorro?", opcionA: "1", opcionB: "2", opcionC: "3", opcionD: "5", respuestaCorrecta: idxToLetter(2), orden: 5 },
  { pregunta: "¿A cuántos metros mínimo de fuentes de agua se debe acampar?", opcionA: "10m", opcionB: "30m", opcionC: "60m", opcionD: "200m", respuestaCorrecta: idxToLetter(2), orden: 6 },
  { pregunta: "¿Cuál es el calzado INCORRECTO para senderismo?", opcionA: "Botas de trekking", opcionB: "Trail running", opcionC: "Zapatillas urbanas", opcionD: "Botas con suela Vibram", respuestaCorrecta: idxToLetter(2), orden: 7 },
  { pregunta: "¿Qué fuente es confiable para el pronóstico meteorológico en Argentina?", opcionA: "WhatsApp", opcionB: "SMN (smn.gob.ar)", opcionC: "Redes sociales", opcionD: "El color del cielo", respuestaCorrecta: idxToLetter(1), orden: 8 },
  { pregunta: "¿Qué son los cairns?", opcionA: "Señales pintadas en árboles", opcionB: "Acumulaciones de piedras que marcan el camino", opcionC: "Carteles de parques", opcionD: "Apps GPS", respuestaCorrecta: idxToLetter(1), orden: 9 },
  { pregunta: "¿Por qué NO se deben alimentar animales silvestres?", opcionA: "Porque atacan", opcionB: "Porque los hace dependientes del humano", opcionC: "Porque está siempre prohibido por ley", opcionD: "Porque tienen enfermedades", respuestaCorrecta: idxToLetter(1), orden: 10 },
];
