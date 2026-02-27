# 🚀 Quick Start - AWS S3 Setup

## 3-Minute Setup

### Step 1: Install (30 seconds)
```bash
cd server
npm install
```

### Step 2: Create S3 Bucket (1 minute)
1. Go to: https://s3.console.aws.amazon.com/
2. Click "Create bucket"
3. Name: `inext-service-provider-files` (or your choice)
4. Region: `eu-north-1`
5. Uncheck "Block all public access"
6. Click "Create"

### Step 3: Update Config (30 seconds)
Edit `server/.env`:
```env
AWS_S3_BUCKET_NAME = inext-service-provider-files
```
(Use your actual bucket name)

### Step 4: Set Bucket Policy (1 minute)
1. Go to bucket → Permissions → Bucket Policy
2. Paste (replace `inext-service-provider-files` with your bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::inext-service-provider-files/*"
        }
    ]
}
```

3. Save

### Step 5: Start Server (10 seconds)
```bash
npm run dev
```

Look for: `✅ AWS S3 connected successfully`

### Step 6: Test (30 seconds)
Upload any image through your app. Check S3 bucket for the file.

## ✅ Done!

Your app now uses AWS S3 instead of Cloudinary.

---

## Already Configured

✅ AWS Credentials (in .env)
✅ Region: eu-north-1
✅ All code updated
✅ Database format unchanged

## Need More Help?

- **Full Setup:** See `server/SETUP_S3.md`
- **Checklist:** See `S3_SETUP_CHECKLIST.md`
- **Migration Details:** See `CLOUDINARY_TO_S3_MIGRATION.md`

## Troubleshooting

**Server won't start?**
- Run `npm install` first
- Check `.env` has AWS credentials

**Upload fails?**
- Set bucket name in `.env`
- Check bucket policy is set
- Verify bucket is in eu-north-1

**URL doesn't work?**
- Add bucket policy (Step 4)
- Check bucket name is correct
