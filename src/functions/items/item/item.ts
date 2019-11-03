import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import { createLambdaHandler } from '../../../middleware/shared-middleware-pipeline';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as HttpStatus from 'http-status-codes';

const lambda: APIGatewayProxyHandler = async () => {
  let response;

  try {

    const tableName = process.env && process.env.TABLE_PREFIX && process.env.TABLE_PREFIX + 'Item' || '';
    if (tableName === '') throw Error('Failed to read process.env.TABLE_PREFIX');
    
    const docClient = new DynamoDB.DocumentClient({ region: process.env.REGION, apiVersion: '2012-08-10' });

    let scanParams: DocumentClient.ScanInput = {
        TableName: tableName 
    }

    const dataResponse = await docClient.scan(scanParams).promise();

    response = {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(dataResponse.Items)
    };

  } catch (err) {
    console.log(err);
    return err;
    /* debug
      response = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        body: JSON.stringify(err)
      };
    */
  }

  return response;
}

export const lambdaHandler = createLambdaHandler(lambda);