import { CanchaService } from '../../src/application/CanchaService';
import { InMemoryCanchaRepository } from '../../src/infrastructure/repositories/InMemoryCanchaRepository';
import { TipoCancha } from '../../src/domain/TipoCancha';

describe('CanchaService', () => {
  test('registra una cancha nueva y queda disponible en el listado (UC3)', () => {
    const repositorio = new InMemoryCanchaRepository();
    const service = new CanchaService(repositorio);

    const cancha = service.registrarCancha('Cancha Sur', TipoCancha.TENIS, 25, 'Zona Sur');

    expect(cancha.id).toBeDefined();
    expect(service.listarTodas()).toContainEqual(cancha);
  });
});
