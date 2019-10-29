import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { dataSample } from '../../../sample-data/dataSample';
import { createLambdaHandler } from '../../../middleware/shared-middleware-pipeline';

const lambda: APIGatewayProxyHandler = async (event, _context) => {
  let response;
  
  let filter = dataSample.filter(sample => sample.id === (<any>event.pathParameters).id)
  let data = filter && filter.length > 0 && filter[0];

  try {
    response = {
      statusCode: 200,
      body: JSON.stringify(data || null)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
}

export const lambdaHandler = createLambdaHandler(lambda);
