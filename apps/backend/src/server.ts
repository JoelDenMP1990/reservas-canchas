import express from 'express';
import cors from 'cors';
import { InMemoryCanchaRepository } from './infrastructure/repositories/InMemoryCanchaRepository';
import { InMemoryReservaRepository } from './infrastructure/repositories/InMemoryReservaRepository';
import { CanchaService } from './application/CanchaService';
import { ReservaService } from './application/ReservaService';
import { NotificacionService } from './application/NotificacionService';
import { crearCanchasRouter } from './api/routes/canchas.routes';
import { crearReservasRouter } from './api/routes/reservas.routes';

const canchaRepository = new InMemoryCanchaRepository();
const reservaRepository = new InMemoryReservaRepository();
const notificacionService = new NotificacionService();
const canchaService = new CanchaService(canchaRepository);
const reservaService = new ReservaService(reservaRepository, canchaRepository, notificacionService);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/canchas', crearCanchasRouter(canchaService));
app.use('/api/reservas', crearReservasRouter(reservaService));

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API escuchando en http://localhost:${PORT}`);
});
