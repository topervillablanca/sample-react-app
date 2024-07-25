import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, InlineCode, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
    Cors,
    LambdaIntegration,
    RestApi,
    ApiKeySourceType,
    ApiKey,
    UsagePlan,
} from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const apiTable = new Table(this, 'SampleDBTable', {
            partitionKey: { name: 'pkid', type: AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        })

        const api = new RestApi(this, 'RestAPI', {
            restApiName: 'RestAPI',
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
            },
            apiKeySourceType: ApiKeySourceType.HEADER,
        });

        const apiKey = new ApiKey(this, 'ApiKey');

        const usagePlan = new UsagePlan(this, 'UsagePlan', {
            name: 'Usage Plan',
            apiStages: [
                {
                    api,
                    stage: api.deploymentStage,
                },
            ],
        });

        usagePlan.addApiKey(apiKey);

        const postsLambda = new NodejsFunction(this, 'PostsLambda', {
            entry: 'lib/lambda/posts.ts',
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            code: Code.fromAsset(path.join(__dirname, 'lambda')),
            environment: {
                TABLE_NAME: apiTable.tableName,
            },
        });

        const postLambda = new NodejsFunction(this, 'PostLambda', {
            entry: 'lib/lambda/post.ts',
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            code: Code.fromAsset(path.join(__dirname, 'lambda')),
            environment: {
                TABLE_NAME: apiTable.tableName,
            },
        });

        // const lambdaFunc = new NodejsFunction(this, 'LambdaFunction', {
        //     entry: 'lib/lambda/handler.ts',
        //     runtime: Runtime.NODEJS_16_X,
        //     handler: 'handler',
        //     code: Code.fromAsset(path.join(__dirname, 'lambda')),
        //     environment: { "stageName": stageName }
        // })

        apiTable.grantReadWriteData(postsLambda);
        apiTable.grantReadWriteData(postLambda);

        const posts = api.root.addResource('posts');
        const post = posts.addResource('{id}');

        const postsIntegration = new LambdaIntegration(postsLambda);
        const postIntegration = new LambdaIntegration(postLambda);

        posts.addMethod('GET', postsIntegration, {
            apiKeyRequired: true,
        });
        posts.addMethod('POST', postsIntegration, {
            apiKeyRequired: true,
        });

        post.addMethod('GET', postIntegration, {
            apiKeyRequired: true,
        });
        post.addMethod('DELETE', postIntegration, {
            apiKeyRequired: true,
        });

        new cdk.CfnOutput(this, 'API Key ID', {
            value: apiKey.keyId,
        });
    }
}