import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseAuthProvider } from './auth/supabase.provider';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [SupabaseAuthProvider, AuthService],
})
class SeedAdminModule {}

async function bootstrap() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Uso: npm run seed:admin -- <email> <password>');
    console.error(
      'Ejemplo: npm run seed:admin -- admin@correo.com MiPassword123',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(SeedAdminModule);
  const authService = app.get(AuthService);

  try {
    const result = await authService.createAdmin({ email, password });
    console.log('Primer usuario admin creado exitosamente:');
    console.log(`  Email: ${result.user.email}`);
    console.log(`  Role: ${result.user.role}`);
  } catch (error) {
    console.error('Error al crear admin:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
