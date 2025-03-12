const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { minioClient } = require("../../minio");

async function uploadVideoToMinio(filePath, fileName, res, metadata) {
    const fileStream = fs.createReadStream(filePath);
    const tempFilePath = path.join("/tmp/uploads", `resized_${fileName}`);
    // const oldX = fileStream.
    console.log(metadata)

    // const newX = ÷
    const horizionOrVertical = metadata.width > metadata.height ? "horizontal" : "vertical";

    var BASE_RES = 1080;
    var newX = 0;
    var newY = 0;

    if (horizionOrVertical === "vertical") {
        newX = BASE_RES;
        newY = Math.round((metadata.height / metadata.width) * BASE_RES);
    } else {
        newX = Math.round((metadata.width / metadata.height) * BASE_RES);
        newY = BASE_RES;
    }

    try {
        const resizeCommand = `ffmpeg -i ${filePath} -vf scale=${newX}:${newY} -c:a copy ${tempFilePath}`;

        // Run the FFmpeg command to resize the video
        const FFmpegRun = await new Promise((resolve, reject) => {
            exec(resizeCommand, (err, stdout, stderr) => {
                if (err) {
                    console.log("failed to exec" + err)
                    return reject(new Error(`Error resizing video: ${stderr || err.message}`));
                }
                console.log(stdout);
                resolve(stdout);
            });
        });

        console.log(FFmpegRun);
        
        const stats = await new Promise((resolve, reject) => {
            fs.stat(tempFilePath, (err, stats) => {
                console.log("failed to stat" + err)
                if (err) return reject(err);
                resolve(stats);
            });
        });

        const fileStream = fs.createReadStream(tempFilePath);

        // await new Promise((resolve, reject) => {
        //     minioClient.putObject('interact-videos', fileName, fileStream, stats.size, (err, etag) => {
        //         fs.unlink(filePath, () => {}); // Delete temp file
        //         if (err) return reject(err);
        //         resolve(etag);
        //     });
        // });

        // Upload resized video to Minio
        await new Promise((resolve, reject) => {
            minioClient.putObject('interact-videos', fileName, fileStream, stats.size, (err, etag) => {
                fs.unlink(tempFilePath, () => {}); // Delete resized video file
                fs.unlink(filePath, () => {}); // Delete original video file
                console.log("failed to minio" + err)
                if (err) return reject(err);
                console.log("File uploaded to MinIO:", etag);
                resolve(etag);
            });
        });

        res.send({ success: true, fileID: fileName });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

module.exports = { uploadVideoToMinio };