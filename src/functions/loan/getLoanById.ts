import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import { createDocumentClientOptions, createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import { InternalServerError, NotFound, Forbidden } from 'http-errors';
import { DynamoDB } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as HttpStatus from 'http-status-codes';
import { loadById } from '../../services/database';
import { Loan } from '../../dataModels';
import { getUsername, isAdminUser } from '../../authentication';

const lambda: APIGatewayProxyHandler = async (event) => {
    if (!event.pathParameters || !event.pathParameters.id) {
      throw new InternalServerError(
        'getLoanByIdHandler() failed due to missing ID parameter'
      );
    }

    const tableName = createTableNameFromPrefix('Loan');
    let loan = await loadById<Loan>(tableName, event.pathParameters.id);

    if (!loan) {
      throw new NotFound();
    }

    const user = getUsername(event.requestContext);
    
    const hasPrivilege  = isAdminUser(event.requestContext) || user === loan.user;
    if (!hasPrivilege) {
      throw new Forbidden(`You do not have permission to view this loan`);
    }
    const docClient = new DynamoDB.DocumentClient(
      createDocumentClientOptions()
    );

    var params: DocumentClient.QueryInput = {
      TableName: tableName,
      KeyConditionExpression: 'id = :v_id',
      ExpressionAttributeValues: {
        ':v_id': event.pathParameters.id
      },
      ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
    };

    const data = await docClient.query(params).promise();

    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify((data && data.Items && data.Items[0]) || null)
    };

}

export const lambdaHandler = createLambdaHandler(lambda);
