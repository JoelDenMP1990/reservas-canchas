import { Reserva } from '../../domain/Reserva';
import { ReservaRepository } from '../../application/ports/ReservaRepository';

export class InMemoryReservaRepository implements ReservaRepository {
  private readonly reservas = new Map<string, Reserva>();

  guardar(reserva: Reserva): void {
    this.reservas.set(reserva.id, reserva);
  }

  buscarPorId(id: string): Reserva | undefined {
    return this.reservas.get(id);
  }

  listarPorCliente(clienteId: string): Reserva[] {
    return [...this.reservas.values()].filter((r) => r.clienteId === clienteId);
  }

  listarPorCancha(canchaId: string): Reserva[] {
    return [...this.reservas.values()].filter((r) => r.canchaId === canchaId);
  }
}
