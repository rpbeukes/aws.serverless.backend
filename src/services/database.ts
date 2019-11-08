import { DynamoDB } from 'aws-sdk';
import { nameof } from '../shared/nameof';
import { Identifiable, PatchLoanModel } from '../dataModels';
import { createDocumentClientOptions } from '../shared/dynamoHelpers';
import { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

export const loadById = async <TRecord extends Identifiable>(
  tableName: string,
  id: string
): Promise<TRecord | undefined> => {
  var params: DynamoDB.Types.QueryInput = {
    TableName: tableName,
    KeyConditionExpression: `${nameof<Identifiable>('id')} = :v_id`,
    ExpressionAttributeValues: {
      ':v_id': id as any // had to cast to any, to shut up typescript
    },
    ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
  };

  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

  const { Items: items } = await docClient.query(params).promise();

  return (items || []).shift() as TRecord;
};

export const patchUpdate = async <TRecord>(
  tableName: string,
  id: string,
  value: PatchLoanModel
): Promise<TRecord | undefined> => {

  /*
  // This is to get it working with the basics
  const params: UpdateItemInput = {
      TableName: tableName,
      Key: { id } as any, // cast to shut up typescript
      UpdateExpression: `SET #status = :status, #comment = :comment`,
      ExpressionAttributeNames: { '#status': 'status', '#comment': 'comment' },
      ExpressionAttributeValues: {
        ':status': value.status as any, // cast to shut up typescript
        ':comment': value.comment as any // cast to shut up typescript
      },
      ReturnValues: 'ALL_NEW'
    }
  */

  let updateExpression = `#${nameof<PatchLoanModel>('status')} = :${nameof<PatchLoanModel>('status')}`;
  let expressionAttributeNames = `"#${nameof<PatchLoanModel>('status')}": "${nameof<PatchLoanModel>('status')}"`;
  let expressionAttributeValues = `":${nameof<PatchLoanModel>('status')}": "${value.status}"`;

  if (value.comment && value.comment.trim()) {
    updateExpression += `, #${nameof<PatchLoanModel>('comment')} = :${nameof<PatchLoanModel>('comment')}`;
    expressionAttributeNames += `, "#${nameof<PatchLoanModel>('comment')}": "${nameof<PatchLoanModel>('comment')}"`;
    expressionAttributeValues += `, ":${nameof<PatchLoanModel>('comment')}": "${value.comment}"`;
  }
  
  expressionAttributeNames = `{${expressionAttributeNames}}`;
  expressionAttributeValues = `{${expressionAttributeValues}}`

  console.log(updateExpression);
  console.log(expressionAttributeNames);
  console.log(expressionAttributeValues);

  const params: UpdateItemInput = {
    TableName: tableName,
    Key: { id } as any, // cast to shut up typescript
    UpdateExpression: `SET ${updateExpression}`,
    ExpressionAttributeNames: JSON.parse(expressionAttributeNames),
    ExpressionAttributeValues: JSON.parse(expressionAttributeValues),
    ReturnValues: 'ALL_NEW'
  }
  
  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

  const result = await docClient.update(params).promise();
  return result.Attributes as TRecord;
};
