import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from './sesion.service';

// soloAdministrador: si un Cliente intenta entrar por URL directa a una pantalla de
// administrador, lo devuelve a Reservas en vez de mostrarle la pantalla.
export const soloAdministrador: CanActivateFn = () => {
  const sesionService = inject(SesionService);
  const router = inject(Router);

  if (sesionService.obtener()?.rol === 'ADMINISTRADOR') {
    return true;
  }
  return router.parseUrl('/reservas');
};
