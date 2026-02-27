# 🔄 Migration Flow Diagram

## Before (Cloudinary)

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    server/index.js                           │
│                  cloudinaryConnect()                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              server/config/cloudinary.js                     │
│         Cloudinary.config({ cloud_name, ... })              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Controllers (adsCtrl, blogCtrl, categoryCtrl, etc.)        │
│  uploadImageToCloudinary() from imageUploader.js            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           server/config/imageUploader.js                     │
│       cloudinary.uploader.upload(file, options)             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ☁️ CLOUDINARY
                            │
                            ▼
        URL: https://res.cloudinary.com/.../file.jpg
```

---

## After (AWS S3)

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    server/index.js                           │
│                     s3Connect()                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               server/config/s3Config.js                      │
│         S3Client({ region, credentials })                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Controllers (adsCtrl, blogCtrl, categoryCtrl, etc.)        │
│  uploadImageToCloudinary() from s3Uploader.js               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            server/config/s3Uploader.js                       │
│  - Process image with Sharp (resize/compress)                │
│  - Generate unique filename                                  │
│  - Upload to S3 using PutObjectCommand                       │
│  - Return Cloudinary-compatible format                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                      ☁️ AWS S3
                            │
                            ▼
        URL: https://bucket.s3.eu-north-1.amazonaws.com/file.jpg
```

---

## File Upload Flow (Detailed)

```
1. Client Request
   │
   ├─→ POST /api/v1/image/upload
   │   Body: { file: image.jpg }
   │
   ▼

2. Express Middleware
   │
   ├─→ express-fileupload
   │   Saves to temp: /tmp/image.jpg
   │
   ▼

3. Controller
   │
   ├─→ imageCtrl.js
   │   Calls: uploadImageToCloudinary(file, folder)
   │
   ▼

4. S3 Uploader
   │
   ├─→ s3Uploader.js
   │   ├─ Read temp file
   │   ├─ Process with Sharp (if needed)
   │   ├─ Generate unique name: 1234567890-abc123.jpg
   │   ├─ Create S3 key: folder/1234567890-abc123.jpg
   │   ├─ Upload to S3
   │   └─ Delete temp file
   │
   ▼

5. S3 Storage
   │
   ├─→ AWS S3 Bucket
   │   Location: eu-north-1
   │   Path: folder/1234567890-abc123.jpg
   │
   ▼

6. Response
   │
   └─→ {
       secure_url: "https://bucket.s3.eu-north-1.amazonaws.com/folder/file.jpg",
       public_id: "folder/file.jpg"
   }
```

---

## Data Flow Comparison

### Cloudinary Flow
```
File → Temp → Cloudinary API → Cloudinary CDN → URL
                                      ↓
                              Database saves URL
```

### AWS S3 Flow
```
File → Temp → Sharp Processing → S3 API → S3 Bucket → URL
                                              ↓
                                      Database saves URL
```

---

## Configuration Comparison

### Cloudinary (.env)
```env
CLOUD_NAME = dsvotvxhq
API_KEY = 886837389255772
API_SECRET = aW_hpmUewFUAoQmLvfhaI7Aw12M
FOLDER_NAME = "INEXT - Service Provider"
```

### AWS S3 (.env)
```env
AWS_REGION = eu-north-1
AWS_ACCESS_KEY_ID = AKIAU64M3DMQNNYRV477
AWS_SECRET_ACCESS_KEY = n+uD9BGszRWOjUBQypZba0D5vLI2LHKr3x5qWs1jenve
AWS_S3_BUCKET_NAME = your-bucket-name
FOLDER_NAME = "INEXT - Service Provider"
```

---

## URL Format Comparison

### Cloudinary URL
```
https://res.cloudinary.com/dsvotvxhq/image/upload/v1234567890/folder/file.jpg
│                          │                                   │
│                          └─ Cloud Name                       └─ Path
└─ Cloudinary CDN
```

### AWS S3 URL
```
https://bucket-name.s3.eu-north-1.amazonaws.com/folder/file.jpg
│              │           │                  │
│              │           └─ Region          └─ Path
│              └─ Bucket Name
└─ AWS S3 Domain
```

---

## Image Processing Flow

### With Height & Quality Parameters

```
Original File (2MB, 4000x3000)
        │
        ▼
┌─────────────────────┐
│   Sharp Processing  │
│  - Resize to height │
│  - Compress quality │
└─────────────────────┘
        │
        ▼
Processed File (500KB, 2000x1500)
        │
        ▼
    Upload to S3
        │
        ▼
    Optimized URL
```

---

## Error Handling Flow

```
Upload Request
    │
    ├─→ Try Upload
    │   │
    │   ├─→ Success ✅
    │   │   └─→ Return URL
    │   │
    │   └─→ Error ❌
    │       │
    │       ├─→ Log Error
    │       ├─→ Clean Temp Files
    │       └─→ Return Error Response
    │
    └─→ Client receives response
```

---

## Multi-File Upload Flow

```
Request with 3 files
        │
        ├─→ File 1 → Process → Upload → URL 1
        │
        ├─→ File 2 → Process → Upload → URL 2
        │
        └─→ File 3 → Process → Upload → URL 3
                │
                ▼
        Return Array of URLs
```

---

## Database Schema (Unchanged)

```javascript
// Category Model Example
{
  _id: ObjectId("..."),
  name: "Plumbing",
  price: 500,
  image: "https://bucket.s3.eu-north-1.amazonaws.com/categories/file.jpg",
  // ↑ This field works the same with both Cloudinary and S3
  createdAt: Date,
  updatedAt: Date
}

// Vendor Model Example
{
  _id: ObjectId("..."),
  name: "John Doe",
  profilePhoto: "https://bucket.s3.eu-north-1.amazonaws.com/profilePhoto/file.jpg",
  aadharCard: "https://bucket.s3.eu-north-1.amazonaws.com/vendorDocuments/file.pdf",
  // ↑ Both images and PDFs work the same way
  createdAt: Date,
  updatedAt: Date
}
```

---

## Migration Impact

```
┌─────────────────────┬──────────────┬──────────────┐
│     Component       │   Changed?   │    Impact    │
├─────────────────────┼──────────────┼──────────────┤
│ Database Schema     │      ❌      │     None     │
│ API Endpoints       │      ❌      │     None     │
│ Frontend Code       │      ❌      │     None     │
│ Upload Function     │      ✅      │   Internal   │
│ Configuration       │      ✅      │   Internal   │
│ Dependencies        │      ✅      │   Internal   │
└─────────────────────┴──────────────┴──────────────┘

✅ = Changed (internal only)
❌ = No change (external interface)
```

---

## Rollback Strategy

```
Current State (S3)
        │
        ├─→ Issue Found?
        │   │
        │   └─→ YES
        │       │
        │       ├─→ 1. Change imports to imageUploader.js
        │       ├─→ 2. Update index.js to cloudinaryConnect()
        │       ├─→ 3. Uncomment Cloudinary in .env
        │       ├─→ 4. Restart server
        │       │
        │       ▼
        │   Back to Cloudinary ✅
        │
        └─→ NO
            │
            └─→ Continue with S3 ✅
```

---

## Success Verification

```
1. Server Start
   └─→ ✅ "AWS S3 connected successfully"

2. Upload Test
   └─→ ✅ File uploaded without errors

3. S3 Bucket Check
   └─→ ✅ File exists in bucket

4. URL Access
   └─→ ✅ URL opens in browser

5. Database Check
   └─→ ✅ URL saved correctly

6. Application Test
   └─→ ✅ Image displays in app

ALL CHECKS PASSED = Migration Successful! 🎉
```

---

## Key Takeaways

1. **Same Interface** - Function names and parameters unchanged
2. **Same Database** - No schema changes needed
3. **Same URLs** - Just different domain
4. **Better Control** - Direct S3 access
5. **Cost Effective** - S3 pricing is transparent
6. **Easy Rollback** - Can revert anytime

---

**Visual Guide Complete!**
For setup instructions, see: `QUICK_START_S3.md`
