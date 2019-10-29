import { APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { httpHeaderNormalizer } from 'middy/middlewares';
import { cors } from '../middleware/cors';

export const createLambdaHandler = (lambda: APIGatewayProxyHandler) =>
  middy(lambda)
    .use(httpHeaderNormalizer())
    .use(cors());
