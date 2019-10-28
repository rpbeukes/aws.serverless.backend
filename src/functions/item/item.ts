import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { dataSample } from '../../sample-data/dataSample';

export const lambdaHandler: APIGatewayProxyHandler = async () => {
  let response;

  try {
    response = {
      statusCode: 200,
      body: JSON.stringify(dataSample),
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
