

import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

/**
 * Función Guard para proteger rutas que requieren autenticación.
 * Verifica si el usuario tiene un código operativo válido.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isUserAuthenticated = authService.getCodigoEncuestador().trim().length > 0;

  if (isUserAuthenticated) {
    return true; 
  } else {
    return router.createUrlTree(['/login']);
  }
};