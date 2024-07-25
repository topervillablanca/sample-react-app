import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, InlineCode, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { LambdaIntegration, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class LambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, stageName: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const lambdaFunc = new NodejsFunction(this, 'LambdaFunction', {
            entry: 'lib/lambda/handler.ts',
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            code: Code.fromAsset(path.join(__dirname, 'lambda')),
            environment: { "stageName": stageName}
        })

        const gateway = new LambdaRestApi(this, 'RESTApiSample', {
            handler: lambdaFunc,
            proxy: false,
            restApiName: "trialAPI"
        })

        const helloAPI = gateway.root.addResource("hello")
        helloAPI.addMethod("GET", new LambdaIntegration(lambdaFunc))
    }
}