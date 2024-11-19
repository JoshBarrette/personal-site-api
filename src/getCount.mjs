"use strict";

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event, context, callback) => {
  let value = -1;
  await dynamo
    .get({
      TableName: process.env.TABLE_NAME,
      Key: { IP: "Count" },
    })
    .then((res) => {
      value = res.Item.value;
    })
    .catch((e) => console.log(e));

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ count: value }),
  });
};
