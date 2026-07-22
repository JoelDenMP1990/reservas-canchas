import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';

describe('ClientesService', () => {
  let service: ClientesService;

  const mockClientesRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockClientesRepository,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('listar()', () => {
    it('debería retornar una lista de clientes', async () => {
      const listaMock = [{ id: '1', nombre: 'Bryan' }];
      mockClientesRepository.find.mockResolvedValue(listaMock);

      const resultado = await service.listar();
      expect(resultado).toEqual(listaMock);
      expect(mockClientesRepository.find).toHaveBeenCalled();
    });
  });
});