import { Cancha } from '../domain/Cancha';
import { TipoCancha } from '../domain/TipoCancha';
import { CanchaRepository } from './ports/CanchaRepository';
import { generarId } from '../shared/generarId';

export class CanchaService {
  constructor(private readonly canchaRepository: CanchaRepository) {}

  registrarCancha(
    nombre: string,
    tipo: TipoCancha,
    tarifaBase: number,
    ubicacion: string,
  ): Cancha {
    const cancha = new Cancha(generarId('cancha'), nombre, tipo, tarifaBase, ubicacion);
    this.canchaRepository.guardar(cancha);
    return cancha;
  }

  listarTodas(): Cancha[] {
    return this.canchaRepository.listarTodas();
  }
}
