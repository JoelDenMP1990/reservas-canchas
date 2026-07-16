import { Router } from 'express';
import { ReservaService } from '../../application/ReservaService';

export function crearReservasRouter(reservaService: ReservaService): Router {
  const router = Router();

  router.get('/cotizacion', (req, res) => {
    try {
      const canchaId = String(req.query.canchaId ?? '');
      const horaInicio = String(req.query.horaInicio ?? '');
      const precio = reservaService.cotizarPrecio(canchaId, horaInicio);
      res.json({ precio });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.post('/', (req, res) => {
    try {
      const { clienteId, canchaId, fecha, horaInicio, horaFin } = req.body;
      const reserva = reservaService.crearReserva(clienteId, canchaId, fecha, horaInicio, horaFin);
      res.status(201).json(reserva);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  router.post('/:id/cancelar', (req, res) => {
    try {
      reservaService.cancelarReserva(req.params.id);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}
