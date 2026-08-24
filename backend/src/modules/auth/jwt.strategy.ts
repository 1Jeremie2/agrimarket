import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// Le payload JWT contient uniquement l'id utilisateur (sub) et son rôle.
// À chaque requête protégée, on revérifie que l'utilisateur existe toujours
// (évite qu'un token reste valide après suppression/suspension du compte).
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { producer: true },
    });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    const { password, ...safeUser } = user;
    return safeUser; // injecté dans request.user
  }
}
