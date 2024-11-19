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

  if (!event.headers["X-Forwarded-For"]) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: value }),
    };
    return;
  }
  const requesterIP = event.headers["X-Forwarded-For"].split(",")[0];

  const checker = await dynamo.get({
    TableName: process.env.TABLE_NAME,
    Key: { IP: requesterIP },
  });

  if (!checker.Item) {
    await dynamo.put({
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

    console.log("Incrementing count:", value);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ count: value + 1 }),
    };
  }

  console.log("Not incrementing count:", value);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ count: value }),
  };
};
