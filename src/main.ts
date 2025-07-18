import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser())

  app.enableCors({
    origin: ['https://event-coordination-client.vercel.app', "http://localhost:5173", "https://fluffy-lollipop-94cfc5.netlify.app"],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
