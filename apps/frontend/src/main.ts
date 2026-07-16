import { api, Cancha } from './api';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <h1>Sistema de Reservas de Canchas Deportivas</h1>
    <p class="subtitulo">Grupo 1 · Dominio D1</p>
  </header>

  <main>
    <section class="tarjeta" id="seccion-registrar-cancha">
      <h2>Registrar Cancha (Administrador)</h2>
      <form id="form-registrar-cancha">
        <label>Nombre <input name="nombre" required /></label>
        <label>Tipo
          <select name="tipo" required>
            <option value="FUTBOL">Fútbol</option>
            <option value="BASQUET">Básquet</option>
            <option value="TENIS">Tenis</option>
            <option value="VOLEY">Vóley</option>
          </select>
        </label>
        <label>Tarifa base ($/hora) <input name="tarifaBase" type="number" min="1" required /></label>
        <label>Ubicación <input name="ubicacion" required /></label>
        <button type="submit">Registrar cancha</button>
      </form>
      <p class="mensaje" id="mensaje-registrar-cancha"></p>
    </section>

    <section class="tarjeta" id="seccion-crear-reserva">
      <h2>Crear Reserva (Cliente)</h2>
      <form id="form-crear-reserva">
        <label>Cliente (id) <input name="clienteId" value="cliente-1" required /></label>
        <label>Cancha
          <select name="canchaId" id="select-cancha" required></select>
        </label>
        <label>Fecha <input name="fecha" type="date" required /></label>
        <label>Hora inicio <input name="horaInicio" type="time" required /></label>
        <label>Hora fin <input name="horaFin" type="time" required /></label>
        <button type="button" id="boton-cotizar">Ver precio estimado</button>
        <p id="precio-estimado"></p>
        <button type="submit">Confirmar reserva</button>
      </form>
      <p class="mensaje" id="mensaje-crear-reserva"></p>
    </section>

    <section class="tarjeta" id="seccion-cancelar-reserva">
      <h2>Cancelar Reserva</h2>
      <form id="form-cancelar-reserva">
        <label>ID de la reserva <input name="reservaId" id="input-reserva-id" required /></label>
        <button type="submit">Cancelar reserva</button>
      </form>
      <p class="mensaje" id="mensaje-cancelar-reserva"></p>
    </section>

    <section class="tarjeta" id="seccion-canchas">
      <h2>Canchas registradas</h2>
      <ul id="lista-canchas"></ul>
    </section>
  </main>
`;

async function refrescarCanchas(): Promise<Cancha[]> {
  const canchas = await api.listarCanchas();

  const lista = document.querySelector<HTMLUListElement>('#lista-canchas')!;
  lista.innerHTML = canchas
    .map((c) => `<li>${c.nombre} (${c.tipo}) — $${c.tarifaBase}/h — ${c.ubicacion} <code>${c.id}</code></li>`)
    .join('');

  const select = document.querySelector<HTMLSelectElement>('#select-cancha')!;
  select.innerHTML = canchas.map((c) => `<option value="${c.id}">${c.nombre} (${c.tipo})</option>`).join('');

  return canchas;
}

function configurarFormularioRegistrarCancha(): void {
  const form = document.querySelector<HTMLFormElement>('#form-registrar-cancha')!;
  const mensaje = document.querySelector<HTMLParagraphElement>('#mensaje-registrar-cancha')!;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    try {
      await api.registrarCancha({
        nombre: String(datos.get('nombre')),
        tipo: String(datos.get('tipo')),
        tarifaBase: Number(datos.get('tarifaBase')),
        ubicacion: String(datos.get('ubicacion')),
      });
      mensaje.textContent = 'Cancha registrada correctamente.';
      mensaje.className = 'mensaje exito';
      form.reset();
      await refrescarCanchas();
    } catch (error) {
      mensaje.textContent = (error as Error).message;
      mensaje.className = 'mensaje error';
    }
  });
}

function configurarFormularioCrearReserva(): void {
  const form = document.querySelector<HTMLFormElement>('#form-crear-reserva')!;
  const mensaje = document.querySelector<HTMLParagraphElement>('#mensaje-crear-reserva')!;
  const precioEstimado = document.querySelector<HTMLParagraphElement>('#precio-estimado')!;
  const botonCotizar = document.querySelector<HTMLButtonElement>('#boton-cotizar')!;

  botonCotizar.addEventListener('click', async () => {
    const datos = new FormData(form);
    try {
      const { precio } = await api.cotizar(String(datos.get('canchaId')), String(datos.get('horaInicio')));
      precioEstimado.textContent = `Precio estimado: $${precio}`;
    } catch (error) {
      precioEstimado.textContent = (error as Error).message;
    }
  });

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    try {
      const reserva = await api.crearReserva({
        clienteId: String(datos.get('clienteId')),
        canchaId: String(datos.get('canchaId')),
        fecha: String(datos.get('fecha')),
        horaInicio: String(datos.get('horaInicio')),
        horaFin: String(datos.get('horaFin')),
      });
      mensaje.textContent = `Reserva confirmada (id: ${reserva.id}, precio: $${reserva.precioTotal}).`;
      mensaje.className = 'mensaje exito';

      const inputReservaId = document.querySelector<HTMLInputElement>('#input-reserva-id')!;
      inputReservaId.value = reserva.id;
    } catch (error) {
      mensaje.textContent = (error as Error).message;
      mensaje.className = 'mensaje error';
    }
  });
}

function configurarFormularioCancelarReserva(): void {
  const form = document.querySelector<HTMLFormElement>('#form-cancelar-reserva')!;
  const mensaje = document.querySelector<HTMLParagraphElement>('#mensaje-cancelar-reserva')!;

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    try {
      await api.cancelarReserva(String(datos.get('reservaId')));
      mensaje.textContent = 'Reserva cancelada correctamente.';
      mensaje.className = 'mensaje exito';
    } catch (error) {
      mensaje.textContent = (error as Error).message;
      mensaje.className = 'mensaje error';
    }
  });
}

async function iniciar(): Promise<void> {
  configurarFormularioRegistrarCancha();
  configurarFormularioCrearReserva();
  configurarFormularioCancelarReserva();
  await refrescarCanchas();
}

iniciar();
