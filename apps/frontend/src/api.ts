const API_BASE = '/api';

export interface Cancha {
  id: string;
  nombre: string;
  tipo: string;
  tarifaBase: number;
  ubicacion: string;
}

export interface Reserva {
  id: string;
  clienteId: string;
  canchaId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioTotal: number;
  estado: string;
}

async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.error ?? 'Error inesperado');
  }
  return datos as T;
}

export const api = {
  listarCanchas(): Promise<Cancha[]> {
    return fetch(`${API_BASE}/canchas`).then((r) => manejarRespuesta<Cancha[]>(r));
  },

  registrarCancha(datos: {
    nombre: string;
    tipo: string;
    tarifaBase: number;
    ubicacion: string;
  }): Promise<Cancha> {
    return fetch(`${API_BASE}/canchas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }).then((r) => manejarRespuesta<Cancha>(r));
  },

  cotizar(canchaId: string, horaInicio: string): Promise<{ precio: number }> {
    const params = new URLSearchParams({ canchaId, horaInicio });
    return fetch(`${API_BASE}/reservas/cotizacion?${params.toString()}`).then((r) =>
      manejarRespuesta<{ precio: number }>(r),
    );
  },

  crearReserva(datos: {
    clienteId: string;
    canchaId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }): Promise<Reserva> {
    return fetch(`${API_BASE}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }).then((r) => manejarRespuesta<Reserva>(r));
  },

  cancelarReserva(id: string): Promise<{ ok: boolean }> {
    return fetch(`${API_BASE}/reservas/${id}/cancelar`, { method: 'POST' }).then((r) =>
      manejarRespuesta<{ ok: boolean }>(r),
    );
  },
};
