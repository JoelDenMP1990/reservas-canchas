import { Cancha } from './cancha.entity';

describe('Cancha', () => {
  it('estaDisponible() depende del campo activa', () => {
    const cancha = new Cancha();
    cancha.activa = true;
    expect(cancha.estaDisponible()).toBe(true);

    cancha.activa = false;
    expect(cancha.estaDisponible()).toBe(false);
  });

  it('esGratuita() es verdadero cuando la tarifa base es 0', () => {
    const cancha = new Cancha();
    cancha.tarifaBasePorHora = 0;
    expect(cancha.esGratuita()).toBe(true);

    cancha.tarifaBasePorHora = 15;
    expect(cancha.esGratuita()).toBe(false);
  });

  it('getTarifaBase() devuelve la tarifa como número', () => {
    const cancha = new Cancha();
    cancha.tarifaBasePorHora = 20;
    expect(cancha.getTarifaBase()).toBe(20);
  });
});
