import { Construct } from 'constructs';
import { ServiceStage } from './pipelineQwizServiceStage';
import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "aws-cdk-lib/pipelines";
import { STAGES } from './constants';



export class QwizPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Use pre-exisitng CodeCommit repository
        const repo = codecommit.Repository.fromRepositoryName(this, 'QwizRepo', "qwizApp");

        const pipeline = new CodePipeline(this, 'QwizPipeline', {
            pipelineName: 'QwizPipeline',
            crossAccountKeys: true,
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.codeCommit(repo, 'main'),
                installCommands: [
                    'npm install -g aws-cdk',
                    'npm install -g typescript',
                ],
                commands: [
                    'cdk --version',
                    'tsc --version',
                    'pwd',
                    'cd cdk_package',
                    'ls',
                    'npm install',
                    'npm run build',
                    'cdk synth',
                    'ls -al'
                ],
                primaryOutputDirectory: 'cdk_package/cdk.out',
            })
        });

        STAGES.map((s) => {
            const deployment = new ServiceStage(this, (s.name.toLowerCase() + 'Deployment'), {
                env: { account: s.accountId, region: s.region },
                stageName: s.name.toLowerCase(),
                lambdaArchitecture: lambda.Architecture.ARM_64

            });

            const stage = pipeline.addStage(deployment)

            if (stage.stageName !== 'prod') {
                stage.addPre(
                    new CodeBuildStep(stage.stageName + "RunUnitTests", {
                        projectName: stage.stageName + "RunUnitTests",
                        installCommands: [
                            "cd cdk_package",
                            'npm install',
                        ],

                        commands: [
                            "pwd",
                            "ls",
                            "npm run build",
                            "npm run test ./test"
                        ]
                    })
                );
                stage.addPost(
                    new CodeBuildStep(stage.stageName + "TestAPIGatewayEndPoint", {
                        projectName: stage.stageName + "TestAPIGatewayEndpoint",
                        envFromCfnOutputs: {
                            ENDPOINT_URL: deployment.apiURL
                        },
                        commands: ["echo $ENDPOINT_URL",
                            "curl -Ssf $ENDPOINT_URL"
                        ]
                    }
                    )
                )
            }

        })
    }
}