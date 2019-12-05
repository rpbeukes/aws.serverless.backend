import { S3Handler } from "aws-lambda";

export const s3Handler: S3Handler = (event) => {
    console.log('hit importItems s3 s3Handler');
    console.log(JSON.stringify(event, null, 2));
};