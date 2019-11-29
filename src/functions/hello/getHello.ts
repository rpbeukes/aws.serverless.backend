import 'source-map-support/register';
import { createLambdaHandler, APIGatewayProxyHandlerWrapper } from '../../middleware/shared-middleware-pipeline';

const lambda: APIGatewayProxyHandlerWrapper = async (event) => {
  return {
    statusCode: 200,
    body: {
      message:
        'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
      input: JSON.stringify(event, null, 2)
    },
  };
};

export const lambdaHandler = createLambdaHandler(lambda);
