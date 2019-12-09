import { SQSHandler } from "aws-lambda";
import { createTableNameFromPrefix } from "../../shared/dynamoHelpers";
import { save } from "../../services/database";
import { Item } from "../../dataModels";

export const sqsHandler: SQSHandler = async (event) => {
    console.log(JSON.stringify(event, null, 2));

    for (const queueItem of event.Records) {
        console.log(queueItem.body);
        const item = JSON.parse(queueItem.body) as Item;
        let table = createTableNameFromPrefix('Item');
        await save<Item>(table, item);
        console.info(`Success - Saved record to Items table id: ${item.id}`);
    }
};