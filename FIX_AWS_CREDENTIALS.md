# 🔧 Fix AWS Credentials - SignatureDoesNotMatch Error

## Problem
The AWS Secret Access Key is incorrect, causing authentication to fail.

Error: `SignatureDoesNotMatch: The request signature we calculated does not match the signature you provided.`

## Solution

You need to get the correct AWS credentials. Follow these steps:

---

## Option 1: Create New Access Key (Recommended)

### Step 1: Go to AWS IAM Console
https://console.aws.amazon.com/iam/

### Step 2: Navigate to Your User
1. Click "Users" in the left sidebar
2. Find and click on your IAM user

### Step 3: Create New Access Key
1. Click on "Security credentials" tab
2. Scroll down to "Access keys" section
3. Click "Create access key"
4. Select "Application running outside AWS"
5. Click "Next"
6. Add description: "Service Provider App"
7. Click "Create access key"

### Step 4: Copy Credentials
You'll see:
```
Access key ID: AKIA...
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

⚠️ **IMPORTANT:** Copy the Secret Access Key NOW! You won't be able to see it again.

### Step 5: Update .env File
Edit `server/.env`:

```env
# AWS S3 Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=niyati-images-bucket
```

### Step 6: Restart Server
```bash
cd server
npm run dev
```

---

## Option 2: Verify Current Credentials

If you're sure the credentials are correct, check for these issues:

### 1. Remove Spaces
Make sure there are NO spaces around the `=` sign:

❌ Wrong:
```env
AWS_SECRET_ACCESS_KEY = n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
```

✅ Correct:
```env
AWS_SECRET_ACCESS_KEY=n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
```

### 2. Check for Hidden Characters
- No quotes around the value
- No trailing spaces
- No line breaks in the middle

### 3. Verify Key Length
AWS Secret Access Keys are exactly 40 characters long. Count yours:
```
n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
```
This is 44 characters, which might be correct if it includes special characters.

---

## Option 3: Use AWS CLI to Test

Test your credentials:

```bash
# Install AWS CLI if not installed
# Windows: https://aws.amazon.com/cli/

# Configure credentials
aws configure

# Test access
aws s3 ls s3://niyati-images-bucket --region eu-north-1
```

If this works, copy the credentials from `~/.aws/credentials`

---

## Required IAM Permissions

Your IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::niyati-images-bucket",
                "arn:aws:s3:::niyati-images-bucket/*"
            ]
        }
    ]
}
```

To add these:
1. Go to IAM → Users → Your User
2. Click "Add permissions" → "Attach policies directly"
3. Search for "AmazonS3FullAccess" (or create custom policy above)
4. Click "Add permissions"

---

## Verification Steps

After updating credentials:

1. **Restart server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check console for:**
   ```
   ✅ AWS S3 connected successfully
   ```

3. **Test upload:**
   - Upload an image through your app
   - Check if it appears in S3 bucket

4. **If still fails:**
   - Double-check credentials in AWS Console
   - Verify IAM permissions
   - Check bucket name is correct
   - Ensure region is eu-north-1

---

## Common Issues

### Issue 1: "Access Denied"
**Solution:** Check IAM permissions (see above)

### Issue 2: "Invalid Access Key"
**Solution:** Create new access key

### Issue 3: "Bucket not found"
**Solution:** Verify bucket name and region

### Issue 4: Still getting SignatureDoesNotMatch
**Solution:** 
1. Delete the old access key in AWS Console
2. Create a brand new access key
3. Update .env with new credentials
4. Restart server

---

## Quick Fix Script

Create a file `test-aws-credentials.js` in server directory:

```javascript
const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

async function testCredentials() {
  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log("Testing AWS credentials...");
    console.log("Region:", process.env.AWS_REGION);
    console.log("Access Key:", process.env.AWS_ACCESS_KEY_ID);
    console.log("Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? "***" + process.env.AWS_SECRET_ACCESS_KEY.slice(-4) : "NOT SET");

    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    console.log("✅ Credentials are valid!");
    console.log("Your buckets:", response.Buckets.map(b => b.Name));
  } catch (error) {
    console.error("❌ Credentials test failed:", error.message);
    console.error("\nPlease check:");
    console.error("1. AWS_ACCESS_KEY_ID is correct");
    console.error("2. AWS_SECRET_ACCESS_KEY is correct");
    console.error("3. IAM user has S3 permissions");
  }
}

testCredentials();
```

Run it:
```bash
cd server
node test-aws-credentials.js
```

---

## Need Help?

If you're still stuck:

1. **Check AWS Console:**
   - Verify the access key exists
   - Check IAM permissions
   - Verify bucket exists

2. **Create fresh credentials:**
   - Delete old access key
   - Create new access key
   - Update .env
   - Restart server

3. **Contact AWS Support:**
   - If credentials are definitely correct
   - But still getting signature errors

---

**Most Common Solution:** Create a new access key and update .env file.
