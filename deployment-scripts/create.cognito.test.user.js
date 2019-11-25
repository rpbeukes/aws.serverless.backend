const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'ap-southeast-2' });

const environment = (process.argv && process.argv[2] && process.argv[2].toLowerCase()) || 'dev';
console.log(`Environment: ${environment}`);

const userPoolId = process.argv && process.argv[3] && process.argv[3];
console.log(`userPoolId: ${userPoolId}`);

if (environment === 'dev' || environment === 'test') {
  testUser().create$(environment);
} else {
  console.log("No need to add 'test@test.com' to the cognito user pool.");
}

function testUser() {

  const create$ = async environment => {
    environment = environment && environment.toLowerCase();

    if (userPoolId) {
      //add the test@test.com user if it does not exist
      let listUsersParams = {
        UserPoolId: userPoolId /* required */,
        AttributesToGet: [
          'email'
          /* more items */
        ],
        Filter: "email='test@test.com'"
      };
      cognitoidentityserviceprovider.listUsers(listUsersParams, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          console.log(data); // successful response
          let users = data.Users;

          if (users.length > 0) {
            console.log(
              `*************** Nothing to do, 'test@test.com' user already exist in '${userPoolId})'`
            );
          } else {
            //add the test user
            /*`aws cognito-idp admin-create-user
        --user-pool-id ap-southeast-2_4EeyJX882
        --username test@test.com
        --user-attributes=Name=email_verified,Value=true,Name=email,Value="test@test.com"
        --message-action SUPPRESS` (user is automatically enabled)

        set password:
          `aws cognito-idp admin-set-user-password --user-pool-id ap-southeast-2_4EeyJX882 --username test@test.com --password Password --permanent`
        list users:
          `aws cognito-idp list-users --user-pool-id ap-southeast-2_4EeyJX882`
        */

            //add cognito users
            let params = {
              UserPoolId: userPoolId /* required */,
              Username: `test@test.com` /* required */,
              DesiredDeliveryMediums: ['EMAIL'],
              ForceAliasCreation: false,
              MessageAction: 'SUPPRESS',
              TemporaryPassword: 'passwordpassword',
              UserAttributes: [
                {
                  Name: 'email_verified' /* required */,
                  Value: 'true'
                },
                {
                  Name: 'email' /* required */,
                  Value: 'test@test.com'
                }
                /* more items */
              ]
            };

            cognitoidentityserviceprovider.adminCreateUser(params, function (err, data) {
              if (err) console.log(err, err.stack);
              // an error occurred
              else {
                console.log(data); // successful response

                let user = data.User;
                let params = {
                  Password: 'passwordpassword' /* required */,
                  UserPoolId: userPoolId /* required */,
                  Username: user.Username /* required */,
                  Permanent: true
                };
                cognitoidentityserviceprovider.adminSetUserPassword(params, function (err, data) {
                  if (err) console.log(err, err.stack);
                  // an error occurred
                  else {
                    console.log(data); // successful response
                    console.log(`User: '${user.Username}'; Email: 'test@test.com'; Password: 'passwordpassword' successfully created.`); // successful response
                  }
                });
              }
            });
          }
        }
      });

    } else {
      console.log(`******** No AWS UserPoolId parameter detected  ********`);
    }
  };

  return {
    create$: create$
  };
}
