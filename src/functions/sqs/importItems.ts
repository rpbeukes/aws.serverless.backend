import { SQSHandler } from "aws-lambda";

export const sqsHandler: SQSHandler = async (event) => {
    console.log('sqsHandler invoked!');
    console.log(JSON.stringify(event, null, 2));

    for (const queueItem of event.Records) {
        console.log(queueItem.body);
    }
};