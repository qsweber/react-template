import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const bucket_name_and_url = "template.quinnweber.com";

// Create a bucket and expose a website index document
const bucket = new aws.s3.Bucket(
  bucket_name_and_url,
  {
    arn: `arn:aws:s3:::${bucket_name_and_url}`,
    bucket: bucket_name_and_url,
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
      errorDocument: "error.html",
      indexDocument: "index.html",
    },
    websiteDomain: "s3-website-us-west-2.amazonaws.com",
    websiteEndpoint: `${bucket_name_and_url}.s3-website-us-west-2.amazonaws.com`,
  },
  {
    protect: true,
  },
);

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
  `${bucket}-public-access-block`,
  {
    bucket: bucket.id,
    blockPublicAcls: false,
  },
);

const bucketPolicy = new aws.s3.BucketPolicy(
  `${bucket}-bucket-policy`,
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
  `${bucket}-ownership-controls`,
  {
    bucket: bucket.id,
    rule: {
      objectOwnership: "ObjectWriter",
    },
  },
);

const distribution = new aws.cloudfront.Distribution(
  `${bucket}-distribution`,
  {
    aliases: [bucket_name_and_url],
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
      targetOriginId: `S3-Website-${bucket_name_and_url}.s3-website-us-west-2.amazonaws.com`,
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
        originId: `S3-Website-${bucket_name_and_url}.s3-website-us-west-2.amazonaws.com`,
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

export const bucketId = bucket.id;
export const publicAccessBlockId = publicAccessBlock.id;
export const bucketPolicyId = bucketPolicy.id;
export const exampleBucketOwnershipControlsId =
  exampleBucketOwnershipControls.id;
export const distributionId = distribution.id;
