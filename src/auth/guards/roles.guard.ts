import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupérer les rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles) {
      return true;
    }

    // Récupérer l'utilisateur depuis la requête (injecté par JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // Vérifier si l'utilisateur existe
    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur a l'un des rôles requis
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé. Rôles requis: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
