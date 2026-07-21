import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Cliente } from './cliente.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { EditarClienteDto } from './dto/editar-cliente.dto';
import { Reserva } from '../reservas/reserva.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
  ) {}

  listar(): Promise<Cliente[]> {
    return this.clientesRepository.find();
  }

  async obtenerPorId(id: string): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  crear(dto: CrearClienteDto): Promise<Cliente> {
    const cliente = this.clientesRepository.create(dto);
    return this.clientesRepository.save(cliente);
  }

  async editar(id: string, dto: EditarClienteDto): Promise<Cliente> {
    const cliente = await this.obtenerPorId(id);
    Object.assign(cliente, dto);
    return this.clientesRepository.save(cliente);
  }

  async eliminar(id: string): Promise<void> {
    const cliente = await this.obtenerPorId(id);
    await this.clientesRepository.remove(cliente);
  }

  // getReservasActivas(): reservas del cliente que todavía no están canceladas.
  getReservasActivas(clienteId: string): Promise<Reserva[]> {
    return this.reservasRepository.find({
      where: { cliente: { id: clienteId }, estado: Not('CANCELADA') },
      relations: ['cancha'],
    });
  }
}
