import { APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { httpHeaderNormalizer, httpErrorHandler } from 'middy/middlewares';
import { cors } from '../middleware/cors';

export const createLambdaHandler = (lambda: APIGatewayProxyHandler) =>
  middy(lambda)
    .use(httpHeaderNormalizer())
    .use(httpErrorHandler())
    .use(cors());
