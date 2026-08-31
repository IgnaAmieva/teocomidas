/**
 * Genera los horarios disponibles para pedir, en slots de 15 minutos
 * dentro del rango de apertura del local.
 */

const APERTURA = 8; // 08:00
const CIERRE = 23;  // 23:00
const SLOT_MINUTOS = 15;

export function getHorariosDisponibles(): string[] {
  const ahora = new Date();
  const horaActual = ahora.getHours();
  const minutoActual = ahora.getMinutes();

  const horarios: string[] = [];

  for (let h = APERTURA; h < CIERRE; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTOS) {
      // Solo mostrar horarios futuros (al menos 15 min desde ahora)
      if (h < horaActual || (h === horaActual && m <= minutoActual)) {
        continue;
      }
      const hStr = String(h).padStart(2, "0");
      const mStr = String(m).padStart(2, "0");
      horarios.push(`${hStr}:${mStr}`);
    }
  }

  return horarios;
}

export function isLocalAbierto(): boolean {
  const hora = new Date().getHours();
  return hora >= APERTURA && hora < CIERRE;
}
