const { region, environment, username, password, userPoolId } = readArguments();
const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: region });

if (environment === 'dev' || environment === 'test') {
  testUser().create$(environment, username, password);
} else {
  console.log(`No need to add test user (${username || 'test@test.com'}) to the cognito user pool`);
}

function readArguments() {
  const environment = (process.argv && process.argv[2] && process.argv[2].toLowerCase()) || 'dev';
  const userPoolId = process.argv && process.argv[3];
  const username = process.argv && process.argv[4] || 'test@test.com';
  const password = process.argv && process.argv[5] || 'passwordpassword';
  const region = process.argv && process.argv[6] || 'ap-southeast-2';
  console.log(`Environment: ${environment}`);
  console.log(`userPoolId: ${userPoolId}`);
  console.log(`username: ${username}`);
  console.log(`password: ${password}`);
  console.log(`region: ${region}`);
  return { region, environment, username, password, userPoolId };
}

function testUser() {
  const create$ = async (environment, username, password) => {
    environment = environment && environment.toLowerCase();

    if (userPoolId) {
      //add the test@test.com user if it does not exist
      let listUsersParams = {
        UserPoolId: userPoolId /* required */,
        AttributesToGet: [
          'email'
          /* more items */
        ],
        Filter: `email='${username}'`
      };

      cognitoidentityserviceprovider.listUsers(listUsersParams, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          let users = data.Users;

          if (users.length > 0) {
            console.log(
              `*************** Nothing to do, '${username}' user already exist in '${userPoolId}'`
            );
          } else {
            console.log('User not found, add it...'); // successful response
            //add the test user
            /*`aws cognito-idp admin-create-user
        --user-pool-id ap-southeast-2_4R5trE82
        --username test@test.com
        --user-attributes=Name=email_verified,Value=true,Name=email,Value="test@test.com"
        --message-action SUPPRESS` (user is automatically enabled)

        set password:
          `aws cognito-idp admin-set-user-password --user-pool-id ap-southeast-2_4R5trE82 --username test@test.com --password Password --permanent`
        list users:
          `aws cognito-idp list-users --user-pool-id ap-southeast-2_4R5trE82`
        */

            //add cognito users
            let params = {
              UserPoolId: userPoolId /* required */,
              Username: username /* required */,
              DesiredDeliveryMediums: ['EMAIL'],
              ForceAliasCreation: false,
              MessageAction: 'SUPPRESS',
              TemporaryPassword: password,
              UserAttributes: [
                {
                  Name: 'email_verified' /* required */,
                  Value: 'true'
                },
                {
                  Name: 'email' /* required */,
                  Value: username
                }
              ]
            };

            cognitoidentityserviceprovider.adminCreateUser(params, function (err, data) {
              if (err) {
                console.log(err, err.stack);
              } else {
                console.log(data); // successful response

                let user = data.User;
                let params = {
                  Password: password /* required */,
                  UserPoolId: userPoolId /* required */,
                  Username: user.Username /* required */,
                  Permanent: true
                };
                cognitoidentityserviceprovider.adminSetUserPassword(params, function (err, data) {
                  if (err) {
                    console.log(err, err.stack);
                  } else {
                    // successful response
                    console.log(`User: '${user.Username}'; Email: '${username}'; Password: '${password}' successfully created.`); // successful response
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
