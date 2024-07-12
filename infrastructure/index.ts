import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const bucketNameAndUrl = config.require("bucket");

// Create a bucket and expose a website index document
const bucket = new aws.s3.Bucket(
  bucketNameAndUrl,
  {
    arn: `arn:aws:s3:::${bucketNameAndUrl}`,
    bucket: bucketNameAndUrl,
    hostedZoneId: "Z3BJ6K6RIION7M",
    requestPayer: "BucketOwner",
    serverSideEncryptionConfiguration: {
      rule: {
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: "AES256",
        },
      },
    },
    versioning: {
      enabled: true,
    },
    website: {
      errorDocument: "index.html",
      indexDocument: "index.html",
    },
    websiteDomain: "s3-website-us-west-2.amazonaws.com",
    websiteEndpoint: `${bucketNameAndUrl}.s3-website-us-west-2.amazonaws.com`,
  },
  {
    protect: true,
  },
);

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
  `${bucketNameAndUrl}-public-access-block`,
  {
    bucket: bucket.id,
    blockPublicAcls: false,
  },
);

const bucketPolicy = new aws.s3.BucketPolicy(
  `${bucketNameAndUrl}-bucket-policy`,
  {
    bucket: bucket.id, // refer to the bucket created earlier
    policy: pulumi.jsonStringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [pulumi.interpolate`${bucket.arn}/*`],
        },
      ],
    }),
  },
  { dependsOn: publicAccessBlock },
);

const exampleBucketOwnershipControls = new aws.s3.BucketOwnershipControls(
  `${bucketNameAndUrl}-ownership-controls`,
  {
    bucket: bucket.id,
    rule: {
      objectOwnership: "ObjectWriter",
    },
  },
);

const distribution = new aws.cloudfront.Distribution(
  `${bucketNameAndUrl}-distribution`,
  {
    aliases: [bucketNameAndUrl],
    defaultCacheBehavior: {
      allowedMethods: ["GET", "HEAD"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      defaultTtl: 31536000,
      forwardedValues: {
        cookies: {
          forward: "none",
        },
        queryString: false,
      },
      maxTtl: 31536000,
      minTtl: 31536000,
      targetOriginId: `S3-Website-${bucketNameAndUrl}.s3-website-us-west-2.amazonaws.com`,
      viewerProtocolPolicy: "redirect-to-https",
    },
    defaultRootObject: "index.html",
    enabled: true,
    isIpv6Enabled: true,
    origins: [
      {
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "http-only",
          originSslProtocols: ["TLSv1", "TLSv1.1", "TLSv1.2"],
        },
        domainName: bucket.websiteEndpoint,
        originId: `S3-Website-${bucketNameAndUrl}.s3-website-us-west-2.amazonaws.com`,
      },
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },
    viewerCertificate: {
      acmCertificateArn:
        "arn:aws:acm:us-east-1:120356305272:certificate/10f59a3f-a08e-4b8d-8a4c-f0a5fcb61e83",
      minimumProtocolVersion: "TLSv1.2_2021",
      sslSupportMethod: "sni-only",
    },
  },
  {
    protect: true,
  },
);

export const bucketUrn = bucket.urn;
export const publicAccessBlockUrn = publicAccessBlock.urn;
export const bucketPolicyUrn = bucketPolicy.urn;
export const exampleBucketOwnershipControlsUrn =
  exampleBucketOwnershipControls.urn;
export const distributionUrn = distribution.urn;
