import { SQS } from 'aws-sdk';

export const enqueueMessage = async (queueUrl: string, message: any) =>
  await new SQS()
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message)
    })
    .promise();
    