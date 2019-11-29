import { Handler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { httpHeaderNormalizer, httpErrorHandler, jsonBodyParser } from 'middy/middlewares';
import { cors } from '../middleware/cors';

const log = (position: 'start' | 'end', functionName: string, detailName: string, detail: any) =>
  console.info(`Invocation ${position} for handler ${functionName} with ${detailName}: ${JSON.stringify(detail, null, 2)}`);

export interface APIGatewayProxyResultBodyOptional extends Omit<APIGatewayProxyResult, 'body'> {
  body?: Record<string, any> | null;
}

export interface APIGatewayProxyEventBodyOptional extends Omit<APIGatewayProxyEvent, 'body'> {
  body?: Record<string, any> | null;
}

export interface APIGatewayProxyHandlerWrapper extends Handler<APIGatewayProxyEventBodyOptional, APIGatewayProxyResultBodyOptional> {
}

export const createLambdaHandler = (lambda: APIGatewayProxyHandlerWrapper) =>
  middy(lambda)
    .before((handler, next) => {
      log('start', handler.context.functionName, 'event', handler.event);
      next();
    })

    .use(httpHeaderNormalizer())
    .use(jsonBodyParser())
    .use(httpErrorHandler())
    .use(cors())

    .after((handler, next) => {
      log('end', handler.context.functionName, 'response', handler.response);
      // save myself the dreaded task of JSON.stringify the body on every lambda handler
      handler.response.body = JSON.stringify(handler.response.body) as any;
      next();
    })
  ;