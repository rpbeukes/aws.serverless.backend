import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';

export const lambdaHandler: APIGatewayProxyHandler = async () => {
  let response;
  
  try {
    response = {
      statusCode: 200,
      body: JSON.stringify('ToDo: Add some loan status data'),
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:8080'
      }
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
}
