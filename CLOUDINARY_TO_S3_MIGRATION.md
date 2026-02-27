# Cloudinary to AWS S3 Migration Guide

## Overview
This document describes the migration from Cloudinary to AWS S3 for image and PDF uploads.

## Changes Made

### 1. New Configuration Files
- **server/config/s3Config.js** - AWS S3 client initialization
- **server/config/s3Uploader.js** - S3 upload functionality (maintains same interface as Cloudinary)

### 2. Updated Files
- **server/index.js** - Changed from `cloudinaryConnect()` to `s3Connect()`
- **server/package.json** - Added `@aws-sdk/client-s3` dependency
- **server/.env** - Added AWS credentials and configuration
- All controller files now import from `s3Uploader.js` instead of `imageUploader.js`

### 3. Controllers Updated
- server/controllers/adsCtrl.js
- server/controllers/blogCtrl.js
- server/controllers/categoryCtrl.js
- server/controllers/imageCtrl.js
- server/controllers/propertyCtrl.js
- server/controllers/vendorCtrl.js

## Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION = eu-north-1
AWS_ACCESS_KEY_ID = AKIAU64M3DMQNNYRV477
AWS_SECRET_ACCESS_KEY = n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
AWS_S3_BUCKET_NAME = your-bucket-name
```

**IMPORTANT:** Replace `your-bucket-name` with your actual S3 bucket name.

## Installation Steps

1. Install AWS SDK dependency:
```bash
cd server
npm install @aws-sdk/client-s3
```

2. Update your `.env` file with AWS credentials (see above)

3. Create an S3 bucket in AWS Console:
   - Go to AWS S3 Console
   - Create a new bucket in `eu-north-1` region
   - Configure bucket permissions (public read access if needed)
   - Update `AWS_S3_BUCKET_NAME` in `.env`

4. Restart your server:
```bash
npm run dev
```

## Database Format

The database format remains the same. Files are stored with:
- `secure_url`: Full S3 URL (e.g., `https://bucket-name.s3.eu-north-1.amazonaws.com/folder/file.jpg`)
- `public_id`: S3 key/path (e.g., `folder/file.jpg`)

This maintains compatibility with existing database records.

## S3 Bucket Configuration

### Bucket Policy (for public read access)
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

### CORS Configuration
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

## Features Maintained

1. **Image Processing**: Height and quality parameters still work using Sharp
2. **Multiple File Uploads**: Supported
3. **Folder Organization**: Files are organized in folders like before
4. **Temp File Cleanup**: Automatic cleanup after upload
5. **Error Handling**: Comprehensive error handling maintained

## Testing

Test the upload functionality:
1. Upload an image through any endpoint (ads, blog, category, vendor, etc.)
2. Verify the file appears in your S3 bucket
3. Check that the URL in the database is accessible
4. Test image processing (height/quality parameters)

## Rollback Plan

If you need to rollback to Cloudinary:
1. Change imports in controllers back to `../config/imageUploader`
2. Update `server/index.js` to use `cloudinaryConnect()`
3. Restore Cloudinary credentials in `.env`
4. Restart server

## Notes

- Old Cloudinary configuration is commented out in `.env` for reference
- The function name `uploadImageToCloudinary` is kept for backward compatibility
- All existing code continues to work without changes
- S3 URLs are in format: `https://bucket-name.s3.region.amazonaws.com/path/to/file`
