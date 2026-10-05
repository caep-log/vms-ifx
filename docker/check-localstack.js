const {
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const REGION = "us-east-1";
const ENDPOINT = "http://localhost:4566";

const dynamo = new DynamoDBClient({
  region: REGION,
  endpoint: ENDPOINT,
});

async function main() {
  console.log("\n========== DYNAMODB ==========\n");

  const tables = await dynamo.send(new ListTablesCommand({}));

  console.log("Tables:", tables.TableNames);

  for (const table of tables.TableNames ?? []) {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: table,
      })
    );

    console.log(`\n--- ${table} ---`);
    console.log(result.Items);
  }
}

main().catch(console.error);
