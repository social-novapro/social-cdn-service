const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { minioClient } = require("../../minio");
const { saveFileData } = require('../../saveMongo');
const { uploadImage } = require('../uploadFile');
const videoInteractBucket = "interact-videos";

async function uploadVideoToMinio(filePath, fileName, res, metadata, headers, originalFilename) {
    // const fileStream = fs.createReadStream(filePath);
    const tempFilePath = path.join("/tmp/uploads", `resized_${fileName}`);
    const imagePath = path.join("/tmp/uploads", `${fileName}_thumbnail.jpg`);
    // const oldX = fileStream.

    // const newX = ÷
    const horizionOrVertical = metadata.width > metadata.height ? "horizontal" : "vertical";

    var BASE_RES = 1080;
    var newX = 0;
    var newY = 0;

    if (horizionOrVertical === "vertical") {
        newX = BASE_RES;
        newY = `trunc(${Math.round((metadata.height / metadata.width) * BASE_RES)}/2)*2`;
    } else {
        newX = `trunc(${Math.round((metadata.width / metadata.height) * BASE_RES)}/2)*2`;
        newY = BASE_RES;
    }

    try {
        const resizeCommand = `ffmpeg -i ${filePath} -vf "scale=${newX}:${newY}" -c:a copy ${tempFilePath}`;
        const thumbnailCommand = ` ffmpeg -i ${tempFilePath} -ss 00:00:05 -vframes 1 -vf "scale=512:-1" -q:v 2 ${imagePath}`;

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

        const generateThumbnail = await new Promise((resolve, reject) => {
            exec(thumbnailCommand, (err) => {
                if (err) {
                    console.log("failed to thumbnail" + err)
                    return reject(err);
                }
            });
        });

        const thumbnailSaved = await uploadImage(imagePath, headers, res, 512, 360, "thumbnail");

        const stats = await new Promise((resolve, reject) => {
            fs.stat(tempFilePath, (err, stats) => {
                console.log("failed to stat" + err)
                if (err) return reject(err);
                resolve(stats);
            });
        });

        const fileStream = fs.createReadStream(tempFilePath);

        // Upload resized video to Minio
        await new Promise((resolve, reject) => {
            minioClient.putObject(videoInteractBucket, fileName, fileStream, stats.size, (err, etag) => {
                fs.unlink(tempFilePath, () => {}); // Delete resized video file
                fs.unlink(filePath, () => {}); // Delete original video file
                console.log("failed to minio" + err)
                if (err) return reject(err);
                console.log("File uploaded to MinIO:", etag);
                resolve(etag);
            });
        });

        await saveFileData({
            fileID: fileName.split(".")[0],
            userID: headers.userID,
            fileName: fileName,
            originalFilename,
            fileExtension: fileName.split(".").pop(),
            fileType: "video",
            interactCdnURL: `/static/${fileName}`,
            interactCdnBucket: videoInteractBucket,
            thumbnailURL: thumbnailSaved ? thumbnailSaved.cdnURL : null
        });

        res.send({ success: true, fileID: fileName, cdnURL: `/static/${fileName}` });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
}

module.exports = { uploadVideoToMinio };