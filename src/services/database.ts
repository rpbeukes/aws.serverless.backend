import { DynamoDB } from 'aws-sdk';
import { nameof } from '../shared/nameof';
import { Identifiable } from '../dataModels';
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

export const patchUpdate = <TRecord>(
  tableName: string,
  id: string
): Promise<TRecord | undefined> => {
  
  const params: UpdateItemInput = {
    TableName: tableName,
    Key: id as any,
    UpdateExpression: `SET reason = :v_reason`,
    ExpressionAttributeNames: updates.reduce((map, { field }) => ({ ...map, [`#${field}`]: field }), {}),
    ExpressionAttributeValues: updates.reduce((map, { field, value }) => ({ ...map, [`:${field}`]: value }), {}),
    ReturnValues: 'ALL_NEW'
  }
  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

  return undefined;
};
