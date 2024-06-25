#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineForReactStack } from '../lib/pipeline-for-react-stack';

const app = new cdk.App();
new PipelineForReactStack(app, 'PipelineForReactStack', {
  env: {
    account: "992382358172",
    region: "us-east-1"
  }
});