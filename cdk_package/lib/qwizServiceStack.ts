import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origin from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as logs from 'aws-cdk-lib/aws-logs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as target from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { Rule } from 'aws-cdk-lib/aws-events';

export interface ServiceStackProps extends StackProps {
    readonly stageName: string;
    lambdaArchitecture?: lambda.Architecture;
}

export class CdkPackageStack extends Stack {
    public readonly tableName: string;
    public readonly apiURL: cdk.CfnOutput;
    constructor(scope: Construct, id: string, props: ServiceStackProps) {
        super(scope, id, props);

        // if prod stage, don't want to prefix this to dns names
        const isStageProd = props.stageName == 'prod' ? "" : props.stageName

        //  dynamo table
        const table = new ddb.Table(this, 'TABLE NAME', {
            tableName: 'TABLE NAME',
            partitionKey: {
                name: 'role',
                type: ddb.AttributeType.STRING,
            },
            sortKey: {
                name: 'question',
                type: ddb.AttributeType.STRING
            }
        });
        this.tableName = table.tableName;
        table.applyRemovalPolicy(RemovalPolicy.DESTROY)

        // lambda fetch interview question data
        const getFunction = new lambda.Function(this, 'getFunction', {
            functionName: props.stageName + "GetFunction",
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'get_index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'lambdaHandler')),
            environment: {
                'TABLE_NAME': table.tableName
            },
            architecture: props.lambdaArchitecture
        });

        if (getFunction.role === null) {
            throw new Error('Lambda function role cannot be null');
        }

        getFunction.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'))

        getFunction.addEnvironment("TABLE_NAME", table.tableName)

        if (props.stageName != 'prod') {
            getFunction.addEnvironment("DNS_STAGE", props.stageName)
        }

        table.grantReadWriteData(getFunction)

        // lambda write interview question data
        const putFunction = new lambda.Function(this, 'putFunction', {
            functionName: props.stageName + "PutFunction",
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: 'put_index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'lambdaHandler')),
            environment: {
                'TABLE_NAME': table.tableName
            },
            architecture: props.lambdaArchitecture
        });

        if (putFunction.role === null) {
            throw new Error('Lambda function role cannot be null');
        }

        putFunction.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'))

        putFunction.addEnvironment("TABLE_NAME", table.tableName)

        if (props.stageName != 'prod') {
            putFunction.addEnvironment("DNS_STAGE", props.stageName)
        }

        table.grantReadWriteData(putFunction)

        const bucket = new s3.Bucket(this, 'BUCKET', {
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        });

        bucket.addCorsRule({
            allowedOrigins: ["https://" + isStageProd + "qwiz.ncharlbr.people.aws.dev", "https://" + isStageProd + "qwiz-api.ncharlbr.people.aws.dev"],
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST],
            allowedHeaders: ["*"],
            exposedHeaders: ["Access-Control-Allow-Origin"]
        })

        const deployment = new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../qwiz_app'))],
            destinationBucket: bucket,
        });

        const oai = new cloudfront.OriginAccessIdentity(this, 'epa-oai');

        bucket.grantRead(oai);

        const api = new apigateway.RestApi(this, 'qwiz-api-ncharlbr', {
            restApiName: 'qwiz-api-ncharlbr',
            defaultCorsPreflightOptions: {
                allowOrigins: ["https://" + isStageProd + "qwiz.ncharlbr.people.aws.dev"],
                allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
                allowMethods: ["GET", "PUT"]
            },
        });

        const putlambdaintegration = new apigateway.LambdaIntegration(putFunction);
        const getlambdaintegration = new apigateway.LambdaIntegration(getFunction);

        // input your own domain name here. 
        const hosted_zone_name = 'ncharlbr.people.aws.dev';
        const hostedZoneID = 'HOSTEDZONE ID';
        const novaCrossDNSRole = 'IAM ROLE ARN';

        // constructing the api url with the domain name
        const qwuiz_api_zone_name = isStageProd + 'qwiz-api.' + hosted_zone_name

        // looking up root hosted zone
        const my_hosted_zone = route53.HostedZone.fromHostedZoneAttributes(this, 'hosted_zone', {
            hostedZoneId: hostedZoneID,
            zoneName: hosted_zone_name,
        });

        // creating a public zone for the sub domain for the api
        const api_hosted_sub_zone = new route53.PublicHostedZone(this, 'api_sub', {
            zoneName: qwuiz_api_zone_name,
        });

        const domain_delegation_api = new route53.CrossAccountZoneDelegationRecord(this, 'zoneDelegationAPI', {
            delegatedZone: api_hosted_sub_zone,
            parentHostedZoneId: hostedZoneID,
            delegationRole: iam.Role.fromRoleArn(this, "DelegationRoleAPI", 'IAM ROLE')
        });

        // SSL certificate
        const ssl_cert_api = new acm.DnsValidatedCertificate(this, 'CertificateDistributionAPI', {
            domainName: qwuiz_api_zone_name,
            hostedZone: api_hosted_sub_zone,
        });

        // adding the domain name to the api gateway
        api.addDomainName('api_domain', {
            domainName: qwuiz_api_zone_name,
            certificate: ssl_cert_api,
        });

        // creating text records for security
        // values provided state that no email addresses/IPs are allowed to send emails from this domain
        new route53.TxtRecord(this, 'api_domain_txt_record_spf', {
            zone: api_hosted_sub_zone,
            recordName: qwuiz_api_zone_name,
            values: ['v=spf1 -all'],
            comment: 'PreventEmailSpoofing'
        });

        // creating text records for security
        // values provided aids the spf records to mitigate spoofing 
        new route53.TxtRecord(this, 'api_domain_txt_record', {
            zone: api_hosted_sub_zone,
            recordName: '_dmarc.' + qwuiz_api_zone_name,
            values: ['v=DMARC1; p=reject; rua=mailto:report@dmarc.amazon.com; ruf=mailto:report@dmarc.amazon.com'],
            comment: 'PreventEmailSpoofing'
        });

        // Cloudfront: api

        new route53.ARecord(this, 'APIARecord', {
            zone: api_hosted_sub_zone,
            target: route53.RecordTarget.fromAlias(new target.ApiGateway(api)),
            ttl: cdk.Duration.minutes(5)
        });

        new route53.AaaaRecord(this, 'APIAAAARecord', {
            zone: api_hosted_sub_zone,
            target: route53.RecordTarget.fromAlias(new target.ApiGateway(api)),
            ttl: cdk.Duration.minutes(5)
        });

        // constructing the distribution url using the parent domain name
        const qwuiz_distribution_zone_name = isStageProd + 'qwiz.' + hosted_zone_name

        // create a zone for the sub domain for the distribution
        const distribution_hosted_sub_zone = new route53.PublicHostedZone(this, 'distribution_sub', {
            zoneName: qwuiz_distribution_zone_name
        });

        const domain_delegation_cdn = new route53.CrossAccountZoneDelegationRecord(this, 'zoneDelegationCDN', {
            delegatedZone: distribution_hosted_sub_zone,
            parentHostedZoneId: hostedZoneID,
            delegationRole: iam.Role.fromRoleArn(this, "DelegationRoleCDN", 'IAM ROLE')
        });

        // SSL certificate
        const ssl_cert_distribution = new acm.DnsValidatedCertificate(this, 'CertificateDistributionCDN', {
            domainName: qwuiz_distribution_zone_name,
            hostedZone: distribution_hosted_sub_zone,
            region: 'us-east-1', // us-east-1 required for certificate management with CloudFront
        });

        const distribution = new cloudfront.Distribution(this, 'epa_cloudfront', {
            defaultBehavior: {
                origin: new origin.S3Origin(deployment.deployedBucket, {
                    originAccessIdentity: oai,
                    originPath: '/lib'
                }),
                originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
                cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
            },
            domainNames: [qwuiz_distribution_zone_name],
            certificate: ssl_cert_distribution,
            enableIpv6: true,
            defaultRootObject: "index.html"
        });

        // creating text records for security
        // values provided state that no email addresses/IPs are allowed to send emails from this domain
        new route53.TxtRecord(this, 'distribution_domain_txt_record_spf', {
            zone: distribution_hosted_sub_zone,
            recordName: qwuiz_distribution_zone_name,
            values: ['v=spf1 -all'],
            comment: 'PreventEmailSpoofing'
        });

        // creating text records for security
        // values provided aids the spf records to mitigate spoofing 
        new route53.TxtRecord(this, 'distribution_domain_txt_record', {
            zone: distribution_hosted_sub_zone,
            recordName: '_dmarc.' + qwuiz_distribution_zone_name,
            values: ['v=DMARC1; p=reject; rua=mailto:report@dmarc.amazon.com; ruf=mailto:report@dmarc.amazon.com'],
            comment: 'PreventEmailSpoofing'
        });

        // Cloudfront: records

        new route53.ARecord(this, 'DistributionARecord', {
            zone: distribution_hosted_sub_zone,
            target: route53.RecordTarget.fromAlias(new target.CloudFrontTarget(distribution)),
            ttl: cdk.Duration.minutes(5)
        });

        new route53.AaaaRecord(this, 'DistributionAAAARecord', {
            zone: distribution_hosted_sub_zone,
            target: route53.RecordTarget.fromAlias(new target.CloudFrontTarget(distribution)),
            ttl: cdk.Duration.minutes(5)
        });

        const putresource = api.root.addResource("put-question");
        putresource.addMethod("PUT", putlambdaintegration);

        const getresource = api.root.addResource("question");
        getresource.addMethod("GET", getlambdaintegration);

        this.apiURL = new cdk.CfnOutput(this, 'GatewayUrl', {
            value: api.url + getresource.path
        });

        // cloud trail
        const key = new kms.Key(this, 'cloudTrailKey', {
            enableKeyRotation: true,
        });

        key.grantEncrypt(new iam.ServicePrincipal('cloudtrail.amazonaws.com'));

        const topic = new sns.Topic(this, 'APIEvents')
        const trail = new cloudtrail.Trail(this, 'CloudTrail', {
            snsTopic: topic,
            sendToCloudWatchLogs: true,
            cloudWatchLogsRetention: logs.RetentionDays.FOUR_MONTHS,
            trailName: 'Qwiz-Events',
            encryptionKey: key
        });

    };
};

