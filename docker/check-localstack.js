const {
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
} = require("@aws-sdk/client-dynamodb");

const {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand,
  ListUsersCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const REGION = "us-east-1";
const ENDPOINT = "http://localhost:4566";

const dynamo = new DynamoDBClient({
  region: REGION,
  endpoint: ENDPOINT,
});

const cognito = new CognitoIdentityProviderClient({
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

  // console.log("\n========== COGNITO ==========\n");

  // const pools = await cognito.send(
  //   new ListUserPoolsCommand({
  //     MaxResults: 60,
  //   })
  // );

  // for (const pool of pools.UserPools ?? []) {
  //   console.log(`\n--- ${pool.Name} (${pool.Id}) ---`);

  //   const users = await cognito.send(
  //     new ListUsersCommand({
  //       UserPoolId: pool.Id,
  //     })
  //   );

  //   console.log(users.Users);
  // }
}

main().catch(console.error);