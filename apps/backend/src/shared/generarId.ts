let contador = 0;

export function generarId(prefijo: string): string {
  contador += 1;
  return `${prefijo}-${Date.now()}-${contador}`;
}
