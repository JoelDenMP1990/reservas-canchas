import { SelectorEstrategiaTarifa } from '../../src/application/SelectorEstrategiaTarifa';
import { TarifaEstandar } from '../../src/domain/tarifa/TarifaEstandar';
import { TarifaHorarioPico } from '../../src/domain/tarifa/TarifaHorarioPico';
import { TarifaPromocional } from '../../src/domain/tarifa/TarifaPromocional';

describe('SelectorEstrategiaTarifa', () => {
  const selector = new SelectorEstrategiaTarifa();

  test('selecciona TarifaPromocional en horario valle (6-10)', () => {
    expect(selector.seleccionar('07:00')).toBeInstanceOf(TarifaPromocional);
  });

  test('selecciona TarifaHorarioPico en horario pico (18-22)', () => {
    expect(selector.seleccionar('19:00')).toBeInstanceOf(TarifaHorarioPico);
  });

  test('selecciona TarifaEstandar fuera de los rangos valle/pico', () => {
    expect(selector.seleccionar('12:00')).toBeInstanceOf(TarifaEstandar);
  });
});
