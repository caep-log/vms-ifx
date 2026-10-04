import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    ScanCommand,
    GetCommand,
    QueryCommand,
    PutCommand,
    DeleteCommand,
    UpdateCommand,
    UpdateCommandInput,
    DynamoDBDocumentClient,
    GetCommandOutput,
    QueryCommandOutput,
    PutCommandOutput,
    UpdateCommandOutput,
    DeleteCommandOutput
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || process.env.region || "us-east-1";
const endpoint = process.env.DYNAMODB_ENDPOINT || process.env.endpoint ||
  (process.env.NODE_ENV === "production" ? undefined : "http://localhost:4566");
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.accessKeyId || process.env.accessKey ||
  (endpoint ? "test" : undefined);
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.secretAccessKey ||
  (endpoint ? "test" : undefined);

const LOG_TABLE_NAME = "errorLog";

const serializeLogValue = (value: unknown): string => {
  if (value instanceof Error) {
    return JSON.stringify({
      name: value.name,
      message: value.message,
      stack: value.stack,
    });
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized ?? String(value);
  } catch {
    return String(value);
  }
};

const clientConfig: any = {
  region,
};

if (endpoint) {
  clientConfig.endpoint = endpoint;
}

if (accessKeyId && secretAccessKey) {
  clientConfig.credentials = {
    accessKeyId,
    secretAccessKey,
  };
}

const baseClient = new DynamoDBClient(clientConfig);
const dbClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const AWSScanAll = async (tableName: string, projectionExpression?: string): Promise<Record<string, any>[]> => {
    const items: Record<string, any>[] = [];
    let ExclusiveStartKey: Record<string, any> | undefined;

    try {
        do {
            const response = await dbClient.send(new ScanCommand({
                TableName: tableName,
                ConsistentRead: false,
                ...(projectionExpression ? { ProjectionExpression: projectionExpression } : {}),
                ...(ExclusiveStartKey ? { ExclusiveStartKey } : {})
            }));
            items.push(...((response.Items ?? []) as Record<string, any>[]));
            ExclusiveStartKey = response.LastEvaluatedKey as Record<string, any> | undefined;
        } while (ExclusiveStartKey);

        return items;
    } catch (error) {
        console.error("AWSScanAll error", {
            tableName,
            projectionExpression,
            ExclusiveStartKey
        }, error);
        throw error;
    }
}

export const AWSQuery = async (tableName: string, keys?: Record<string, any>): Promise<QueryCommandOutput> => {
    try {
        if (!keys || Object.keys(keys).length < 1) {
            throw new Error("AWSQuery require 1 key.");
        }

        const entries = Object.entries(keys);

        if (entries.length === 1) {
            const [key, value] = entries[0];

            return await dbClient.send(
                new QueryCommand({
                    TableName: tableName,
                    KeyConditionExpression: `${key} = :${key}`,
                    ExpressionAttributeValues: {
                        [`:${key}`]: value
                    }
                })
            );
        }

        throw new Error("AWSQuery require 1 key.");
    } catch (error) {
        console.error("AWSQuery error", { tableName, keys }, error);
        throw error;
    }
}

export const AWSQueryAll = async (tableName: string, key: string, value: any, options: {
    filterExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
} = {}): Promise<Record<string, any>[]> => {
    const items: Record<string, any>[] = [];
    let ExclusiveStartKey: Record<string, any> | undefined;

    try {
        do {
            const response = await dbClient.send(new QueryCommand({
                TableName: tableName,
                ConsistentRead: false,
                KeyConditionExpression: "#partitionKey = :partitionValue",
                ExpressionAttributeNames: {
                    '#partitionKey': key,
                    ...(options.expressionAttributeNames ?? {})
                },
                ExpressionAttributeValues: {
                    ':partitionValue': value,
                    ...(options.expressionAttributeValues ?? {})
                },
                ...(options.filterExpression ? { FilterExpression: options.filterExpression } : {}),
                ...(ExclusiveStartKey ? { ExclusiveStartKey } : {})
            }));
            items.push(...((response.Items ?? []) as Record<string, any>[]));
            ExclusiveStartKey = response.LastEvaluatedKey as Record<string, any> | undefined;
        } while (ExclusiveStartKey);

        return items;
    } catch (error) {
        throw error;
    }
}

export const AWSGet = async (tableName: string, keys?: Record<string, any>): Promise<GetCommandOutput> => {
    try {
        if (!keys || Object.keys(keys).length < 2) {
            throw new Error("AWSGet require 2 keys.");
        }

        const entries = Object.entries(keys);

        if (entries.length === 2) {
            return await dbClient.send(
                new GetCommand({
                    TableName: tableName,
                    Key: keys
                })
            );
        }

        throw new Error("AWSGet require 2 keys.");
    } catch (error) {
        console.error("AWSGet error", { tableName, keys }, error);
        throw error;
    }
};

export const AWSCreate = async (tableName: string, object: object): Promise<PutCommandOutput> => {
    try {
        return await dbClient.send(new PutCommand({ TableName: tableName, Item: object }));
    } catch (error) {
        if (tableName === LOG_TABLE_NAME) {
            console.error("AWSCreate error while persisting an AWS error log", { tableName, object }, error);
        }
        console.error("AWSCreate error", { tableName, object }, error);
        throw error;
    }
};

export const AWSUpdate = async (tableName: string, keys: Record<string, any>, object: Record<string, any>): Promise<UpdateCommandOutput> => {
    try {
        const keyEntries = Object.entries(keys);
        const valueEntries = Object.entries(object);

        if (keyEntries.length === 0) {
            throw new Error("AWSUpdate requires at least one key");
        }

        if (valueEntries.length === 0) {
            throw new Error("AWSUpdate requires values to update");
        }

        const buildObject: UpdateCommandInput = {
            TableName: tableName,
            Key: keyEntries.reduce<Record<string, any>>((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {}),
            UpdateExpression:
                "SET " +
                valueEntries
                    .map(([key]) => `#${key} = :${key}`)
                    .join(", "),
            ExpressionAttributeNames:
                valueEntries.reduce<Record<string, string>>((acc, [key]) => {
                    acc[`#${key}`] = key;
                    return acc;
                }, {}),
            ExpressionAttributeValues:
                valueEntries.reduce<Record<string, any>>((acc, [key, value]) => {
                    acc[`:${key}`] = value;
                    return acc;
                }, {}),
            ReturnValues: "UPDATED_NEW"
        };

        return await dbClient.send(new UpdateCommand(buildObject));
    } catch (error) {
        console.error("AWSUpdate error", { tableName, keys, object }, error);
        throw error;
    }
};

export const AWSUpdateExpression = async (
    tableName: string,
    keys: Record<string, any>,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, any>,
    conditionExpression?: string
): Promise<UpdateCommandOutput> => {
    try {
        if (Object.keys(keys).length === 0) {
            throw new Error("AWSUpdateExpression requires at least one key");
        }

        return await dbClient.send(new UpdateCommand({
            TableName: tableName,
            Key: keys,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ...(conditionExpression ? { ConditionExpression: conditionExpression } : {}),
            ReturnValues: "UPDATED_NEW"
        }));
    } catch (error) {
        console.error("AWSUpdateExpression error", { tableName, keys, updateExpression }, error);
        throw error;
    }
};

export const AWSDelete = async (tableName: string, key: any): Promise<DeleteCommandOutput> => {
    try {
        if (!key || Object.keys(key).length === 0) {
            throw new Error("AWSDelete requires key");
        }

        return await dbClient.send(new DeleteCommand({ TableName: tableName, Key: key }));
    } catch (error) {
        console.error("AWSDelete error", { tableName, key }, error);
        throw error;
    }
};
