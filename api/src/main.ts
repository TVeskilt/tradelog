import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (web package)
  app.enableCors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 API server running on http://localhost:${port}`);
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
}

bootstrap();
