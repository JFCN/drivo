import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AUTH_COOKIE_NAME } from './common/security/auth-cookie.service';
import { Env } from './config/env.validation';

export const configureApp = (app: NestExpressApplication): void => {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: config.get('WEB_ORIGIN', { infer: true }), credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();
};

export const configureSwagger = (app: INestApplication): void => {
  const document = new DocumentBuilder()
    .setTitle('Drivo API')
    .setDescription('API REST da garagem Drivo: autenticação, perfil, veículos e leitura de CRLV com Gemini.')
    .setVersion('1.0.0')
    .addCookieAuth(AUTH_COOKIE_NAME)
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, document), {
    jsonDocumentUrl: 'api/docs/openapi.json',
  });
};
