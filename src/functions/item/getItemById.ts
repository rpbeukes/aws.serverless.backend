import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import {
  createTableNameFromPrefix,
  createDocumentClientOptions
} from '../../shared/dynamoHelpers';
import { DynamoDB } from 'aws-sdk';
import * as HttpStatus from 'http-status-codes';
import { InternalServerError, NotFound } from 'http-errors';
import { Item } from '../../dataModels';
import { loadById } from '../../services/database';

const lambda: APIGatewayProxyHandler = async ({ pathParameters }) => {
  let response;

  try {
    
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

    var params: DynamoDB.Types.QueryInput = {
      TableName: createTableNameFromPrefix('Item'),
      KeyConditionExpression: 'id = :v_id',
      ExpressionAttributeValues: {
        ':v_id': pathParameters && (pathParameters.id as any) // had to cast to any, to shut up typescript
      },
      ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
    };

    const data = await docClient.query(params).promise();

    response = {
      statusCode: HttpStatus.OK,
      body: JSON.stringify((data && data.Items && data.Items[0]) || null)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

export const lambdaHandler = createLambdaHandler(lambda);
