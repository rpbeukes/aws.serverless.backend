import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import { createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import { loadAllByQuery } from '../../services/database';
import { Loan } from '../../dataModels';
import { InternalServerError, NotFound } from 'http-errors';

const lambda: APIGatewayProxyHandler = async (event) => {

  if (!event.pathParameters || !event.pathParameters.status) {
    throw new InternalServerError(
      'getLoanByStatusHandler() failed due to missing STATUS parameter'
    );
  }

  const tableName = createTableNameFromPrefix('Loan');
  let loans = await loadAllByQuery<Loan>(tableName, 'status', event.pathParameters.status);

  if (!loans) {
    throw new NotFound();
  }
  
  return {
      statusCode: 200,
      body: JSON.stringify(loans)
    };
}

export const lambdaHandler = createLambdaHandler(lambda);