// ============================================================
// NIVEL 2 — Curso de Nudos de Montaña (seed data)
// Fuente principal: "Manual de Iniciación al Montañismo" (Iniciación al Alpinismo),
// capítulos 1 (material) y 2 (nudos).
// Los módulos con la marca <!-- identificar:... --> muestran la actividad de reconocer
// nudos en fotos antes del examen (ver client/src/components/KnotPhotoQuiz.tsx).
// ============================================================

type Letter = "a" | "b" | "c" | "d";
type Question = {
  pregunta: string;
  opcionA: string;
  opcionB: string;
  opcionC: string;
  opcionD: string;
  respuestaCorrecta: Letter;
  explicacion?: string;
};

export const NUDOS_COURSE = {
  nivel: 2,
  titulo: "Curso de Nudos de Montaña",
  descripcion:
    "Cuerdas, terminología y los nudos esenciales del montañista: ocho, dinámico (UIAA), ballestrinque, gaza, alondra, nudo de cinta y autobloqueantes. Con las figuras del manual para reconocer cada nudo.",
  precio: 0,
  activo: 1,
};

export const NUDOS_MODULES: {
  numero: number;
  titulo: string;
  descripcion: string;
  contenidoMarkdown: string;
  questions: Question[];
}[] = [
  {
    numero: 1,
    titulo: "Conocer la cuerda",
    descripcion: "Tipos de cuerda, cuidado, plegado y longitud",
    contenidoMarkdown: `# Módulo 1: Conocer la cuerda

Antes de aprender un solo nudo hay que entender la herramienta. La cuerda es el elemento que une a la cordada y su elección y cuidado son parte de la seguridad.

## Cuerdas estáticas y dinámicas

**Cuerdas estáticas.** Se usan como cuerdas fijas, cuerdas auxiliares en big wall, espeleología y descenso de cañones. Más que "estáticas" son de **baja elongación**: estiran alrededor de un **2 %** con el peso del cuerpo. No son recomendables para asegurar caídas porque transmiten mucha tensión al escalador y a los anclajes.

**Cuerdas dinámicas.** Están diseñadas para **absorber el impacto de una caída**. Tienen gran elasticidad, son fáciles de manejar y su durabilidad es menor. Son las que usamos para escalar y encordarnos.

## Las tres designaciones de cuerda dinámica

| Tipo | Diámetro | Uso |
|---|---|---|
| **Simple** | 9,4 a 11 mm | Se usa sola. Compromiso entre peso, durabilidad y seguridad. |
| **Doble** | 8,1 a 9,1 mm | Se usan dos a la vez; se pueden chapar por separado o alternadas, lo que reduce el rozamiento y permite retiradas en rápel. |
| **Gemelas** | 7,8 a 8 mm | Se pasan siempre juntas por el mismo mosquetón. Muy livianas, menos durables, desaconsejadas para personas de más de 75 kg. |

Cada tipo se identifica con un símbolo en la etiqueta del extremo de la cuerda: un **1** en un círculo (simple), un **½** (doble) o dos círculos entrelazados (gemelas).

## Desenrollar una cuerda nueva

Nunca tires de un extremo de una cuerda nueva: se forman **30 a 40 rizos**. Desenrollala **lazada por lazada**, como si desovillaras, para que quede "neutra".

## Plegarla: la técnica de mariposa

Colgarla en un gran lazo sobre el hombro la riza. La **mariposa** no la riza y es más rápida si empezás con los dos extremos en la mano y trabajás hacia el centro. Si la empezás desde un solo extremo, quedará lista para escalar apenas la desplegás.

## ¿Qué largo necesito?

- Escalada alpina en roca y hielo: **50 a 55 m** (muchos largos tienen esa medida).
- Glaciares: **50 m**, para tener reserva en un rescate de grieta.
- Escalada deportiva: **60 a 65 m**, para descolgarse con margen hasta el suelo.

## Cuidados básicos

- No pises la cuerda ni la arrastres sobre aristas filosas.
- Mantenela lejos de ácidos, combustibles y del sol directo prolongado.
- Revisala al plegarla: zonas blandas, camisa rota o el alma visible son motivo para retirarla.
- Registrá las caídas fuertes que soportó: su capacidad de absorción disminuye con cada una.
`,
    questions: [
      { pregunta: "¿Qué cuerda está diseñada para absorber el impacto de una caída?", opcionA: "La estática", opcionB: "La dinámica", opcionC: "El cordino auxiliar", opcionD: "La cinta plana", respuestaCorrecta: "b" },
      { pregunta: "¿Cuánto estira aproximadamente una cuerda estática con el peso del cuerpo?", opcionA: "Un 2 %", opcionB: "Un 10 %", opcionC: "Un 25 %", opcionD: "No estira nada", respuestaCorrecta: "a" },
      { pregunta: "Las cuerdas gemelas se caracterizan porque…", opcionA: "Se usan de a una", opcionB: "Se chapan alternadas", opcionC: "Se pasan siempre juntas por el mismo mosquetón", opcionD: "Son las más durables", respuestaCorrecta: "c" },
      { pregunta: "¿Cómo se desenrolla correctamente una cuerda nueva?", opcionA: "Tirando fuerte de un extremo", opcionB: "Haciéndola girar en el suelo", opcionC: "Lazada por lazada, como desovillando", opcionD: "Colgándola de un árbol", respuestaCorrecta: "c" },
      { pregunta: "¿Qué ventaja tiene plegar la cuerda en mariposa?", opcionA: "No la riza y es rápida", opcionB: "Ocupa más lugar", opcionC: "Sirve solo para cuerdas estáticas", opcionD: "La alarga", respuestaCorrecta: "a" },
    ],
  },
  {
    numero: 2,
    titulo: "Fundamentos del anudado",
    descripcion: "Vocabulario, reglas de oro y para qué sirve cada nudo",
    contenidoMarkdown: `# Módulo 2: Fundamentos del anudado

## Vocabulario de la cuerda

- **Firme:** la parte de la cuerda que soporta la carga o que va hacia el compañero.
- **Chicote:** el extremo libre con el que trabajamos.
- **Seno:** una curva o doblez de la cuerda (la cuerda doblada sobre sí misma).
- **Cabo:** cada trozo de cuerda que sale de un nudo.
- **Gaza:** un lazo cerrado formado con la cuerda.

## Por seno o por chicote

Un nudo se puede hacer **por seno** (con la cuerda doblada, los dos extremos van paralelos) o **por chicote** (se arma con el extremo y luego se repasa siguiendo el recorrido en sentido contrario). Los **nudos de encordamiento se hacen siempre por chicote**, para poder pasarlos por los puntos de encordamiento del arnés.

## Las reglas de oro

1. **Peinar y apretar.** Un nudo solo es seguro cuando lo ajustás tirando con fuerza de cada uno de los cabos. Las vueltas no se deben cruzar ("peinado").
2. **Cabos largos.** Para que no se deshaga bajo carga, el cabo sobrante debe medir al menos **10 veces el diámetro** en cuerdas y cordinos, y **4 a 5 veces el ancho** en cintas.
3. **Todo nudo debilita.** Los nudos reducen la resistencia de cuerdas, cordinos y cintas **hasta un 50 %** de la carga de rotura teórica.
4. **Control cruzado.** Antes de cada salida, cada integrante de la cordada revisa el nudo y el arnés del otro.

## Seis familias de nudos

1. Nudos de **encordamiento** (ocho por chicote).
2. Nudos para hacer **anillos** con cintas y cordinos (cinta plana, gaza).
3. Nudos para **autoasegurarse** (ballestrinque, ocho por seno).
4. Nudos para **asegurar** al compañero (dinámico o UIAA).
5. Nudos para **unir cuerdas** (ocho por chicote enfrentado).
6. Nudos **autobloqueantes** (machard, prusik).

## El mosquetón, socio del nudo

Los mosquetones se clasifican por la forma del cuerpo (oval, D simétrica, D, **pera o HMS**), por el cierre (diente y pasador o **keylock**), por el gatillo (recto, curvo, alambre) y por el seguro (rosca, semiautomático o automático). Para el nudo dinámico se usa un **mosquetón HMS** (en forma de pera) **con seguro**.
`,
    questions: [
      { pregunta: "¿Cómo se llama el extremo libre de la cuerda con el que trabajamos?", opcionA: "Firme", opcionB: "Seno", opcionC: "Chicote", opcionD: "Gaza", respuestaCorrecta: "c" },
      { pregunta: "Los nudos de encordamiento se hacen siempre…", opcionA: "Por seno", opcionB: "Por chicote", opcionC: "Con cinta", opcionD: "Con dos mosquetones", respuestaCorrecta: "b" },
      { pregunta: "¿Cuánto debe medir como mínimo el cabo sobrante en una cuerda?", opcionA: "2 veces su diámetro", opcionB: "5 veces su diámetro", opcionC: "10 veces su diámetro", opcionD: "1 metro siempre", respuestaCorrecta: "c" },
      { pregunta: "¿Cuánto puede reducir un nudo la resistencia de una cinta o cordino?", opcionA: "Nada", opcionB: "Hasta un 10 %", opcionC: "Hasta un 50 %", opcionD: "Hasta un 90 %", respuestaCorrecta: "c" },
      { pregunta: "¿Qué mosquetón se usa para el nudo dinámico?", opcionA: "Uno de gatillo de alambre sin seguro", opcionB: "Un HMS (pera) con seguro", opcionC: "Uno oval sin seguro", opcionD: "Cualquiera de una exprés", respuestaCorrecta: "b" },
    ],
  },
  {
    numero: 3,
    titulo: "Nudo de ocho",
    descripcion: "El nudo de encordamiento por excelencia",
    contenidoMarkdown: `# Módulo 3: Nudo de ocho

Es el nudo **de encordamiento y de autoaseguramiento** más difundido. Soporta grandes cargas sin deslizar y, después de una caída, se puede deshacer con relativa facilidad.

## Ocho por chicote (para encordarse)

1. Medí aproximadamente un brazo y medio de cuerda desde el chicote.
2. Formá un **seno** y cruzá el chicote **por encima del firme**.
3. Pasá el chicote **por detrás del firme**.
4. Metelo **por dentro del primer seno**: ya tenés un "8" simple.
5. Pasá el chicote por los **dos puntos de encordamiento** del arnés.
6. **Repasá** el ocho siguiendo el mismo recorrido en sentido contrario, sin cruzar las vueltas.
7. **Peiná y apretá** tirando de los cuatro cabos. Dejá un cabo de al menos 10 diámetros.

## Ocho por seno (para autoasegurarse)

Se arma igual pero con la cuerda doblada: queda una gaza en el extremo que se pasa por el mosquetón de la reunión. **No es un nudo de encordamiento**, porque estos se hacen siempre por chicote. Para asegurarte en una reunión, el nudo más adecuado es el ocho.

## Ocho enfrentado para unir cuerdas

Un ocho por chicote con los dos extremos enfrentados sirve para unir dos cuerdas, ideal para rapelar. El manual advierte que el nudo de pescador **puede resultar mortal si no se hace correctamente**.

## Cómo reconocer un ocho bien hecho

- Las vueltas forman dos "ocho" paralelos, sin cruces.
- La gaza que abraza el arnés es chica, del tamaño de un puño.
- El cabo sobrante es largo y, si querés, lo rematás con un nudo de seguridad.

## Los ochos en las figuras del manual

![Ocho por chicote](/nudos/ocho-chicote.png)

*Ocho por chicote: para encordarse al arnés (figura 19).*

![Ocho enfrentado](/nudos/ocho-unir-cuerdas.png)

*Ocho enfrentado: para unir dos cuerdas y rapelar (figura 20).*

![Ocho por seno](/nudos/ocho-seno.png)

*Ocho por seno: para autoasegurarse en una reunión (figura 21).*

## Identificá los nudos

Antes del examen, reconocé en cada foto qué nudo es y para qué sirve.

<!-- identificar:ocho-chicote,ocho-seno,ocho-unir-cuerdas -->
`,
    questions: [
      { pregunta: "¿Para qué se usa principalmente el nudo de ocho por chicote?", opcionA: "Para asegurar con mosquetón HMS", opcionB: "Para encordarse", opcionC: "Para hacer anillos de cinta", opcionD: "Como autobloqueante", respuestaCorrecta: "b" },
      { pregunta: "¿Qué ventaja tiene el ocho después de soportar una caída?", opcionA: "Se deshace con relativa facilidad", opcionB: "Queda soldado para siempre", opcionC: "Se alarga solo", opcionD: "No hay que revisarlo", respuestaCorrecta: "a" },
      { pregunta: "El ocho por seno…", opcionA: "Es el nudo de encordamiento ideal", opcionB: "Se usa para autoasegurarse en una reunión", opcionC: "Sirve para asegurar al compañero", opcionD: "Es un autobloqueante", respuestaCorrecta: "b" },
      { pregunta: "Al repasar el ocho por chicote hay que…", opcionA: "Cruzar las vueltas para que trabe más", opcionB: "Seguir el mismo recorrido sin cruzar las vueltas", opcionC: "Hacerlo por seno", opcionD: "Dejar el cabo lo más corto posible", respuestaCorrecta: "b" },
      { pregunta: "Según el manual, ¿qué nudo para unir cuerdas puede ser mortal si se hace mal?", opcionA: "El ocho enfrentado", opcionB: "El de pescador", opcionC: "La alondra", opcionD: "El ballestrinque", respuestaCorrecta: "b" },
    ],
  },
  {
    numero: 4,
    titulo: "Nudo dinámico (UIAA)",
    descripcion: "Asegurar al compañero con un solo mosquetón",
    contenidoMarkdown: `# Módulo 4: Nudo dinámico o UIAA

Es un **nudo de aseguramiento**. Según el manual, es el **único método recomendable para asegurar sin material específico**: frena lo suficiente, solo necesita un **mosquetón HMS** y es fácil de manejar. También sirve como **freno de emergencia** para descolgar a alguien o para rapelar si perdiste el asegurador.

## Cómo se hace

1. Colocá un mosquetón HMS con seguro en el anillo ventral del arnés o en la reunión.
2. Pasá la cuerda **por el mosquetón** de atrás hacia adelante.
3. Cruzá la cuerda **por delante** formando una gaza.
4. Pasá esa gaza nuevamente **por el mosquetón**, de modo que los dos tramos salgan **del mismo lado del lomo**.
5. **Cerrá el seguro** del mosquetón y verificá que la cuerda corra en los dos sentidos.

El nudo "se da vuelta" dentro del mosquetón cuando cambiás de dar cuerda a recoger: es normal.

## Claves de uso

- La **máxima capacidad de frenado** se logra cuando los dos tramos de cuerda salen **paralelos y opuestos al mismo lado** (ángulo de 0°). En esa posición además riza menos la cuerda.
- La mano de freno **nunca suelta** la cuerda.
- Fuerza de frenado aproximada: **2,5 kN**, más que una placa Sticht (≈2 kN).
- Con **doble cuerda**, lo ideal es un mosquetón independiente para cada cuerda, separados para que no rocen entre sí.
- Riza la cuerda: es un precio aceptable a cambio de no depender de ningún aparato.

## El dinámico en la figura del manual

![Nudo dinámico (UIAA)](/nudos/dinamico.png)

*Nudo dinámico (UIAA): para asegurar al compañero o rapelar con un mosquetón HMS (figura 22). De izquierda a derecha: la cuerda entra al mosquetón, se forma la segunda gaza y se la mete también.*

## Identificá los nudos

<!-- identificar:dinamico,ocho-seno -->
`,
    questions: [
      { pregunta: "¿Qué material mínimo requiere el nudo dinámico?", opcionA: "Un descensor ocho", opcionB: "Un mosquetón HMS", opcionC: "Dos cordinos", opcionD: "Un Grigri", respuestaCorrecta: "b" },
      { pregunta: "¿Cuándo logra el nudo dinámico su máxima capacidad de frenado?", opcionA: "Con los tramos a 90°", opcionB: "Con los tramos paralelos y opuestos (0°)", opcionC: "Con la cuerda floja", opcionD: "Sin mano de freno", respuestaCorrecta: "b" },
      { pregunta: "Además de asegurar, el nudo dinámico sirve para…", opcionA: "Encordarse", opcionB: "Hacer anillos de cinta", opcionC: "Descolgar o rapelar como freno de emergencia", opcionD: "Unir dos cuerdas", respuestaCorrecta: "c" },
      { pregunta: "¿Qué fuerza de frenado aproximada da el nudo dinámico?", opcionA: "0,5 kN", opcionB: "1 kN", opcionC: "2,5 kN", opcionD: "10 kN", respuestaCorrecta: "c" },
      { pregunta: "Asegurando con doble cuerda, lo recomendable es…", opcionA: "Pasar ambas por el mismo mosquetón siempre", opcionB: "Un mosquetón independiente para cada cuerda", opcionC: "No usar nudo dinámico", opcionD: "Atar las dos cuerdas entre sí", respuestaCorrecta: "b" },
    ],
  },
  {
    numero: 5,
    titulo: "Nudo ballestrinque",
    descripcion: "Autoaseguramiento regulable con una mano",
    contenidoMarkdown: `# Módulo 5: Nudo ballestrinque

Es un **nudo de autoaseguramiento** muy práctico: se puede hacer **con una mano** y se **regula** con gran facilidad **sin sacarlo del mosquetón** (su ventaja frente al de gaza). Por eso es ideal para autoasegurarte y para montar repartos con la cuerda en las reuniones.

## Cómo se hace sobre un mosquetón

1. Formá una primera gaza girando la cuerda y colgala en el mosquetón.
2. Formá una segunda gaza **igual a la primera** (misma dirección de giro).
3. Superponé la segunda **por delante** de la primera y colgala también.
4. Los dos cabos quedan saliendo **en sentidos opuestos**, uno debajo del cruce.
5. **Cerrá el seguro** y ajustá tirando de ambos tramos.

Para **regular** la distancia a la reunión, aflojá el nudo y corré cuerda de un lado al otro sin sacarlo del mosquetón.

## Límites que tenés que conocer

- **Desliza a partir de unos 400 kp.**
- Algunos fabricantes indican que podría llegar a cortar la cuerda ante una tracción muy elevada y brusca (caídas de **factor 2**).
- Aun así, es **más que suficiente como autoseguro**.

## El nudo de alondra

Es elemental pero muy práctico: sirve para anclajes en nieve, para atar cabos de autoseguro y para evitar palancas en anclajes. Se arma pasando un seno alrededor del soporte y metiendo los cabos por dentro del seno.

## Las figuras del manual

![Ballestrinque](/nudos/ballestrinque.png)

*Ballestrinque: autoaseguro regulable sin sacarlo del mosquetón (figura 23).*

![Alondra](/nudos/alondra.png)

*Alondra: anclajes en nieve, cabos de autoseguro y evitar palancas (figura 28).*

## Identificá los nudos

<!-- identificar:ballestrinque,alondra,dinamico -->
`,
    questions: [
      { pregunta: "¿Para qué se usa el ballestrinque?", opcionA: "Para encordarse", opcionB: "Para autoasegurarse y montar repartos", opcionC: "Para unir cuerdas en rápel", opcionD: "Como nudo de cinta", respuestaCorrecta: "b" },
      { pregunta: "¿Qué ventaja tiene el ballestrinque frente al nudo de gaza?", opcionA: "Es más lindo", opcionB: "Se regula sin sacarlo del mosquetón", opcionC: "No se afloja nunca", opcionD: "Sirve para cintas planas", respuestaCorrecta: "b" },
      { pregunta: "¿A partir de qué carga aproximada desliza el ballestrinque?", opcionA: "40 kp", opcionB: "100 kp", opcionC: "400 kp", opcionD: "4000 kp", respuestaCorrecta: "c" },
      { pregunta: "El ballestrinque se puede hacer…", opcionA: "Solo con dos manos y sin mosquetón", opcionB: "Con una mano", opcionC: "Solo con cinta", opcionD: "Solo por chicote", respuestaCorrecta: "b" },
      { pregunta: "¿Para qué sirve el nudo de alondra?", opcionA: "Anclajes en nieve y cabos de autoseguro", opcionB: "Asegurar a un primero de cordada", opcionC: "Encordarse", opcionD: "Unir dos cuerdas de rápel", respuestaCorrecta: "a" },
    ],
  },
  {
    numero: 6,
    titulo: "Cintas, gaza y autobloqueantes",
    descripcion: "Anillos, nudo de cinta, gaza, machard y prusik",
    contenidoMarkdown: `# Módulo 6: Cintas, gaza y autobloqueantes

## Anillos de cinta

Los anillos sirven para aprovechar seguros naturales (árboles, puentes de roca), reducir el rozamiento de la cuerda y unir anclajes en las reuniones. Pueden ser **cosidos** (costura en forma de barra) o **anudados**.

## Nudo de cinta plana

Las cintas planas o tubulares deslizan más que la cuerda, por eso **solo deben unirse con el nudo de cinta** (nudo plano repasado).

1. Hacé un nudo simple flojo en un extremo de la cinta.
2. Con el otro extremo, **repasá** el recorrido en sentido contrario, con la cinta plana y sin retorcer.
3. Dejá cabos de **al menos 5 cm** y apretá.
4. **Revisalo periódicamente**: los cabos tienden a acortarse con el uso.

## Nudo de gaza

Sirve para encordarse y para confeccionar anillos de cinta o cordino. Es el **más sencillo y fiable**, y el único que un principiante puede hacer "sin posibilidad de error". Pero tiende a **apretarse en exceso** bajo una fuerte tracción y reduce bastante la resistencia de la cuerda: usalo como **nudo auxiliar**, nunca para que reciba directamente grandes cargas.

## Nudos autobloqueantes

Al recibir tracción **se bloquean por fricción** sobre la cuerda; al descargarlos y aflojarlos, se pueden **deslizar**. Sirven como autoseguro en rápel, para subir y bajar por cuerdas fijas y para retener la cuerda en maniobras de rescate.

- **Machard simple:** también con cinta; gran agarre en cuerdas mojadas.
- **Machard doble:** desliza muy bien.
- **Prusik** (dos o tres vueltas): solo con cordino de **menor diámetro** que la cuerda; una vez apretado desliza con dificultad.

La mayoría funciona bien con **cordinos de 7 mm**. Con menor diámetro agarran más, pero cuestan aflojarlos y pueden ser demasiado débiles. Muchos se llaman genéricamente "prusik", por el más conocido.

## Las figuras del manual

![Nudo de cinta](/nudos/cinta.png)

*Nudo de cinta: unir los extremos de una cinta plana (figura 24).*

![Gaza por chicote](/nudos/gaza-chicote.png)

*Gaza por chicote: nudo auxiliar para encordarse o hacer anillos (figura 25).*

![Gaza por seno](/nudos/gaza-seno.png)

*Gaza por seno: gaza rápida como nudo auxiliar (figura 26).*

![Gaza para cordino](/nudos/gaza-cordino.png)

*Gaza para cordino: cerrar un cordino en un anillo (figura 27).*

![Machard simple](/nudos/machard-simple.png)

*Machard simple: autobloqueante con gran agarre en cuerda mojada (figura 29).*

![Machard doble](/nudos/machard-doble.png)

*Machard doble: autobloqueante que desliza muy bien (figura 30).*

![Prusik](/nudos/prusik.png)

*Prusik: subir o bajar por cuerda fija y maniobras de rescate (figura 31).*

## Identificá los nudos

<!-- identificar:cinta,gaza-chicote,machard-simple,prusik -->

## Antes del examen final

En el examen final vas a tener que **reconocer en las fotos los nudos del curso** y para qué sirve cada uno, antes de responder las preguntas integradoras.
`,
    questions: [
      { pregunta: "¿Con qué nudo deben unirse las cintas planas?", opcionA: "Gaza", opcionB: "Nudo de cinta (plano repasado)", opcionC: "Ballestrinque", opcionD: "Alondra", respuestaCorrecta: "b" },
      { pregunta: "¿Qué largo mínimo conviene dejar en los cabos del nudo de cinta?", opcionA: "1 cm", opcionB: "5 cm", opcionC: "20 cm", opcionD: "No importa", respuestaCorrecta: "b" },
      { pregunta: "¿Cuál es la desventaja principal del nudo de gaza?", opcionA: "Es difícil de hacer", opcionB: "Se aprieta en exceso y reduce bastante la resistencia", opcionC: "Se desarma solo", opcionD: "Solo sirve con cinta", respuestaCorrecta: "b" },
      { pregunta: "Un nudo autobloqueante…", opcionA: "Desliza siempre", opcionB: "Se bloquea por fricción bajo carga y desliza al aflojarlo", opcionC: "Solo sirve para encordarse", opcionD: "Necesita un mosquetón HMS", respuestaCorrecta: "b" },
      { pregunta: "¿Con qué cordino se hace el prusik?", opcionA: "Uno de mayor diámetro que la cuerda", opcionB: "Uno de igual diámetro", opcionC: "Uno de menor diámetro que la cuerda", opcionD: "Con cinta plana únicamente", respuestaCorrecta: "c" },
    ],
  },
];

export const NUDOS_FINAL_QUESTIONS: Question[] = [
  { pregunta: "¿Qué tipo de cuerda usás para escalar y encordarte?", opcionA: "Estática", opcionB: "Dinámica", opcionC: "Cordino de 5 mm", opcionD: "Cinta tubular", respuestaCorrecta: "b" },
  { pregunta: "Para recorrer un glaciar, ¿qué longitud de cuerda recomienda el manual?", opcionA: "20 m", opcionB: "50 m", opcionC: "80 m", opcionD: "100 m", respuestaCorrecta: "b" },
  { pregunta: "¿Qué significa hacer un nudo por seno?", opcionA: "Con la cuerda doblada, los extremos paralelos", opcionB: "Con el extremo libre repasado en sentido contrario", opcionC: "Con dos cuerdas distintas", opcionD: "Sin apretarlo", respuestaCorrecta: "a" },
  { pregunta: "Un nudo es realmente seguro cuando…", opcionA: "Tiene muchas vueltas", opcionB: "Está peinado y apretado tirando de cada cabo", opcionC: "Tiene el cabo corto", opcionD: "Es de color llamativo", respuestaCorrecta: "b" },
  { pregunta: "¿Cuál es el nudo más adecuado para asegurarte en una reunión según el manual?", opcionA: "La alondra", opcionB: "El ocho", opcionC: "El prusik", opcionD: "El de cinta", respuestaCorrecta: "b" },
  { pregunta: "¿Qué nudo es el único recomendable para asegurar sin material específico?", opcionA: "Dinámico (UIAA)", opcionB: "Ballestrinque", opcionC: "Gaza", opcionD: "Machard", respuestaCorrecta: "a" },
  { pregunta: "¿Qué nudo regulás sin sacarlo del mosquetón?", opcionA: "Ocho por chicote", opcionB: "Gaza", opcionC: "Ballestrinque", opcionD: "Nudo de cinta", respuestaCorrecta: "c" },
  { pregunta: "¿Qué autobloqueante tiene gran agarre en cuerdas mojadas?", opcionA: "Machard simple", opcionB: "Machard doble", opcionC: "Ballestrinque", opcionD: "Alondra", respuestaCorrecta: "a" },
  { pregunta: "¿Qué diámetro de cordino funciona bien para la mayoría de los autobloqueantes?", opcionA: "3 mm", opcionB: "7 mm", opcionC: "11 mm", opcionD: "15 mm", respuestaCorrecta: "b" },
  { pregunta: "¿Qué hace cada integrante de la cordada antes de salir?", opcionA: "Nada, cada uno revisa lo suyo", opcionB: "Control cruzado del nudo y el arnés del compañero", opcionC: "Afloja los nudos para que no se traben", opcionD: "Corta los cabos sobrantes", respuestaCorrecta: "b" },
];
