import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import * as HttpStatus from 'http-status-codes';
import { PostLoanModel, LoanStatus, Loan } from '../../dataModels';
import * as cuid from 'cuid';
import * as moment from 'moment';
import { save } from '../../services/database';
import { createTableNameFromPrefix } from '../../shared/dynamoHelpers';
import { getUsername } from '../../authentication';
// import { InternalServerError, NotFound, BadRequest } from 'http-errors';

const lambda: APIGatewayProxyHandler = async (event) => {
    console.log('postLoan executed!');
    const { selections, collectionDate, returnDate, reason } = (event.body && JSON.parse(event.body)) as PostLoanModel;
    const status: LoanStatus = 'submitted';
    const user = getUsername(event.requestContext);

    const loan: Loan = {
      selections,
      collectionDate,
      returnDate,
      reason,
      user,
      status,
      id: cuid(),
      events: [
        {
          user,
          status,
          eventDate: moment().toISOString()
        }
      ]
    };

    let table = createTableNameFromPrefix('Loan');
    let result = await save<Loan>(table, loan);

    console.log(result);

    return {
      statusCode: HttpStatus.CREATED,
      body: JSON.stringify(loan)
    };
};

export const lambdaHandler = createLambdaHandler(lambda);
