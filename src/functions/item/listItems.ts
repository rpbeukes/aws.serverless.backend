import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as HttpStatus from 'http-status-codes';
import {
  createTableNameFromPrefix,
  createDocumentClientOptions
} from '../../shared/dynamoHelpers';

const lambda: APIGatewayProxyHandler = async () => {
  let response;

  try {
    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );

    let scanParams: DocumentClient.ScanInput = {
      TableName: createTableNameFromPrefix('Item')
    };

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
};

export const lambdaHandler = createLambdaHandler(lambda);