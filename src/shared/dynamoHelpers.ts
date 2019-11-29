import { DocumentClient } from "aws-sdk/clients/dynamodb";
import DynamoDB = require("aws-sdk/clients/dynamodb");

export const createTableNameFromPrefix = (tableName: string) => {
    let r = process.env && process.env.TABLE_PREFIX && process.env.TABLE_PREFIX + tableName || '';
    if (r === '') throw Error(`Failed to read 'process.env.TABLE_PREFIX'`);
    return r;
};

export const createDocumentClientOptions = (): DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration => {
    return { region: process.env.REGION, apiVersion: '2012-08-10' };
};
