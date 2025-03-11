
const router = require('express').Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const aws4 = require('aws4');
require('dotenv').config();

// Middleware to add MinIO authentication
const proxyWithAuth = (bucket) => createProxyMiddleware({
    target: "http://localhost:9000",
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

router.use("/video/:fileID", (req, res, next) => {
    console.log("Proxy middleware running for video...");
    // const authHeader = "Basic " + Buffer.from(`${process.env.ACCESS_KEY}:${process.env.SECRET_KEY}`).toString("base64");
    // req.headers["Authorization"] = authHeader;
    // console.log(req.headers);

    // Generate AWS Signature v4 headers
      const opts = {
        method: "GET",
        host: 'localhost:9000',
        path: `/interact-videos/${req.params.fileID}`,
        service: 's3',
        region: 'us-east-1',
        headers: {
          Host: 'localhost:9000',
        },
      };

      aws4.sign(opts, {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_KEY,
      });

      // Apply signed headers to the request
      Object.keys(opts.headers).forEach((key) => {
        // proxyReq.setHeader(key, opts.headers[key]);
        req.headers[key] = opts.headers[key];
      });

      console.log("Request Headers:", req.headers);

    // const opts = {
    //     host: 'localhost:9000',
    //     service: 's3',
    //     region: 'us-east-1',
    //     headers: {
    //         'Host': 'localhost:9000'
    //     }
    // };

    // aws4.sign(opts, {
    //     accessKeyId: process.env.ACCESS_KEY,
    //     secretAccessKey: process.env.SECRET_KEY
    // });

    // req.headers = opts.headers;
    // console.log(req.headers)
    next();
}, proxyWithAuth("interact-videos"));

router.use("/image/:fileID", (req, res, next) => {
    console.log("Proxy middleware running for image...");
    next();
}, proxyWithAuth("interact-images"));

module.exports = router;

/*
const router = require('express').Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// Middleware to add MinIO authentication
const proxyWithAuth = (bucket) => createProxyMiddleware({
    target: "http://localhost:9000",
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
});

// router.use("/video/:fileID", proxyWithAuth("interact-videos"));
router.use("/video/:fileID", (req, res, next) => {
    console.log("Proxy middleware running...");
    try {
        createProxyMiddleware({
            target: "http://localhost:9000/interact-videos"+req.params.fileID,
            changeOrigin: true,
            selfHandleResponse: false, // Let the backend handle the response
            onProxyReq: (proxyReq, req, res) => {
                console.log("onProxyReq is running...");
                // Forward request headers
                Object.keys(req.headers).forEach((key) => {
                    proxyReq.setHeader(key, req.headers[key]);
                });
                proxyReq.setHeader("Authorization", "Basic " + Buffer.from(`${process.env.ACCESS_KEY}:${process.env.SECRET_KEY}`).toString("base64"));
                console.log("Proxy Request Headers:", proxyReq.getHeaders());
                
            },
            // onProxyReq: (proxyReq, req, res) => {
            //     console.log("onProxyReq is running...");
            //     // Set Authorization header for MinIO
            //     if (!process.env.ACCESS_KEY || !process.env.SECRET_KEY) {
            //         console.error("ERROR: MinIO credentials not set in environment variables!");
            //     }
                
            //     const authHeader = "Basic " + Buffer.from(`${process.env.ACCESS_KEY}:${process.env.SECRET_KEY}`).toString("base64");
            //     proxyReq.setHeader("Authorization", authHeader);
            //     console.log("Proxy Request Headers:", proxyReq.getHeaders());
        
            // },
        })(req, res, next);
    } catch (error) {
        console.error("Proxy error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.use("/image/:fileID", proxyWithAuth("interact-images"));

module.exports = router;
// localhost:5005/v1/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
//
curl -I -H "Range: bytes=0-1023" localhost:5005/v1/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
curl -I -H "Range: bytes=0-1023" localhost:5005/v1/cdn/video/1f87874b-186a-40e6-baf0-b69952062eae.mov
curl -I localhost:5005/v1/cdn/video/1f87874b-186a-40e6-baf0-b69952062eae.mov

// */
