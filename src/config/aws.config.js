import {
  S3Client
} from "@aws-sdk/client-s3";


// Create a new S3 client using the provided AWS credentials and region
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  },
});


export default s3Client;