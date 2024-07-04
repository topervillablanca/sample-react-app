import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { PipelineAppStage } from '../lib/stage';

export class PipelineForReactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: "react-pipeline-v1",
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('topervillablanca/sample-react-app', 'master'),
        commands: [ 
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ],
      })
    })

    const qaStage = pipeline.addStage(new PipelineAppStage(this, "QA", {
      env: {
        account: "992382358172",
        region: "us-east-1"
      }
    }))

    qaStage.addPost(new ManualApprovalStep('Needs approval from the Dev team before releasing to QA'))

    const prodStage = pipeline.addStage(new PipelineAppStage(this, "PROD", {
      env: {
        account: "992382358172",
        region: "us-east-1"
      }
    }))

    prodStage.addPost(new ManualApprovalStep('Needs approval from the Dev and QA team before releasing to PROD'))
  }
}
