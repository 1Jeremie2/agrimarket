import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Récupère l'utilisateur injecté par JwtStrategy.validate() dans request.user
// Usage : create(@CurrentUser() user: AuthenticatedUser)
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
