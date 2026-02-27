const { S3Client, ListBucketsCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function testCredentials() {
  console.log("\n🔍 Testing AWS S3 Credentials\n");
  console.log("================================");
  
  // Check environment variables
  console.log("\n📋 Configuration:");
  console.log("Region:", process.env.AWS_REGION || "❌ NOT SET");
  console.log("Access Key ID:", process.env.AWS_ACCESS_KEY_ID || "❌ NOT SET");
  console.log("Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? "✅ SET (***" + process.env.AWS_SECRET_ACCESS_KEY.slice(-4) + ")" : "❌ NOT SET");
  console.log("Bucket Name:", process.env.AWS_S3_BUCKET_NAME || "❌ NOT SET");
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("\n❌ ERROR: AWS credentials not set in .env file");
    return;
  }

  // Check for spaces in credentials
  if (process.env.AWS_ACCESS_KEY_ID.includes(" ") || process.env.AWS_SECRET_ACCESS_KEY.includes(" ")) {
    console.error("\n⚠️  WARNING: Credentials contain spaces! Remove spaces from .env file");
  }

  // Check secret key length
  const secretKeyLength = process.env.AWS_SECRET_ACCESS_KEY.length;
  console.log("\nSecret Key Length:", secretKeyLength, secretKeyLength === 40 ? "✅" : "⚠️  (Should be 40)");

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log("\n🧪 Test 1: List Buckets");
    console.log("================================");
    
    const listCommand = new ListBucketsCommand({});
    const listResponse = await s3Client.send(listCommand);

    console.log("✅ Credentials are VALID!");
    console.log("\nYour S3 Buckets:");
    listResponse.Buckets.forEach(bucket => {
      const isTarget = bucket.Name === process.env.AWS_S3_BUCKET_NAME;
      console.log(`  ${isTarget ? "👉" : "  "} ${bucket.Name}${isTarget ? " (TARGET)" : ""}`);
    });

    // Check if target bucket exists
    const bucketExists = listResponse.Buckets.some(b => b.Name === process.env.AWS_S3_BUCKET_NAME);
    if (!bucketExists) {
      console.log(`\n⚠️  WARNING: Bucket '${process.env.AWS_S3_BUCKET_NAME}' not found!`);
      console.log("   Please create this bucket or update AWS_S3_BUCKET_NAME in .env");
    } else {
      console.log(`\n✅ Target bucket '${process.env.AWS_S3_BUCKET_NAME}' exists!`);
      
      // Test upload
      console.log("\n🧪 Test 2: Upload Test File");
      console.log("================================");
      
      const testContent = "Test file from AWS S3 migration - " + new Date().toISOString();
      const testKey = "test-upload-" + Date.now() + ".txt";
      
      const putCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: testKey,
        Body: testContent,
        ContentType: "text/plain",
      });
      
      await s3Client.send(putCommand);
      
      const testUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
      console.log("✅ Upload successful!");
      console.log("Test file URL:", testUrl);
      console.log("\n💡 Try opening this URL in your browser to verify public access");
    }

    console.log("\n================================");
    console.log("🎉 All tests passed!");
    console.log("================================\n");

  } catch (error) {
    console.error("\n================================");
    console.error("❌ Test Failed!");
    console.error("================================");
    console.error("\nError:", error.name);
    console.error("Message:", error.message);
    
    if (error.name === "SignatureDoesNotMatch") {
      console.error("\n🔧 FIX: Your AWS Secret Access Key is incorrect!");
      console.error("\nSteps to fix:");
      console.error("1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/");
      console.error("2. Click Users → Your User → Security credentials");
      console.error("3. Create a NEW access key");
      console.error("4. Update server/.env with the new credentials");
      console.error("5. Run this test again");
    } else if (error.name === "InvalidAccessKeyId") {
      console.error("\n🔧 FIX: Your AWS Access Key ID is incorrect!");
      console.error("\nSteps to fix:");
      console.error("1. Verify AWS_ACCESS_KEY_ID in server/.env");
      console.error("2. Check for typos or extra spaces");
      console.error("3. Create new access key if needed");
    } else if (error.name === "AccessDenied") {
      console.error("\n🔧 FIX: Your IAM user lacks S3 permissions!");
      console.error("\nSteps to fix:");
      console.error("1. Go to AWS IAM Console");
      console.error("2. Add AmazonS3FullAccess policy to your user");
      console.error("3. Or add custom policy with s3:PutObject, s3:GetObject permissions");
    } else {
      console.error("\n🔧 Troubleshooting:");
      console.error("1. Check server/.env file has correct credentials");
      console.error("2. Verify no spaces around = signs in .env");
      console.error("3. Ensure IAM user has S3 permissions");
      console.error("4. Check AWS region is correct (eu-north-1)");
    }
    
    console.error("\n📚 See FIX_AWS_CREDENTIALS.md for detailed help\n");
  }
}

testCredentials();
