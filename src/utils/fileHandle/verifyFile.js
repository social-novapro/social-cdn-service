const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
function verifyFile(file, extension) {
    if (!file) {
        return false;
    } 

    if (!allowedExtensions.includes(extension.toLowerCase())) {
        return false;
    }

    return true;
}

module.exports = {verifyFile};