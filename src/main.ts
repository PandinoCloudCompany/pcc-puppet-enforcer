import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

import awsLambdaFastify, {
  LambdaResponse,
  PromiseHandler,
} from 'aws-lambda-fastify';
import { fastify, FastifyInstance, FastifyServerOptions } from 'fastify';
import compression from 'fastify-compress';
import { nanoid } from 'nanoid';
import 'reflect-metadata';
import { AppModule } from './app.module.js';
import { BaseErrorFilter } from './filters/base.exception.filter.js';

interface NestApp {
  app: NestFastifyApplication;
  instance: FastifyInstance;
}

let cachedNestApp: NestApp;
let cachedProxy: PromiseHandler<unknown, LambdaResponse>;

async function bootstrapServer(): Promise<NestApp> {
  const serverOptions: FastifyServerOptions = {
    logger: true,
    // requestIdHeader: 'x-request-id',
    genReqId: (request): string => {
      // if (request.headers['x-request-id'] !== '')
      //   return `${request.headers['x-request-id']}`;
      return nanoid();
    },
  };
  const instance: FastifyInstance = fastify(serverOptions);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(instance),
    { bufferLogs: true },
  );
  app.setGlobalPrefix(process.env.API_PREFIX);
  app.useGlobalFilters(new BaseErrorFilter());
  await app.init();
  return { app, instance };
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  if (!cachedNestApp) {
    cachedNestApp = await bootstrapServer();
  }
  if (!cachedProxy) {
    cachedProxy = awsLambdaFastify(cachedNestApp.instance, {
      decorateRequest: true,
    });
    await cachedNestApp.instance.ready();
  }
  return cachedProxy(event, context);
};

async function bootstrap(): Promise<void> {
  if (!cachedNestApp) {
    cachedNestApp = await bootstrapServer();
  }
  await cachedNestApp.app.register(compression, {
    encodings: ['gzip', 'deflate'],
  });
  cachedNestApp.app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  await cachedNestApp.app.listen(3000);
}

if (process.env.RUN_STANDALONE) bootstrap();
