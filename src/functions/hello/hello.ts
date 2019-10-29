import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from '../../middleware/cors';

const lambda: APIGatewayProxyHandler = async (event, _context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
        input: event
      },
      null,
      2
    )
  };
};

export const lambdaHandler = middy(lambda).use(cors());
