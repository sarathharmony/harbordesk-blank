import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function resolvePort(): number {
  const argv = process.argv;
  const flag = argv.findIndex((a) => a === '--port' || a === '-p');
  if (flag >= 0 && argv[flag + 1]) {
    const n = Number(argv[flag + 1]);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // Engine process uses PORT=3002. Customer API is BACKEND_PORT or 3000.
  const n = Number(process.env.BACKEND_PORT);
  if (Number.isFinite(n) && n > 0) return n;
  return 3000;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = resolvePort();
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`[backend] HarborDesk serving SPA + API on http://0.0.0.0:${port}`);
}

void bootstrap();
