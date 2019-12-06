import { S3Handler } from "aws-lambda";
import AWS = require("aws-sdk");

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
        })
            .promise();

        console.log(JSON.stringify(result, null, 2));
        // }, function (err, data) {
        //     if (err) {
        //         console.log(err, err.stack);
        //         callback(err);
        //     } else {
        //         console.log("Raw text:\n" + data.Body.toString('ascii'));
        //         callback(null, null);
        //     }
        // });
    });



};