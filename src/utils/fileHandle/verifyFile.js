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
        return {
            "error" : true,
            "message" : "No file provided"
        };
    } 

    const typeMatch = allowedExtensions.find((allowedExtension) => {
        return allowedExtension.extension === extension && subType != "any" ? allowedExtension.subType === subType : true;
    });

    if (!typeMatch) {
        return {
            "error" : true,
            "message" : "Invalid file type"
        };
    }

    return {
        "error" : false,
        "type" : typeMatch.subType
    };
}

module.exports = {verifyFile};