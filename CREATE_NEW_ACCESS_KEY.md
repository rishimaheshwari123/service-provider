# Create New AWS Access Key - Step by Step

## Current Situation
- ✅ Bucket exists: `niyati-images-bucket`
- ✅ IAM user exists: `NSolution`
- ✅ Permissions attached: `AmazonS3FullAccess`
- ❌ Secret key is incorrect

## Solution: Create New Access Key

### Step 1: Delete Old Access Key (Optional but Recommended)
1. You're already on the IAM user page for `NSolution`
2. Scroll to "Access keys" section
3. Find the key `AKIAU64M3DMQNNYRV477`
4. Click "Actions" → "Delete"
5. Confirm deletion

### Step 2: Create New Access Key
1. Click **"Create access key"** button
2. Select **"Application running outside AWS"**
3. Click **"Next"**
4. Description: `Service Provider App`
5. Click **"Create access key"**

### Step 3: COPY THE CREDENTIALS NOW!
You'll see a screen like this:

```
Access key ID: AKIA...
Secret access key: wJalrXUtnFEMI/K7MDENG/bPxRfiCY...
```

⚠️ **CRITICAL:** Copy BOTH values immediately! You cannot see the secret key again!

### Step 4: Update server/.env

Replace these lines in `server/.env`:

```env
# AWS S3 Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=YOUR_NEW_ACCESS_KEY_ID_HERE
AWS_SECRET_ACCESS_KEY=YOUR_NEW_SECRET_KEY_HERE
AWS_S3_BUCKET_NAME=niyati-images-bucket
```

**IMPORTANT:** 
- No spaces around the `=` sign
- No quotes around the values
- Copy the ENTIRE secret key (usually 40 characters)

### Step 5: Test Credentials

```bash
cd server
node test-aws-credentials.js
```

You should see:
```
✅ Credentials are VALID!
✅ Upload successful!
🎉 All tests passed!
```

### Step 6: Restart Server

```bash
npm run dev
```

### Step 7: Test Upload
Try uploading an image through your application.

---

## Example .env Format

```env
JWT_SECRET=j5111d0f0sdfdfd00f0df
MONGODB_URL=mongodb+srv://infoinextets:VWi8V6YTnxIgESpW@cluster0.3doac7y.mongodb.net/Service-Provider
PORT=8000

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_USER=rishimaheshwari010@gmail.com
MAIL_PASS=ubqx vact gviv pcbb
ADMIN_EMAIL=solutions.niyati@gmail.com

FOLDER_NAME="INEXT - Service Provider"

# AWS S3 Configuration
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=niyati-images-bucket

RAZORPAY_KEY="rzp_test_lQz64anllWjB83"
RAZORPAY_SECRET="XTDiLQko4qoEbmooz7vExyjm"
```

---

## Troubleshooting

### If you still get SignatureDoesNotMatch:
1. Make sure you copied the ENTIRE secret key
2. Check for no extra spaces or line breaks
3. Verify no quotes around the values
4. Try creating another new access key

### If test-aws-credentials.js fails:
1. Check .env file format
2. Restart your terminal/command prompt
3. Make sure you're in the server directory
4. Run `npm install` again

---

## Quick Checklist

- [ ] Created new access key in AWS Console
- [ ] Copied Access Key ID
- [ ] Copied Secret Access Key (40 characters)
- [ ] Updated server/.env file
- [ ] No spaces around = signs
- [ ] No quotes around values
- [ ] Ran test-aws-credentials.js
- [ ] Test passed
- [ ] Restarted server
- [ ] Upload works

---

**Need Help?** The secret key should be exactly 40 characters and look like:
`wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
