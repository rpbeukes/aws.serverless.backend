import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import { createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import * as HttpStatus from 'http-status-codes';
import { InternalServerError, NotFound, BadRequest, Forbidden
 } from 'http-errors';
import { Loan, PatchLoanModel } from '../../dataModels';
import { loadById, patchUpdate } from '../../services/database';
import { isAdminUser, getUsername } from '../../authentication';

const lambda: APIGatewayProxyHandler = async event => {
  let response;

  try {

    console.log('patchLoanHandler executed!');

    if (!event.pathParameters || !event.pathParameters.id) {
      throw new InternalServerError(
        'patchLoanHandler() failed due to missing ID parameter'
      );
    }

    const table = createTableNameFromPrefix('Loan');
    const loan = await loadById<Loan>(table, event.pathParameters.id);

    if (!loan) {
      throw new NotFound();
    }

    const model = (event.body && JSON.parse(event.body)) as PatchLoanModel;

    if (!model.status) {
      throw new BadRequest('failed to patch record - request body requires {"status": "submitted"| "approved" | "collected" | "returned" | "cancelled" } property');
    }

    const isAdministratorUser = isAdminUser(event.requestContext);
    console.log(`isAdmin: ${isAdministratorUser}`);
    
    const user = getUsername(event.requestContext);
    
    const canUpdate = isAdministratorUser || user === loan.user;
    if (!canUpdate) {
      throw new Forbidden(`You do not have permission to modify this loan`);
    }

    const canUpdateWithCorrectStatus = isAdministratorUser || (model.status === 'submitted' || model.status === 'collected' || model.status === 'cancelled')
    if (!canUpdateWithCorrectStatus) {
      throw new Forbidden(`Invalid status: ${model.status}; Your privilege only allow loan status updates of: 'submitted', 'collected', 'cancelled'`);
    }

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
