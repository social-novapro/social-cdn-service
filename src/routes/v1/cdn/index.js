
const router = require('express').Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const aws4 = require('aws4');
const { verifyFile } = require('../../../utils/fileHandle/verifyFile');
const { getFileInfo } = require('../../../utils/fileInfo');
require('dotenv').config();

// Middleware to add MinIO authentication
const proxyWithAuth = (bucket) => createProxyMiddleware({
    target: `http://${process.env.MINIOAPI_URL}:9000`,
    changeOrigin: true,
    pathRewrite: (path, req) => `/${bucket}/${req.params.fileID}`,
    onProxyReq: (proxyReq, req, res) => {
        console.log("onProxyReq is running...");

        // Set Authorization header for MinIO
        if (!process.env.ACCESS_KEY || !process.env.SECRET_KEY) {
            console.error("ERROR: MinIO credentials not set in environment variables!");
        }
        
        const authHeader = "Basic " + Buffer.from(`${process.env.ACCESS_KEY}:${process.env.SECRET_KEY}`).toString("base64");
        proxyReq.setHeader("Authorization", authHeader);
        console.log("Proxy Request Headers:", proxyReq.getHeaders());
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log("onProxyRes is running...");
        console.log("Proxy Response Headers:", proxyRes.headers);
    },
    onError: (err, req, res) => {
        console.error("Proxy error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

function signAccess(headers, filePath) {
    // Generate AWS Signature v4 headers
    const opts = {
        method: "GET",
        host: `${process.env.MINIOAPI_URL}:9000`,
        path: filePath,
        service: 's3',
        region: 'us-east-1',
        headers: {
            Host: `${process.env.MINIOAPI_URL}:9000`,
        },
    };

    aws4.sign(opts, {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
    });

    // Apply signed headers to the request
    Object.keys(opts.headers).forEach((key) => {
    // proxyReq.setHeader(key, opts.headers[key]);
        headers[key] = opts.headers[key];
    });

    return headers;
}

router.use("/video/:fileID", async (req, res, next) => {
    console.log("Proxy middleware running for video...");
    req.headers = signAccess(req.headers, `/interact-videos/${req.params.fileID}`);
    console.log("Request Headers:", req.headers);
    next();
}, proxyWithAuth("interact-videos"));

router.use("/image/:fileID", async (req, res, next) => {
    console.log("Proxy middleware running for image...");
    req.headers = signAccess(req.headers, `/interact-images/${req.params.fileID}`);

    next();
}, proxyWithAuth("interact-images"));

router.use("/:fileID", async (req, res, next) => {
    console.log("Proxy middleware running for file...");
    const fileType = verifyFile(req.params.fileID);
    console.log(fileType);
    if (fileType.error) {
        return res.status(500).send(fileType);
    }
    const foundFile = await getFileInfo(req.headers, req.params.fileID, true);
    if (foundFile.error) {
        return res.status(foundFile.status).json({ error: true, message: foundFile.message });
    }
    req.headers = signAccess(req.headers, `/${foundFile.cdnBucket}/${foundFile.name}`);
    req.bucket = foundFile.cdnBucket;
    next();
}, (req, res, next) => proxyWithAuth(req.bucket)(req, res, next));

module.exports = router;
/*
curl -I -H "Range: bytes=0-1023" localhost:5005/v1/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
curl -I -H "Range: bytes=0-1023" localhost:5005/v1/cdn/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
curl -I localhost:5005/v1/cdn/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
*/
