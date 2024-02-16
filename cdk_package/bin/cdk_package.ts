#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { QwizPipelineStack } from "../lib/pipelineQwizServiceStack";

const app = new cdk.App();
new QwizPipelineStack(app, 'QwizPipelineStack', {
    env: {
        account: 'INSERT ACCOUNT NUMBER TO HOST PIPELINE STACK',
        region: 'eu-west-1',
    }
});
app.synth();
