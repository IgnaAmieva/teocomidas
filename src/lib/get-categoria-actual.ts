import type { Categoria } from "./types";

export function getCategoriaActual(): Categoria {
  const hora = new Date().getHours();
  if (hora >= 7 && hora < 11) return "desayuno";
  if (hora >= 11 && hora < 16) return "almuerzo";
  if (hora >= 16 && hora < 20) return "merienda";
  return "cena";
}

export const categoriaLabels: Record<Categoria, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

export const categoriaEmojis: Record<Categoria, string> = {
  desayuno: "\u2615",
  almuerzo: "\uD83C\uDF55",
  merienda: "\uD83E\uDDC1",
  cena: "\uD83C\uDF19",
};
