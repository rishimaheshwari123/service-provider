# AWS S3 Setup Checklist

## ✅ Completed (Already Done)

- [x] Created S3 configuration files
- [x] Created S3 uploader with same interface as Cloudinary
- [x] Updated all controller imports
- [x] Updated server/index.js to use S3
- [x] Added AWS SDK to package.json
- [x] Added AWS credentials to .env
- [x] Maintained same database format
- [x] Updated console logs

## 🔧 Required Actions (You Need to Do)

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create S3 Bucket
- [ ] Go to AWS S3 Console: https://s3.console.aws.amazon.com/
- [ ] Click "Create bucket"
- [ ] Enter bucket name (e.g., `inext-service-provider-files`)
- [ ] Select region: `eu-north-1` (Stockholm)
- [ ] Uncheck "Block all public access" (if you need public URLs)
- [ ] Click "Create bucket"

### 3. Update .env File
- [ ] Open `server/.env`
- [ ] Replace `your-bucket-name` with your actual bucket name
- [ ] Save the file

Example:
```env
AWS_S3_BUCKET_NAME = inext-service-provider-files
```

### 4. Configure Bucket Permissions

#### For Public Access (Recommended for images):
- [ ] Go to your bucket → Permissions → Bucket Policy
- [ ] Click "Edit"
- [ ] Paste this policy (replace `your-bucket-name`):

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

- [ ] Click "Save changes"

### 5. Configure CORS (Optional, for browser uploads)
- [ ] Go to your bucket → Permissions → CORS
- [ ] Click "Edit"
- [ ] Paste this configuration:

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

- [ ] Click "Save changes"

### 6. Start Server
```bash
cd server
npm run dev
```

- [ ] Check console for: `✅ AWS S3 connected successfully`

### 7. Test Upload
- [ ] Test any upload endpoint (category, blog, vendor, etc.)
- [ ] Verify file appears in S3 bucket
- [ ] Verify URL in database is accessible
- [ ] Check image displays correctly

## 🔍 Verification Steps

### Check S3 Connection
```bash
# Start server and look for this message:
✅ AWS S3 connected successfully
```

### Test Image Upload
```bash
curl -X POST http://localhost:8000/api/v1/image/upload \
  -F "thumbnail=@test-image.jpg"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "url": "https://your-bucket.s3.eu-north-1.amazonaws.com/...",
    "public_id": "folder/filename.jpg"
  }
}
```

### Verify in S3 Console
- [ ] Go to S3 bucket
- [ ] Check if file exists in correct folder
- [ ] Click on file and check "Object URL"
- [ ] Open URL in browser to verify it's accessible

## 🚨 Troubleshooting

### Error: "AWS_S3_BUCKET_NAME not configured"
**Solution:** Set bucket name in `.env` and restart server

### Error: "Access Denied"
**Solution:** 
1. Check IAM user has S3 permissions
2. Verify bucket policy allows uploads
3. Confirm credentials are correct

### Error: "S3 client not initialized"
**Solution:** 
1. Check AWS credentials in `.env`
2. Verify region is correct
3. Restart server

### Files upload but URLs don't work
**Solution:**
1. Add bucket policy for public read access
2. Check bucket name in URL matches actual bucket
3. Verify CORS configuration

## 📝 Important Notes

1. **Bucket Name:** Must be globally unique across all AWS accounts
2. **Region:** Must be `eu-north-1` (Stockholm) as configured
3. **Credentials:** Already added to `.env`, keep them secure
4. **Database:** Format remains the same, no migration needed
5. **Rollback:** Old Cloudinary config is commented in `.env` if needed

## 📚 Documentation

- **S3_MIGRATION_SUMMARY.md** - Overview of changes
- **CLOUDINARY_TO_S3_MIGRATION.md** - Detailed migration guide
- **server/SETUP_S3.md** - Complete setup instructions

## ✅ Final Checklist

Before going live:
- [ ] Dependencies installed
- [ ] S3 bucket created
- [ ] Bucket name updated in .env
- [ ] Bucket permissions configured
- [ ] Server starts without errors
- [ ] Test upload successful
- [ ] File accessible via URL
- [ ] All upload endpoints tested

## 🎉 Success Criteria

You're done when:
1. Server starts with "✅ AWS S3 connected successfully"
2. File uploads work without errors
3. Files appear in S3 bucket
4. URLs are accessible and images display
5. Database saves URLs in correct format

---

**Need Help?** Check `server/SETUP_S3.md` for detailed troubleshooting.
