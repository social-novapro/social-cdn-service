# Social CDN Service
Created by Daniel Kravec, on November 15, 2022

## Description
This project is to test the Minio S3 Storage. This will hopefully be used in the future to store the images and videos for interact.


## Sources
https://min.io/docs/minio/linux/developers/minio-drivers.html#id5

https://thedatabaseme.de/2022/03/20/i-do-it-on-my-own-then-self-hosted-s3-object-storage-with-minio-and-docker/

https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html


## upload 
https://uploadcare.com/blog/html-file-upload-button/

https://blog.logrocket.com/how-to-build-file-upload-service-vanilla-javascript/

# To start up
```
docker run -p 9000:9000 -p 9090:9090 -v ~/minio/data:/data quay.io/minio/minio server /data --console-address ":9090"

docker run -id -p 9000:9000 -p 9090:9090  -e MINIO_ROOT_USER=user -e MINIO_ROOT_PASSWORD=password -v ~/minio/data:/data --name minio-container quay.io/minio/minio server /data --console-address ":9090"
```



## Version History

### 1.0 (1.2022.11.15)
- Initial commit
- basic home directory
- working docker-compose file for creating a minio server
- currently working on the upload function (not done)

### 1.0 (2.2023.10.16)
- Added new docker line to start up minio server with username and password on server PC
- Project is not to be ran independently, will be included into API (currently, could change)

### 1.0 (3.2025.02.10)
- Updated packages
- File upload working, and video uploading working

### 1.0 (4.2025.02.10)
- Set up project to have standard interact backend file structure
- Can upload and get media
- Frontend gets media from backend after successful upload
- Renamed from Test Minio S3 Storage Project to Social CDN Service