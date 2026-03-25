import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseAuthProvider } from './auth/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { Role } from './auth/enums/role.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [SupabaseAuthProvider],
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
  const supabase = app.get<SupabaseClient>('SUPABASE_AUTH');

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      app_metadata: { role: Role.SUPER_ADMIN },
      email_confirm: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Super admin creado exitosamente:');
    console.log(`  Email: ${data.user.email}`);
    console.log(`  Role: super_admin`);
  } catch (error) {
    console.error('Error al crear super admin:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
