// Fotos de los nudos (figuras 19 a 31 del "Manual de Iniciación al Montañismo")
// con su nombre y para qué sirve. Se usan en el contenido y en la actividad de identificación.

export type KnotPhoto = { id: string; foto: string; nombre: string; uso: string };

export const KNOT_PHOTOS: KnotPhoto[] = [
  { id: "ocho-chicote", foto: "/nudos/ocho-chicote.png", nombre: "Ocho por chicote", uso: "Encordarse al arnés" },
  { id: "ocho-seno", foto: "/nudos/ocho-seno.png", nombre: "Ocho por seno", uso: "Autoasegurarse en una reunión" },
  { id: "ocho-unir-cuerdas", foto: "/nudos/ocho-unir-cuerdas.png", nombre: "Ocho enfrentado", uso: "Unir dos cuerdas para rapelar" },
  { id: "dinamico", foto: "/nudos/dinamico.png", nombre: "Dinámico (UIAA)", uso: "Asegurar al compañero con un mosquetón HMS" },
  { id: "ballestrinque", foto: "/nudos/ballestrinque.png", nombre: "Ballestrinque", uso: "Autoaseguro regulable sin sacarlo del mosquetón" },
  { id: "cinta", foto: "/nudos/cinta.png", nombre: "Nudo de cinta", uso: "Unir los extremos de una cinta plana" },
  { id: "gaza-chicote", foto: "/nudos/gaza-chicote.png", nombre: "Gaza por chicote", uso: "Nudo auxiliar para encordarse o hacer anillos" },
  { id: "gaza-seno", foto: "/nudos/gaza-seno.png", nombre: "Gaza por seno", uso: "Hacer una gaza rápida como nudo auxiliar" },
  { id: "gaza-cordino", foto: "/nudos/gaza-cordino.png", nombre: "Gaza para cordino", uso: "Cerrar un cordino en un anillo" },
  { id: "alondra", foto: "/nudos/alondra.png", nombre: "Alondra", uso: "Anclajes en nieve y cabos de autoseguro" },
  { id: "machard-simple", foto: "/nudos/machard-simple.png", nombre: "Machard simple", uso: "Autobloqueante con gran agarre en cuerda mojada" },
  { id: "machard-doble", foto: "/nudos/machard-doble.png", nombre: "Machard doble", uso: "Autobloqueante que desliza muy bien" },
  { id: "prusik", foto: "/nudos/prusik.png", nombre: "Prusik", uso: "Subir o bajar por cuerda fija y rescates" },
];

export const photoById = (id: string) => KNOT_PHOTOS.find((k) => k.id === id);

// Marca en el contenido del módulo: <!-- identificar:ocho-chicote,ocho-seno -->
const MARKER = /<!--\s*identificar:([\w,-]+)\s*-->/;

export function parseIdentifyMarker(content: string): { ids: string[]; content: string } {
  const m = content.match(MARKER);
  const ids = m ? m[1].split(",").filter((id) => photoById(id)) : [];
  return { ids, content: content.replace(MARKER, "").trimEnd() };
}
