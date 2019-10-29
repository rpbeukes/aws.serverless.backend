import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../../middleware/shared-middleware-pipeline';

const lambda: APIGatewayProxyHandler = async () => {
  let response;
  
  try {
    response = {
      statusCode: 200,
      body: JSON.stringify('ToDo: Add some loan id data')
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
}

export const lambdaHandler = createLambdaHandler(lambda);
