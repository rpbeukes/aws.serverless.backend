import { DynamoDB } from 'aws-sdk';
import { nameof } from '../shared/nameof';
import { Identifiable, PatchLoanModel } from '../dataModels';
import { createDocumentClientOptions } from '../shared/dynamoHelpers';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export const loadById = async <TRecord extends Identifiable>(
  tableName: string,
  id: string
): Promise<TRecord | undefined> => {
  var params: DocumentClient.QueryInput = {
    TableName: tableName,
    KeyConditionExpression: `${nameof<Identifiable>('id')} = :v_id`,
    ExpressionAttributeValues: {
      ':v_id': id
    },
    ReturnConsumedCapacity: 'NONE' // optional (NONE | TOTAL | INDEXES)
  };

  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

  const { Items: items } = await docClient.query(params).promise();

  return (items || []).shift() as TRecord;
};

export const save = async <TRecord extends Identifiable>(
  tableName: string,
  record: TRecord
): Promise<TRecord | undefined> => {

  const params: DocumentClient.PutItemInput = {
    TableName: tableName,
    Item: record
  };

  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());
  const result = await docClient.put(params).promise();
  console.log('result: ', JSON.stringify(result));


  return record;
}

export const patchUpdate = async <TRecord>(
  tableName: string,
  id: string,
  value: PatchLoanModel
): Promise<TRecord | undefined> => {

  /*
  // This is to get it working with the basics
  const params: DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: { id } 
      UpdateExpression: `SET #status = :status, #comment = :comment`,
      ExpressionAttributeNames: { '#status': 'status', '#comment': 'comment' },
      ExpressionAttributeValues: {
        ':status': value.status 
        ':comment': value.comment
      },
      ReturnValues: 'ALL_NEW'
    }
  */
  try {
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

    const params: DocumentClient.UpdateItemInput = {
      TableName: tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: JSON.parse(expressionAttributeNames),
      ExpressionAttributeValues: JSON.parse(expressionAttributeValues),
      ReturnValues: 'ALL_NEW'
    }

    const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

    const result = await docClient.update(params).promise();
    return result.Attributes as TRecord;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const loadAllByQuery = async <TRecord extends Identifiable>(
  tableName: string,
  key: keyof TRecord,
  value: any,
  filter?: Partial<Record<keyof TRecord, any>>,
  startKey?: any
): Promise<TRecord[]> => {

  console.log(startKey);
  console.log(filter);

  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());

  var params: DocumentClient.QueryInput = {
    TableName: tableName,
    IndexName: `by_${key}`,
    KeyConditionExpression: '#key = :value',
    ExpressionAttributeNames: {
      "#key": key as string
    },
    ExpressionAttributeValues: {
      ":value": value
    }
  };

  const result = await docClient.query(params).promise();

  console.log(result);

  // const { Items: items, LastEvaluatedKey: lastKey } = await new DynamoDB.DocumentClient()
  //   .query({
  //     TableName: tableName,
  //     IndexName: `by_${key}`,
  //     KeyConditionExpression: '#key = :value',
  //     FilterExpression: !filter ? undefined : Object.keys(filter)
  //       .reduce(
  //         (expression, filterKey, index) => [
  //           ...expression,
  //           `#filter${index} = :filter${index}`
  //         ],
  //         [] as string[]
  //       )
  //       .join(' and '),
  //     ExpressionAttributeNames: Object.keys(filter || {})
  //       .reduce(
  //         (result, filterKey, index) => ({
  //           ...result,
  //           [`#filter${index}`]: filterKey
  //         }),
  //         { '#key': String(key) } as Record<string, any>
  //       ),
  //     ExpressionAttributeValues: Object.keys(filter || {})
  //       .reduce(
  //         (result, filterKey, index) => ({
  //           ...result,
  //           [`:filter${index}`]: filter ? filter[filterKey as keyof TRecord] : undefined
  //         }),
  //         { ':value': value } as Record<string, any>
  //       ),
  //     ExclusiveStartKey: startKey
  //   })
  //   .promise();

  return result && result.Items as TRecord[];
};