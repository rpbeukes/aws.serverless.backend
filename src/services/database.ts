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
};

export const loadAllByQuery = async <TRecord extends Identifiable>(
  tableName: string,
  key: keyof TRecord,
  value: any,
  filter?: Partial<Record<keyof TRecord, any>>,
  startKey?: any
): Promise<TRecord[]> => {

  console.log(`startKey: ${startKey ? JSON.stringify(startKey) : undefined}`);
  console.log(`filter: ${filter ? JSON.stringify(filter) : undefined}`);

  const docClient = new DynamoDB.DocumentClient(createDocumentClientOptions());


  /*
   // This is to get it working with the basics
    var params: DocumentClient.QueryInput = {
      TableName: tableName,
      IndexName: `by_status`,
      KeyConditionExpression: '#key = :value',
      FilterExpression: '#user = :user',
      ExpressionAttributeNames: {
        '#key': 'status',
        '#user': 'user',
      },
      ExpressionAttributeValues: {
        ':value': 'submitted',
        ':user': 'test@test.com'
      }
    };
  */

  const filterExpression = !filter ? undefined : Object.keys(filter)
    .reduce((expression, _filterKey, index) => [
      ...expression,
      `#filter${index} = :filter${index}`
    ],
      // init value
      [] as string[])
    .join(' and ');

  const expressionAttributeNames = Object.keys(filter || {})
    .reduce((result, filterKey, index) => ({
      ...result,
      [`#filter${index}`]: filterKey
    }),
      // init value
      { '#key': String(key) } as Record<string, any>);

  const expressionAttributeValues = Object.keys(filter || {})
    .reduce((result, filterKey, index) => ({
      ...result,
      [`:filter${index}`]: filter ? filter[filterKey as keyof TRecord] : undefined
    }),
      // init value
      { ':value': value } as Record<string, any>);
      
  console.log(`filterExpression: ${filterExpression ? JSON.stringify(filterExpression) : undefined}`);
  console.log(`expressionAttributeNames: ${expressionAttributeNames ? JSON.stringify(expressionAttributeNames) : undefined}`);
  console.log(`expressionAttributeValues: ${expressionAttributeValues ? JSON.stringify(expressionAttributeValues) : undefined}`);

  var params = {
    TableName: tableName,
    IndexName: `by_${key}`,
    KeyConditionExpression: '#key = :value',
    FilterExpression: filterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ExclusiveStartKey: startKey
  };

  const result = await docClient.query(params).promise();

  console.log(JSON.stringify(result));

  return [
    ...result.Items as TRecord[] || [],
    ...(result.LastEvaluatedKey ? await loadAllByQuery(tableName, key, value, filter, result.LastEvaluatedKey) : undefined) as TRecord[] || []
  ];

};

/*
// This is the result to test the LastEvaluatedKey when I requested with a Limit = 1

Request:
  params = {
      TableName: tableName,
      Limit: 1,
      IndexName: `by_status`,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: {
          "#key": key
      },
      ExpressionAttributeValues: {
          ":value": value
      }
  };

Result:
{
    "Items": [
        {
            "collectionDate": "2019-12-10T16:00:00.000Z",
            "selections": [
                {
                    "count": 1,
                    "item": {
                        "count": 2,
                        "name": "All terrain vehicle - type 4",
                        "description": "The type 4 vehicle is larger than the type 1, with additional defensive capability, and internal seating for 8 plus 2 external positions.",
                        "id": "ck1vqftlm00017upg9py0bq70",
                        "category": "vehicles"
                    }
                },
                {
                    "count": 1,
                    "item": {
                        "count": 7,
                        "name": "All terrain vehicle - type 1",
                        "description": "The type 1 vehicle has good all-round capability, internal seating for 6 plus 2 external positions.",
                        "id": "ck1vqftll00007upg1pm1e2ka",
                        "category": "vehicles"
                    }
                },
            ],
            "events": [
                {
                    "user": "test@test.com",
                    "status": "submitted",
                    "eventDate": "2019-11-27T02:18:54.797Z"
                }
            ],
            "status": "submitted",
            "comment": "Postman patch by admin",
            "user": "test@test.com",
            "id": "ck3gnuci4000008mmdrazahfb",
            "reason": "just me trying",
            "returnDate": "2019-12-24T16:00:00.000Z"
        }
    ],
    "Count": 1,
    "ScannedCount": 1,
    "LastEvaluatedKey": {
        "id": "ck3gnuci4000008mmdrazahfb",
        "status": "submitted"
    }
}

// This means that the next request should have;

   ExclusiveStartKey: {
        "id": "ck3gnuci4000008mmdrazahfb",
        "status": "submitted"
    }

*/