import { Reserva } from '../../domain/Reserva';

export interface ReservaRepository {
  guardar(reserva: Reserva): void;
  buscarPorId(id: string): Reserva | undefined;
  listarPorCliente(clienteId: string): Reserva[];
  listarPorCancha(canchaId: string): Reserva[];
}
