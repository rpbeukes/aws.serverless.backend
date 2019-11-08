import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import {
  createTableNameFromPrefix
} from '../../shared/dynamoHelpers';
import * as HttpStatus from 'http-status-codes';
import { InternalServerError, NotFound } from 'http-errors';
import { Loan, PatchLoanModel } from '../../dataModels';
import { loadById, patchUpdate } from '../../services/database';

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

    const model = (event.body && JSON.parse(event.body)) as PatchLoanModel;

    let patchedLoan = await patchUpdate<Loan>(table, event.pathParameters.id, model);

    response = {
      statusCode: HttpStatus.OK,
      body: JSON.stringify(patchedLoan)
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

export const lambdaHandler = createLambdaHandler(lambda);
