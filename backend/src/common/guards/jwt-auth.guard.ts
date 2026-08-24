import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protège une route : sans token valide → 401 automatique.
// Usage : @UseGuards(JwtAuthGuard) sur un contrôleur ou une méthode.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
