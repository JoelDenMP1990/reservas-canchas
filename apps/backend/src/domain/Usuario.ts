export abstract class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: string,
    public readonly telefono: string,
  ) {}
}
