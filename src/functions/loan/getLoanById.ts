import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import { createDocumentClientOptions, createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import { DynamoDB } from 'aws-sdk';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';
import * as HttpStatus from 'http-status-codes';

const lambda: APIGatewayProxyHandler = async (event) => {
  let response;
  
  try {
    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );
    
    const data = JSON.parse(event.body as string);

    const params: PutItemInput = {
      TableName: createTableNameFromPrefix('Item'),
      Item: data as any // 'as any' so aws-sdk automatically assign attribute maps
    };

    await docClient.put(params).promise();

    response = {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(data)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
}

export const lambdaHandler = createLambdaHandler(lambda);
