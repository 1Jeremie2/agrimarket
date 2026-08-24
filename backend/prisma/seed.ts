// Crée le premier compte ADMIN. Ne passe jamais par l'API publique (POST /users
// refuse volontairement le rôle ADMIN — voir CreateUserDto).
//
// Usage : npx ts-node prisma/seed.ts
// Ou ajouter dans package.json : "seed": "ts-node prisma/seed.ts"

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@agri-marketplace.bj';
  const password = process.env.ADMIN_PASSWORD ?? 'ChangeMoi123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Un compte admin existe déjà pour ${email}, rien à faire.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: { email, password: hashedPassword, role: 'ADMIN' },
  });

  console.log(`Compte admin créé : ${admin.email}`);
  console.log(`Mot de passe : ${password} (à changer immédiatement après la première connexion)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
