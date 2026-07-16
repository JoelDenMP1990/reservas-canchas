import { Cancha } from '../../domain/Cancha';

export interface CanchaRepository {
  guardar(cancha: Cancha): void;
  buscarPorId(id: string): Cancha | undefined;
  listarTodas(): Cancha[];
}
