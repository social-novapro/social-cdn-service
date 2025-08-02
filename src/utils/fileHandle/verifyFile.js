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

function verifyFile(fileName, subType="any") {
    if (!fileName) {
        return {
            "error" : true,
            "message" : "No file name provided"
        };
    } 
    const extension = fileName.split('.').pop();

    const typeMatch = allowedExtensions.find((allowedExtension) => {
        return allowedExtension.extension === extension.toLowerCase();
    });
    
    if (!typeMatch) {
        return {
            "error" : true,
            "message" : "Invalid file type"
        };
    }

    if (subType != "any" && typeMatch.subType != subType) {
        return {
            "error" : true,
            "message" : "Not matching type"
        };
    }

    return {
        "error" : false,
        "type" : typeMatch.subType
    };
}

module.exports = {verifyFile};