import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@app/app.module';
import { logger } from '@app/logging';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger
  });

  const options = new DocumentBuilder()
  .setTitle('StudyHall API')
  .setDescription('StudyHall API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, options);

  if (process.env.NODE_ENV?.toLowerCase() !== 'production') {
    SwaggerModule.setup('documentation', app, document);
    SwaggerModule.setup('/', app, document);
  }

  await app.listen(3000);
}
bootstrap();
