# AWS S3 Setup Instructions

## Quick Setup

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-s3
```

### 2. Configure Environment Variables

Update your `server/.env` file:

```env
# AWS S3 Configuration
AWS_REGION = eu-north-1
AWS_ACCESS_KEY_ID = AKIAU64M3DMQNNYRV477
AWS_SECRET_ACCESS_KEY = n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
AWS_S3_BUCKET_NAME = your-actual-bucket-name
```

**⚠️ IMPORTANT:** Replace `your-actual-bucket-name` with your real S3 bucket name!

### 3. Create S3 Bucket (if not exists)

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Bucket name: Choose a unique name (e.g., `inext-service-provider-files`)
4. Region: Select `eu-north-1` (Stockholm)
5. Uncheck "Block all public access" if you need public URLs
6. Click "Create bucket"

### 4. Configure Bucket Permissions

#### Option A: Public Read Access (for public images)

Go to your bucket → Permissions → Bucket Policy, add:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

#### Option B: Private Access (use signed URLs later)

Keep default settings, files will be private.

### 5. Configure CORS (if accessing from browser)

Go to your bucket → Permissions → CORS, add:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 6. Verify IAM User Permissions

Your IAM user (AKIAU64M3DMQNNYRV477) needs these permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject` (optional)

### 7. Start Server

```bash
npm run dev
```

You should see: `✅ AWS S3 connected successfully`

## Testing

Test upload with curl:

```bash
curl -X POST http://localhost:8000/api/v1/image/upload \
  -F "thumbnail=@/path/to/image.jpg"
```

## Troubleshooting

### Error: "AWS_S3_BUCKET_NAME not configured"
- Make sure you set `AWS_S3_BUCKET_NAME` in `.env`
- Restart the server after changing `.env`

### Error: "Access Denied"
- Check IAM user permissions
- Verify bucket policy allows uploads
- Ensure credentials are correct

### Error: "S3 client not initialized"
- Server didn't start properly
- Check console for S3 connection errors
- Verify AWS credentials are valid

### Files upload but URLs don't work
- Check bucket policy for public read access
- Verify CORS configuration
- Ensure bucket name in URL matches actual bucket

## File URL Format

Uploaded files will have URLs like:
```
https://your-bucket-name.s3.eu-north-1.amazonaws.com/folder/filename.jpg
```

## Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Rotate credentials regularly** - Change AWS keys periodically
3. **Use IAM roles** - For production, use EC2 IAM roles instead of access keys
4. **Limit permissions** - Only grant necessary S3 permissions
5. **Enable bucket versioning** - Protect against accidental deletions
6. **Monitor usage** - Set up CloudWatch alerts for unusual activity

## Cost Considerations

AWS S3 pricing (eu-north-1):
- Storage: ~$0.023 per GB/month
- PUT requests: ~$0.005 per 1,000 requests
- GET requests: ~$0.0004 per 1,000 requests
- Data transfer out: First 100GB free, then ~$0.09 per GB

For typical usage, costs should be minimal (few dollars per month).
