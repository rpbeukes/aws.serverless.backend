import 'source-map-support/register';
import { createLambdaHandler, APIGatewayProxyHandlerWrapper } from '../../middleware/shared-middleware-pipeline';
import {
  createTableNameFromPrefix,
  createDocumentClientOptions
} from '../../shared/dynamoHelpers';
import { DynamoDB } from 'aws-sdk';
import * as HttpStatus from 'http-status-codes';
import { InternalServerError, NotFound } from 'http-errors';
import { Item } from '../../dataModels';
import { loadById } from '../../services/database';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const lambda: APIGatewayProxyHandlerWrapper = async ({ pathParameters }) => {
    if (!pathParameters || !pathParameters.id) {
      throw new InternalServerError(
        'getItemByIdHandler() failed due to missing ID parameter'
      );
    }

    let item = await loadById<Item>(createTableNameFromPrefix('Item'), pathParameters.id);
    
    if (!item) {
      throw new NotFound();
    }

    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );

    var params: DocumentClient.QueryInput = {
      TableName: createTableNameFromPrefix('Item'),
      KeyConditionExpression: 'id = :v_id',
      ExpressionAttributeValues: {
        ':v_id': pathParameters && pathParameters.id 
      },
      ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
    };

    const data = await docClient.query(params).promise();

    return {
      statusCode: HttpStatus.OK,
      body: data && data.Items && data.Items[0]
    };
};

export const lambdaHandler = createLambdaHandler(lambda);
