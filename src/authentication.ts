import { APIGatewayEventRequestContext } from 'aws-lambda';

const getClaim = ({ authorizer }: Pick<APIGatewayEventRequestContext, 'authorizer' >, claim: string): string => {
    if (authorizer && authorizer.claims) {
        return authorizer.claims[claim];
    }
    
    throw Error('Authorizer failed to supply user claims in request context');
};

export const getUsername = (requestContext: APIGatewayEventRequestContext) => getClaim(requestContext, 'email');