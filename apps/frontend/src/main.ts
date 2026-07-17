import { api, Cancha } from './api';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

let notificaciones: { mensaje: string; hora: string }[] = [];
let notificacionesSinLeer = 0;

app.innerHTML = `
  <header>
    <h1>Sistema de Reservas de Canchas Deportivas</h1>
    <p class="subtitulo">Grupo 1 · Dominio D1 · datos en memoria</p>
  </header>

  <main>
    <section id="vista-inicio" class="vista">
      <p class="pregunta">¿Qué quieres hacer hoy?</p>
      <div class="grid-modulos">
        <button type="button" class="tarjeta-modulo" data-destino="canchas">
          <div class="tarjeta-modulo-top">
            <span class="icono">▤</span>
            <span class="etiqueta-modulo">Módulo 1</span>
          </div>
          <h2>Canchas</h2>
          <p>Ver las canchas registradas y sus tarifas.</p>
          <div class="tarjeta-modulo-pie">
            <span class="meta" id="meta-canchas">— registradas</span>
            <span class="cta">Ver canchas →</span>
          </div>
        </button>

        <button type="button" class="tarjeta-modulo" data-destino="reservar">
          <div class="tarjeta-modulo-top">
            <span class="icono">📅</span>
            <span class="etiqueta-modulo">Módulo 2</span>
          </div>
          <h2>Reservar</h2>
          <p>Elige cancha, fecha y horario. Cotiza antes de confirmar.</p>
          <div class="tarjeta-modulo-pie">
            <span class="meta">Cotización en vivo</span>
            <span class="cta">Crear reserva →</span>
          </div>
        </button>

        <button type="button" class="tarjeta-modulo" data-destino="mis-reservas">
          <div class="tarjeta-modulo-top">
            <span class="icono">⏱</span>
            <span class="etiqueta-modulo">Módulo 3</span>
          </div>
          <h2>Mis reservas</h2>
          <p>Cancela una reserva con al menos 2 horas de anticipación.</p>
          <div class="tarjeta-modulo-pie">
            <span class="meta">Antelación mín. 2h</span>
            <span class="cta">Ver reservas →</span>
          </div>
        </button>

        <button type="button" class="tarjeta-modulo" data-destino="notificaciones">
          <div class="tarjeta-modulo-top">
            <span class="icono">🔔</span>
            <span class="etiqueta-modulo">Módulo 4</span>
          </div>
          <h2>Notificaciones</h2>
          <p>Avisos generados por tus acciones en esta sesión.</p>
          <div class="tarjeta-modulo-pie">
            <span class="meta" id="meta-notificaciones">Sin novedades</span>
            <span class="cta">Ver todas →</span>
          </div>
        </button>
      </div>
    </section>

    <section id="vista-canchas" class="vista oculta">
      <a href="#" class="volver" data-volver>← Volver al menú</a>

      <div class="tarjeta">
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
      </div>

      <div class="tarjeta">
        <h2>Canchas registradas</h2>
        <ul id="lista-canchas"></ul>
      </div>
    </section>

    <section id="vista-reservar" class="vista oculta">
      <a href="#" class="volver" data-volver>← Volver al menú</a>

      <div class="tarjeta">
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
      </div>
    </section>

    <section id="vista-mis-reservas" class="vista oculta">
      <a href="#" class="volver" data-volver>← Volver al menú</a>

      <div class="tarjeta">
        <h2>Mis reservas</h2>
        <p class="ayuda">Cancela una reserva ingresando su ID (lo obtienes al confirmarla en "Reservar").</p>
        <form id="form-cancelar-reserva">
          <label>ID de la reserva <input name="reservaId" id="input-reserva-id" required /></label>
          <button type="submit">Cancelar reserva</button>
        </form>
        <p class="mensaje" id="mensaje-cancelar-reserva"></p>
      </div>
    </section>

    <section id="vista-notificaciones" class="vista oculta">
      <a href="#" class="volver" data-volver>← Volver al menú</a>

      <div class="tarjeta">
        <h2>Notificaciones</h2>
        <ul id="lista-notificaciones" class="lista-notificaciones">
          <li class="vacio">Todavía no hay avisos en esta sesión.</li>
        </ul>
      </div>
    </section>
  </main>
`;

function navegarA(destino: string): void {
  document.querySelectorAll<HTMLElement>('.vista').forEach((vista) => vista.classList.add('oculta'));
  document.querySelector<HTMLElement>(`#vista-${destino}`)?.classList.remove('oculta');

  if (destino === 'notificaciones') {
    notificacionesSinLeer = 0;
    actualizarMetaNotificaciones();
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
}

function configurarNavegacion(): void {
  document.querySelectorAll<HTMLButtonElement>('.tarjeta-modulo').forEach((tarjeta) => {
    tarjeta.addEventListener('click', () => navegarA(tarjeta.dataset.destino!));
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-volver]').forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      evento.preventDefault();
      navegarA('inicio');
    });
  });
}

function registrarNotificacion(mensaje: string): void {
  const hora = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  notificaciones = [{ mensaje, hora }, ...notificaciones];
  notificacionesSinLeer += 1;

  const lista = document.querySelector<HTMLUListElement>('#lista-notificaciones')!;
  lista.innerHTML = notificaciones
    .map((n) => `<li><span class="hora">${n.hora}</span>${n.mensaje}</li>`)
    .join('');

  actualizarMetaNotificaciones();
}

function actualizarMetaNotificaciones(): void {
  const meta = document.querySelector<HTMLSpanElement>('#meta-notificaciones')!;
  meta.textContent = notificacionesSinLeer > 0 ? `${notificacionesSinLeer} sin leer` : 'Sin novedades';
}

async function refrescarCanchas(): Promise<Cancha[]> {
  const canchas = await api.listarCanchas();

  const lista = document.querySelector<HTMLUListElement>('#lista-canchas')!;
  lista.innerHTML = canchas
    .map((c) => `<li>${c.nombre} (${c.tipo}) — $${c.tarifaBase}/h — ${c.ubicacion} <code>${c.id}</code></li>`)
    .join('');

  const select = document.querySelector<HTMLSelectElement>('#select-cancha')!;
  select.innerHTML = canchas.map((c) => `<option value="${c.id}">${c.nombre} (${c.tipo})</option>`).join('');

  const metaCanchas = document.querySelector<HTMLSpanElement>('#meta-canchas')!;
  metaCanchas.textContent = `${canchas.length} registradas`;

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
      registrarNotificacion('Se registró una cancha nueva.');
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
      registrarNotificacion(`Reserva ${reserva.id} confirmada por $${reserva.precioTotal}.`);
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
    const reservaId = String(datos.get('reservaId'));
    try {
      await api.cancelarReserva(reservaId);
      mensaje.textContent = 'Reserva cancelada correctamente.';
      mensaje.className = 'mensaje exito';
      registrarNotificacion(`Reserva ${reservaId} cancelada.`);
    } catch (error) {
      mensaje.textContent = (error as Error).message;
      mensaje.className = 'mensaje error';
    }
  });
}

async function iniciar(): Promise<void> {
  configurarNavegacion();
  configurarFormularioRegistrarCancha();
  configurarFormularioCrearReserva();
  configurarFormularioCancelarReserva();
  await refrescarCanchas();
}

iniciar();
