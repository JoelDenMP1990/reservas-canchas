import { Router } from 'express';
import { CanchaService } from '../../application/CanchaService';

export function crearCanchasRouter(canchaService: CanchaService): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(canchaService.listarTodas());
  });

  router.post('/', (req, res) => {
    try {
      const { nombre, tipo, tarifaBase, ubicacion } = req.body;
      const cancha = canchaService.registrarCancha(nombre, tipo, tarifaBase, ubicacion);
      res.status(201).json(cancha);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  return router;
}
