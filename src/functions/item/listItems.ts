import { DynamoDB } from 'aws-sdk';
import 'source-map-support/register';
import { createLambdaHandler, APIGatewayProxyHandlerWrapper } from '../../middleware/shared-middleware-pipeline';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as HttpStatus from 'http-status-codes';
import {
  createTableNameFromPrefix,
  createDocumentClientOptions
} from '../../shared/dynamoHelpers';

const lambda: APIGatewayProxyHandlerWrapper = async () => {

    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );

    let scanParams: DocumentClient.ScanInput = {
      TableName: createTableNameFromPrefix('Item')
    };

    const dataResponse = await docClient.scan(scanParams).promise();

    return {
      statusCode: HttpStatus.OK,
      body: dataResponse.Items
    };
  
};

export const lambdaHandler = createLambdaHandler(lambda);
