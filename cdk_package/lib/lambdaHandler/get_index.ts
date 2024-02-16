import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";


const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

const dnsStage = process.env.DNS_STAGE ? process.env.DNS_STAGE : ""

export const handler = async (event) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET, PUT",
    "Access-Control-Allow-Origin": "https://" + dnsStage + "qwiz.ncharlbr.people.aws.dev"
  };
  console.log(event)

  try {
    switch (event.requestContext.httpMethod) {
      case "GET":
        console.log('its a GET method');
        body = await dynamo.send(
          new ScanCommand({ TableName: tableName })
        );
        body = body.Items;
        break;
      default:
        throw new Error(`Unsupported route: "${event.requestContext.httpMethod}"`);
    }
  } catch (err) {
    if (err instanceof Error) {
      body = err.message;
    } else {
      body = "An unknown error occurred.";
    }
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};