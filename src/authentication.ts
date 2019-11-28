import { APIGatewayEventRequestContext } from 'aws-lambda';

const getClaim = ({ authorizer }: Pick<APIGatewayEventRequestContext, 'authorizer'>, claim: string): string => {
    if (authorizer && authorizer.claims) {
        return authorizer.claims[claim];
    }

    throw Error('Authorizer failed to supply user claims in request context');
};

export const getUsername = (requestContext: APIGatewayEventRequestContext) => getClaim(requestContext, 'email');

export const isAdminUser = (requestContext: APIGatewayEventRequestContext) => {
    const claim = getClaim(requestContext, 'cognito:groups')
    // example claim: 'anotherGroup, admin'
    return claim ? claim.includes('admin') : false;
};

/*
Samples of the authorizer data:

User in admin group:
{
    "claims": {
        "sub": "10b4786a-a220-4476-90ce-df95cb18fe74",
        "aud": "5aa218vcdflmohh3qhrtr0mj78",
        "cognito:groups": "anotherGroup,admin",
        "event_id": "638c4d7b-ccb3-41d5-a444-8ee5aca0248a",
        "token_use": "id",
        "auth_time": "1574911451",
        "iss": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_AAPZcQ593",
        "cognito:username": "10b4786a-a220-4476-90ce-df95cb18fe74",
        "exp": "Thu Nov 28 04:24:11 UTC 2019",
        "iat": "Thu Nov 28 03:24:11 UTC 2019",
        "email": "admin@test.com"
    }
}
    
User in no group (just a regular user):
{
   "claims": {
      "sub": "a83ef395-5a48-4fd8-a708-ad302aeaf0f9",
      "aud": "5aa218vcdflmohh3qhrtr0mj78",
      "event_id": "de18fd06-4d8b-4c12-b39f-5e31e6675628",
      "token_use": "id",
      "auth_time": "1574911450",
      "iss": "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_AAPZcQ593",
      "cognito:username": "a83ef395-5a48-4fd8-a708-ad302aeaf0f9",
      "exp": "Thu Nov 28 04:24:10 UTC 2019",
      "iat": "Thu Nov 28 03:24:10 UTC 2019",
      "email": "test@test.com"
   }
}
*/