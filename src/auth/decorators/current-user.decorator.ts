import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur pour récupérer l'utilisateur actuellement authentifié depuis la requête
 * L'utilisateur est injecté par JwtStrategy après validation du token
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: any) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
