import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProducersModule } from './modules/producers/producers.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PlatformAccountsModule } from './modules/platform-accounts/platform-accounts.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { HeroImagesModule } from './modules/hero-images/hero-images.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProducersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    ReviewsModule,
    PlatformAccountsModule,
    UploadsModule,
    HeroImagesModule,
  ],
})
export class AppModule {}
