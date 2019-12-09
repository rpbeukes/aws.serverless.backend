import { S3Handler } from "aws-lambda";
import AWS = require("aws-sdk");
import * as Papa from 'papaparse'
import cuid = require("cuid");
import { Item } from "../../dataModels";
import { enqueueMessage } from '../../services/queue';

export const s3Handler: S3Handler = async (event) => {
    //console.log('hit importItems s3 s3Handler');
    //console.log(JSON.stringify(event, null, 2));

    // Don't use `event.Records.forEach(async (createCSVFileEvent) => {`  
    //     see: https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (const createCSVFileEvent of event.Records) {
        const bucketName = createCSVFileEvent.s3.bucket.name;
        const filePath = createCSVFileEvent.s3.object.key;

        // Retrieve the object (file)
        const result = await new AWS.S3().getObject({
            Bucket: bucketName,
            Key: filePath
        }).promise();

        const csvData = result.Body && result.Body.toString() || '';

        if (csvData) {
            let parseResult = Papa.parse(csvData, { header: true });
            console.info(`parseResult: ${JSON.stringify(parseResult, null, 2)}`);

            if (parseResult.data) {
                console.info(`About to add ${parseResult.data.length} item(s) to queue...`);

                for (const csvLine of parseResult.data) {
                    const queueMessage: Item = {
                        ...csvLine,
                        id: cuid()
                    };
                    console.info(`Add message to SQS import queue: ${JSON.stringify(queueMessage)}`);

                    // add the data on the SQS queue
                    const sqsResult = await enqueueMessage(process.env.IMPORT_ITEMS_QUEUE_URL as string, queueMessage);
                    console.info(JSON.stringify(sqsResult, null, 2));
                }
            } else {
                throw new Error(JSON.stringify(parseResult.errors, null, 2));
            }
        } else {
            console.log(`No data in CSV file - ${filePath}`);
        }
    };
};