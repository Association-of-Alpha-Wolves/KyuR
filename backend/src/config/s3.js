import { S3Client } from '@aws-sdk/client-s3';

/**
 * Shared S3 client instance.
 * Credentials and region are sourced exclusively from environment variables —
 * never hardcoded. The SDK will throw at request time if any value is missing.
 */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
