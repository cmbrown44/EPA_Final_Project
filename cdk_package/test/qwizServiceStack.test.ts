import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as CdkPackage from '../lib/qwizServiceStack';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda'

const isTestStage = process.env.STAGE === 'alpha' || 'gamma';

test('DynamoDB table created', () => {

    if (!isTestStage) {
        console.log('Not a test stage.')
        return
    }

    const app = new cdk.App();

    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [{
            "AttributeName": "role", "KeyType": "HASH"
        }, { "AttributeName": "question", "KeyType": "RANGE" }]
    });
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
});

test('Lambda functions created with required properties', () => {

    if (!isTestStage) {
        console.log('Not a test stage.')
        return
    }

    const app = new cdk.App();

    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });

    const template = Template.fromStack(stack);

    template.resourcePropertiesCountIs('AWS::Lambda::Function',
        Match.objectLike({
            Runtime: "nodejs18.x",
            Environment: { Variables: { "TABLE_NAME": Match.anyValue() } },
            Architectures: Match.arrayWith(["arm64"])
        }
        ), 2);
});

test('S3 bucket created', () => {
    if (!isTestStage) {
        return
    }

    const app = new cdk.App();
    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::S3::Bucket', 2);
});

test('API Gateway created', () => {
    if (!isTestStage) {
        return
    }

    const app = new cdk.App();
    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    }
    );
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
});

test('CloudFront Distribution created', () => {
    if (!isTestStage) {
        return
    }

    const app = new cdk.App();
    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
});

test('KMS key created', () => {
    if (!isTestStage) {
        return
    }

    const app = new cdk.App();
    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::KMS::Key', {
        EnableKeyRotation: true
    });
    template.resourceCountIs('AWS::KMS::Key', 1);
});

test('CloudTrail Trail created', () => {
    if (!isTestStage) {
        return
    }

    const app = new cdk.App();
    const stack = new CdkPackage.CdkPackageStack(app, 'MyTestStack', {
        stageName: 'test',
        lambdaArchitecture: lambda.Architecture.ARM_64
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::CloudTrail::Trail', 1);
});


