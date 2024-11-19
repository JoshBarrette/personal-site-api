"use strict";

import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event, context, callback) => {
  if (!event.headers["X-Forwarded-For"]) {
    callback(null, {
      statusCode: 200,
    });
  }
  const requesterIP = event.headers["X-Forwarded-For"].split(",")[0];

  const checker = await dynamo.get({
    TableName: process.env.TABLE_NAME,
    Key: { IP: requesterIP },
  });

  if (!checker.Item) {
    var res = await dynamo.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        IP: requesterIP,
      },
    });

    dynamo.update({
      TableName: process.env.TABLE_NAME,
      Key: { IP: "Count" },
      ExpressionAttributeValues: { ":increment": 1 },
      ExpressionAttributeNames: { "#value": "value" },
      UpdateExpression: "ADD #value :increment",
    });
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      res: res ? "Count Incremented" : "Count Not Updated",
    }),
  });
};
