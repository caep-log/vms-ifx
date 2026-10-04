import {
    AdminCreateUserCommand,
    AdminDeleteUserCommand,
    AdminInitiateAuthCommand,
    AdminSetUserPasswordCommand,
    CognitoIdentityProviderClient,
    ListUserPoolClientsCommand,
    ListUserPoolsCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.AWS_REGION || process.env.region || "us-east-1";
const endpoint = process.env.COGNITO_ENDPOINT || process.env.endpoint || "http://localhost:4566";

const client = new CognitoIdentityProviderClient({
    region,
    endpoint,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.accessKeyId || "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.secretAccessKey || "test",
    },
});

export class CognitoIdentityService {
    private async userPoolId() {
        if (process.env.COGNITO_USER_POOL_ID) {
            return process.env.COGNITO_USER_POOL_ID;
        }

        const response = await client.send(new ListUserPoolsCommand({ MaxResults: 60 }));
        const pool = response.UserPools?.find(
            (item) => item.Name === (process.env.COGNITO_USER_POOL_NAME || "vms-users"),
        );

        if (!pool?.Id) {
            throw new Error("Cognito User Pool no encontrado");
        }

        return pool.Id;
    }

    private async clientId(userPoolId: string) {
        const response = await client.send(new ListUserPoolClientsCommand({
            UserPoolId: userPoolId,
            MaxResults: 60,
        }));
        const appClient = response.UserPoolClients?.find(
            (item) => item.ClientName === (process.env.COGNITO_CLIENT_NAME || "vms-client"),
        );

        if (!appClient?.ClientId) {
            throw new Error("Cognito App Client no encontrado");
        }

        return appClient.ClientId;
    }

    async createUser(email: string, password: string, name?: string) {
        const userPoolId = await this.userPoolId();
        const created = await client.send(new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            MessageAction: "SUPPRESS",
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "email_verified", Value: "true" },
                ...(name ? [{ Name: "name", Value: name }] : []),
            ],
        }));
        const userSub = created.User?.Attributes?.find((attribute) => attribute.Name === "sub")?.Value;

        if (!userSub) {
            throw new Error("Cognito no devolvió userSub");
        }

        try {
            await client.send(new AdminSetUserPasswordCommand({
                UserPoolId: userPoolId,
                Username: email,
                Password: password,
                Permanent: true,
            }));
        } catch (error) {
            await this.deleteUser(userSub);
            throw error;
        }

        return { userSub };
    }

    async authenticate(email: string, password: string) {
        const userPoolId = await this.userPoolId();
        const clientId = await this.clientId(userPoolId);

        await client.send(new AdminInitiateAuthCommand({
            UserPoolId: userPoolId,
            ClientId: clientId,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        }));
    }

    async deleteUser(userSub: string) {
        await client.send(new AdminDeleteUserCommand({
            UserPoolId: await this.userPoolId(),
            Username: userSub,
        }));
    }
}
