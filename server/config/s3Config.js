const { S3Client } = require("@aws-sdk/client-s3");

let s3Client = null;

exports.s3Connect = () => {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log("✅ AWS S3 connected successfully");
  } catch (error) {
    console.error("❌ AWS S3 connection error:", error);
  }
};

exports.getS3Client = () => {
  if (!s3Client) {
    throw new Error("S3 client not initialized. Call s3Connect() first.");
  }
  return s3Client;
};
