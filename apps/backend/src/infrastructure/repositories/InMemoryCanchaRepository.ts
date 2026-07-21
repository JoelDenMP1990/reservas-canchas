import { Cancha } from '../../domain/Cancha';
import { CanchaRepository } from '../../application/ports/CanchaRepository';
1234
export class InMemoryCanchaRepository implements CanchaRepository {
  private readonly canchas = new Map<string, Cancha>();

  guardar(cancha: Cancha): void {
    this.canchas.set(cancha.id, cancha);
  }

  buscarPorId(id: string): Cancha | undefined {
    return this.canchas.get(id);
  }

  listarTodas(): Cancha[] {
    return [...this.canchas.values()];
  }
}
