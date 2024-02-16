import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

const dnsStage = process.env.DNS_STAGE ? process.env.DNS_STAGE : ""

interface Headers {
  'Content-Type': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Allow-Credentials': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Origin'?: string;
};

export const handler = async (event: { requestContext: any; body: any; routeKey?: any; }) => {
  let body;
  let statusCode = 200;
  let headers: Headers = {
    "Content-Type": "application/json",
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, PUT',
  };
  if (dnsStage !== 'prod') {
    headers['Access-Control-Allow-Origin'] = 'https://' + dnsStage + 'qwiz.ncharlbr.people.aws.dev';
  } else {
    headers['Access-Control-Allow-Origin'] = 'https://qwiz.ncharlbr.people.aws.dev';
  };
  console.log('Received event:', JSON.stringify(event, null, 2));


  try {
    switch (event.requestContext.httpMethod) {
      case "PUT":
        let requestJSON;
        try {
          requestJSON = JSON.parse(event.body);
        } catch (error) {
          throw new Error('Malformed JSON in the request body');
        }
        if (!requestJSON.role || !requestJSON.question || !requestJSON.type) {
          throw new Error('Malformed question structure in the request body');
        }
        await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              role: requestJSON.role,
              question: requestJSON.question,
              type: requestJSON.type,
            },
          })
        );
        body = `Put item ${requestJSON.question}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err: any) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  };

  return {
    statusCode,
    body,
    headers,
  };
};