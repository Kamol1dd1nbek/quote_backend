import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const start = async () => {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Quote app')
      .setDescription('Share your quotes easily')
      .addTag(
        'NodeJs NestJs Postgresql Prisma JWT OTP Email verification Swagger',
      )
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is runnig on port: ${PORT}`);
    });
  } catch (error) {
    console.log(error.data.message);
  }
};
start();
