import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { createLambdaHandler } from '../../middleware/shared-middleware-pipeline';
import * as HttpStatus from 'http-status-codes';
import { PostLoanModel, LoanStatus, Loan } from '../../dataModels';
import * as cuid from 'cuid';
import * as moment from 'moment';
import { save } from '../../services/database';
import { createTableNameFromPrefix } from '../../shared/dynamoHelpers';
// import { InternalServerError, NotFound, BadRequest } from 'http-errors';

const lambda: APIGatewayProxyHandler = async event => {
  let response;

  try {

    console.log('postLoan executed!');
    event = event;

    const { selections, collectionDate, returnDate, reason } = (event.body && JSON.parse(event.body)) as PostLoanModel;
    const status: LoanStatus = 'submitted';

    const loan: Loan = {
      selections,
      collectionDate,
      returnDate,
      reason,
      user: 'todo@example.com',
      status,
      id: cuid(),
      events: [
        {
          user: 'todo@example.com',
          status,
          eventDate: moment().toISOString()
        }
      ]
    };

    let table = createTableNameFromPrefix('Loan');
    let result = await save<Loan>(table, loan);

    console.log(result);

    response = {
      statusCode: HttpStatus.CREATED,
      body: JSON.stringify(loan)
    };

  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

export const lambdaHandler = createLambdaHandler(lambda);
