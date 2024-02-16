import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { CdkPackageStack } from './qwizServiceStack';
import { MonitoringDashboardStack } from './monitoringQwizServiceStack';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface ServiceStageProps extends cdk.StageProps {
    readonly stageName: string;
    lambdaArchitecture?: lambda.Architecture | undefined;
}
export class ServiceStage extends cdk.Stage {

    public readonly apiURL: cdk.CfnOutput;

    constructor(scope: Construct, id: string, props?: ServiceStageProps) {
        super(scope, id, props);

        const stageNameProp = props?.stageName;
        const lambdaArchitectureProp = props?.lambdaArchitecture

        const cdkStack = new CdkPackageStack(this, 'cdkStack', {
            stageName: stageNameProp || '',
            lambdaArchitecture: lambdaArchitectureProp,
        });

        this.apiURL = cdkStack.apiURL

        const monitoringDashboardStack = new MonitoringDashboardStack(this, 'monitoringDashboardStack', {
            stageName: stageNameProp || '',
            dashboardName: "QwizServiceDashboard"
        });
        const displayName = props?.stageName ? props?.stageName : ""

        monitoringDashboardStack.addLambda(displayName + "GetFunction", displayName + "GetFunction");
        monitoringDashboardStack.addLambda(displayName + "PutFunction", displayName + "PutFunction");
        monitoringDashboardStack.addApi(displayName + "epa", displayName + "epa");
        monitoringDashboardStack.addDyanmoDB(displayName + "TABLE NAME", displayName + "TABLE NAME");
    }
}