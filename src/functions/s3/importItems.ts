import { S3Handler } from "aws-lambda";
import AWS = require("aws-sdk");
import * as Papa from 'papaparse'
import cuid = require("cuid");
import { Item } from "../../dataModels";

export const s3Handler: S3Handler = (event) => {
    console.log('hit importItems s3 s3Handler');
    console.log(JSON.stringify(event, null, 2));

    event.Records.forEach(async (evnt) => {
        // Retrieve the bucket & key for the uploaded S3 object that
        // caused this Lambda function to be triggered
        const bucketName = evnt.s3.bucket.name;
        const filePath = evnt.s3.object.key;

        // Retrieve the object
        const result = await new AWS.S3().getObject({
            Bucket: bucketName,
            Key: filePath
        }).promise();

        const csvData = result.Body && result.Body.toString() || '';

        if (csvData) {
            let parseResult = Papa.parse(csvData, { header: true });
            console.log(JSON.stringify(parseResult, null, 2));

            if (parseResult.data) {
                console.log(`About to add ${parseResult.data.length} item(s) to queue...`);

                parseResult.data.forEach(async (csvLine) => {
                    const queueMessage: Item = {
                        ...csvLine
                        , id: cuid()
                    };
                    console.info(`Add message to SQS import queue: ${JSON.stringify(queueMessage)}`);
                    // add the data on the SQS queue
                    await new AWS.SQS()
                        .sendMessage({
                            QueueUrl: process.env.IMPORT_ITEMS_QUEUE_URL as string,
                            MessageBody: JSON.stringify(queueMessage)
                        }).promise();
                })
            }

        } else {
            console.log(`No data in CSV file - ${filePath}`);
        }
    });
};