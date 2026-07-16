import { EstrategiaTarifa } from '../domain/tarifa/EstrategiaTarifa';
import { TarifaEstandar } from '../domain/tarifa/TarifaEstandar';
import { TarifaHorarioPico } from '../domain/tarifa/TarifaHorarioPico';
import { TarifaPromocional } from '../domain/tarifa/TarifaPromocional';

const HORA_INICIO_VALLE = 6;
const HORA_FIN_VALLE = 10;
const HORA_INICIO_PICO = 18;
const HORA_FIN_PICO = 22;

// Único punto de decisión que queda tras el refactor: a qué franja horaria (valle/pico/normal)
// pertenece la reserva. Ya no depende del tipo de cancha — esa variación vive dentro de cada
// EstrategiaTarifa. Agregar una nueva franja (p. ej. temporada alta) es agregar una estrategia
// nueva, sin tocar esta selección ni las estrategias existentes (OCP).
export class SelectorEstrategiaTarifa {
  private readonly estandar = new TarifaEstandar();
  private readonly pico = new TarifaHorarioPico();
  private readonly promocional = new TarifaPromocional();

  seleccionar(horaInicio: string): EstrategiaTarifa {
    const horaNum = parseInt(horaInicio.split(':')[0], 10);
    if (horaNum >= HORA_INICIO_VALLE && horaNum < HORA_FIN_VALLE) {
      return this.promocional;
    }
    if (horaNum >= HORA_INICIO_PICO && horaNum < HORA_FIN_PICO) {
      return this.pico;
    }
    return this.estandar;
  }
}
