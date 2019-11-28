import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';

const lambda: APIGatewayProxyHandler = async () => {

  return {
      statusCode: 200,
      body: JSON.stringify('ToDo: Add some loan status data')
    };
}

export const lambdaHandler = createLambdaHandler(lambda);