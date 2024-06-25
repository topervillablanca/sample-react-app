import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PipelineForReactStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CodePipeline(this, 'Pipeline', {
      pipelineName: "react-pipeline-v1",
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('topervillablanca/sample-react-app', 'master'),
        commands: [ 
          'npx ci',
          'npx run build',
          'npx cdk synth'
        ],
      })
    })
  }
}
