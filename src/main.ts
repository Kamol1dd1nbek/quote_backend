import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

const start = async () => {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is runnig on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
