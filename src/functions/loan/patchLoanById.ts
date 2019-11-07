import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import {
  createTableNameFromPrefix
} from '../../shared/dynamoHelpers';
import * as HttpStatus from 'http-status-codes';
import { InternalServerError, NotFound } from 'http-errors';
import { Loan, CreateLoanModel } from '../../dataModels';
import { loadById } from '../../services/database';

const lambda: APIGatewayProxyHandler = async event => {
  let response;

  try {
    
    console.log('patchLoanHandler executed!');

    if (!event.pathParameters || !event.pathParameters.id) {
      throw new InternalServerError(
        'patchLoanHandler() failed due to missing ID parameter'
      );
    }
  
    let table = createTableNameFromPrefix('Loan');
    let loan = await loadById<Loan>(table, event.pathParameters.id);
    
    if (!loan) {
      throw new NotFound();
    }

    let model = event.body && JSON.parse(event.body) as CreateLoanModel;

    let up = await patchUpdate<Loan>(table, event.pathParameters.id);
    // var params: DynamoDB.Types.QueryInput = {
    //   TableName: createTableNameFromPrefix('Load'),
    //   KeyConditionExpression: 'id = :v_id',
    //   ExpressionAttributeValues: {
    //     ':v_id': id as any // had to cast to any, to shut up typescript
    //   },
    //   ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
    // };
    
    // const params: PutItemInput = {
    //   TableName: createTableNameFromPrefix('Loan'),
    //   Item: body as any // 'as any' so aws-sdk automatically assign attribute maps
    // };

    // await docClient.(params).promise();

    response = {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(loan)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

export const lambdaHandler = createLambdaHandler(lambda);
