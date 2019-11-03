import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../../middleware/shared-middleware-pipeline';
import {
  createTableNameFromPrefix,
  createDocumentClientOptions
} from '../../../shared/dynamoHelpers';
import { DynamoDB } from 'aws-sdk';

const lambda: APIGatewayProxyHandler = async (event, _context) => {
  let response;

  try {
    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );

    var params: DynamoDB.Types.QueryInput = {
      TableName: createTableNameFromPrefix('Item'),
      KeyConditionExpression: 'id = :v_id',
      ExpressionAttributeValues: {
        ':v_id': (<any>event.pathParameters).id
      },
      ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
    };

    const data = await docClient.query(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify((data && data.Items && data.Items[0]) || null)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

export const lambdaHandler = createLambdaHandler(lambda);
