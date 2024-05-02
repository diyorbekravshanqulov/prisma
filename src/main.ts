import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { LoggerFactory } from './common/logger/logger_factory';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: LoggerFactory('Passport'),
    });


    const PORT = process.env.PORT || 3030;
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(PORT || 3030, () => {
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
