const allowedExtensions = [{
    "extension" : "jpg",
    "subType" : "image"
}, {
    "extension" : "jpeg",
    "subType" : "image"
}, {
    "extension" : "png",
    "subType" : "image"
}, {
    "extension" : "gif",
    "subType" : "image"
}, {
    "extension" : "mp4",
    "subType" : "video"
}, {
    "extension" : "mov",
    "subType" : "video"
}, {
    "extension" : "avi",
    "subType" : "video"
}];

function verifyFile(file, extension, subType="any") {
    if (!file) {
        return false;
    } 

    const typeMatch = allowedExtensions.find((allowedExtension) => {
        return allowedExtension.extension === extension && subType != "any" ? allowedExtension.subType === subType : true;
    });

    if (!typeMatch) {
        return false;
    }

    return true;
}

module.exports = {verifyFile};