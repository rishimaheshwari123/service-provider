const express = require("express")
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { s3Connect } = require("./config/s3Config")
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const compression = require("compression");
const swaggerUi = require('swagger-ui-express');
const allowOnlyAppOrWebsite = require('./middleware/accessControl');

dotenv.config();

const PORT = process.env.PORT || 8000
connectDB();

// Compression middleware for better performance
app.use(compression());

// CORS first
app.use(cors({
  origin: "*",
  credentials: true,
}))

// File upload middleware BEFORE json parsers
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB per file
      files: 10 // Allow up to 10 files
    },
    abortOnLimit: false,
    createParentPath: true
  })
)

// Then JSON parsers
app.use(express.json())
app.use(cookieParser());

s3Connect();


app.use('/api', allowOnlyAppOrWebsite);

if (process.env.NODE_DEV === 'development') {
  const swaggerOutput = require('./swagger-output.json');

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerOutput,{
      explorer: true,
      swaggerOptions: {
        persistAuthorization: true,   
        displayRequestDuration: true, 
        filter: true,               
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Mera Ghar Sansar API Docs',
    })
  );

  console.log(`Swagger UI  → http://localhost:${process.env.PORT || 8080}/api-docs`)
}
// routes  
app.use("/api/v1/auth", require("./routes/authRoute"))
app.use("/api/v1/vendor", require("./routes/vendorRoute"))
app.use("/api/v1/vendor-profile-update-request", require("./routes/vendorProfileUpdateRequestRoute"))
app.use("/api/v1/image", require("./routes/imageRoute"))
app.use("/api/v1/blog", require("./routes/blogRoute"))
app.use("/api/v1/property", require("./routes/propertyRoute"))
app.use("/api/v1/contact", require("./routes/contactRoute"))
app.use("/api/v1/dashboard", require("./routes/dashboardRoute"))
app.use("/api/v1/customer-support", require("./routes/customerSupportRoute"))
app.use("/api/v1/job", require("./routes/jobRoute"))
app.use("/api/v1/career", require("./routes/careerRoute"))
app.use("/api/v1/rating", require("./routes/ratingReview"))
app.use("/api/v1/ads", require("./routes/adsRoute"));
app.use("/api/v1/booking", require("./routes/bookingRoute"));
app.use("/api/v1/category", require("./routes/categoryRoute"));
app.use("/api/v1/price-key-features", require("./routes/priceKeyFeaturesRoute"));
app.use("/api/v1/razorpay", require("./routes/razorpayRoute"))
app.use("/api/v1/audit", require("./routes/auditLogs"))
app.use("/api/v1/communication-logs", require("./routes/communicationLogsRoute"))
app.use("/api/v1/search-logs", require("./routes/searchLogsRoute"))
app.use("/api/v1/coupon", require("./routes/couponRoute"))
app.use("/api/v1/service-update-request", require("./routes/serviceUpdateRequestRoute"))
app.use("/api/v1/reward", require("./routes/rewardRoute"))





app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ..."
  })
})

app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`)
})
