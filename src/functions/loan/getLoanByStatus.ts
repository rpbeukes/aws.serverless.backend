import 'source-map-support/register';
import { createLambdaHandler, APIGatewayProxyHandlerWrapper } from '../../middleware/shared-middleware-pipeline';
import { createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import { loadAllByQuery } from '../../services/database';
import { Loan } from '../../dataModels';
import { InternalServerError, NotFound } from 'http-errors';
import { getUsername, isAdminUser } from '../../authentication';
import * as HttpStatus from 'http-status-codes';

const lambda: APIGatewayProxyHandlerWrapper = async (event) => {

  if (!event.pathParameters || !event.pathParameters.status) {
    throw new InternalServerError(
      'getLoanByStatusHandler() failed due to missing STATUS parameter'
    );
  }

  const tableName = createTableNameFromPrefix('Loan');
  
  let loans = await loadAllByQuery<Loan>(
    tableName,
    'status',
    event.pathParameters.status,
    isAdminUser(event.requestContext) ? undefined : { user: getUsername(event.requestContext) }
  );

  if (!loans) {
    throw new NotFound();
  }

  return {
    statusCode: HttpStatus.OK,
    body: loans
  };
}

export const lambdaHandler = createLambdaHandler(lambda);