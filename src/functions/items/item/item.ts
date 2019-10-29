import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { dataSample } from '../../../sample-data/dataSample';
import { createLambdaHandler } from '../../../middleware/shared-middleware-pipeline';

const lambda: APIGatewayProxyHandler = async () => {
  let response;

  try {
    response = {
      statusCode: 200,
      body: JSON.stringify(dataSample)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
}

export const lambdaHandler = createLambdaHandler(lambda);