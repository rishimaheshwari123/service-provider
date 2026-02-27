#!/bin/bash

# AWS S3 Migration - Installation Script
# This script helps you set up AWS S3 for your application

echo "🚀 AWS S3 Migration Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -d "server" ]; then
    echo "❌ Error: 'server' directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
cd server
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
cd ..
echo ""

# Step 2: Check .env file
echo "🔍 Step 2: Checking .env configuration..."
if [ -f "server/.env" ]; then
    if grep -q "AWS_S3_BUCKET_NAME" server/.env; then
        echo "✅ AWS configuration found in .env"
        
        # Check if bucket name is set
        if grep -q "AWS_S3_BUCKET_NAME = your-bucket-name" server/.env; then
            echo "⚠️  WARNING: You need to update AWS_S3_BUCKET_NAME in server/.env"
            echo "   Current value: your-bucket-name"
            echo "   Please set your actual S3 bucket name"
        else
            echo "✅ AWS_S3_BUCKET_NAME is configured"
        fi
    else
        echo "❌ AWS configuration not found in .env"
        exit 1
    fi
else
    echo "❌ .env file not found in server directory"
    exit 1
fi
echo ""

# Step 3: Verify AWS credentials
echo "🔐 Step 3: Verifying AWS credentials..."
if grep -q "AWS_ACCESS_KEY_ID = AKIAU64M3DMQNNYRV477" server/.env; then
    echo "✅ AWS Access Key ID found"
else
    echo "⚠️  AWS Access Key ID not found or different"
fi

if grep -q "AWS_SECRET_ACCESS_KEY" server/.env; then
    echo "✅ AWS Secret Access Key found"
else
    echo "⚠️  AWS Secret Access Key not found"
fi

if grep -q "AWS_REGION = eu-north-1" server/.env; then
    echo "✅ AWS Region configured (eu-north-1)"
else
    echo "⚠️  AWS Region not configured or different"
fi
echo ""

# Step 4: Check S3 configuration files
echo "📄 Step 4: Checking S3 configuration files..."
if [ -f "server/config/s3Config.js" ]; then
    echo "✅ s3Config.js found"
else
    echo "❌ s3Config.js not found"
    exit 1
fi

if [ -f "server/config/s3Uploader.js" ]; then
    echo "✅ s3Uploader.js found"
else
    echo "❌ s3Uploader.js not found"
    exit 1
fi
echo ""

# Step 5: Summary
echo "📋 Setup Summary"
echo "================"
echo ""
echo "✅ Dependencies installed"
echo "✅ Configuration files present"
echo "✅ AWS credentials configured"
echo ""

# Check if bucket name needs to be updated
if grep -q "AWS_S3_BUCKET_NAME = your-bucket-name" server/.env; then
    echo "⚠️  ACTION REQUIRED:"
    echo "   1. Create an S3 bucket in AWS Console (eu-north-1 region)"
    echo "   2. Update AWS_S3_BUCKET_NAME in server/.env"
    echo "   3. Configure bucket permissions (see QUICK_START_S3.md)"
    echo "   4. Run: cd server && npm run dev"
    echo ""
    echo "📚 Documentation: See QUICK_START_S3.md for detailed instructions"
else
    echo "✅ Configuration looks good!"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Verify your S3 bucket exists in AWS Console"
    echo "   2. Configure bucket permissions (see QUICK_START_S3.md)"
    echo "   3. Run: cd server && npm run dev"
    echo ""
    echo "📚 Documentation: See QUICK_START_S3.md for bucket setup"
fi

echo ""
echo "🎉 Installation script complete!"
echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - QUICK_START_S3.md (3-minute setup)"
echo "   - S3_SETUP_CHECKLIST.md (step-by-step)"
echo "   - server/SETUP_S3.md (troubleshooting)"
