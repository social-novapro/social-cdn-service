const fileInput = document.getElementById('file');
const uploadButton = document.getElementById('upload');
const status = document.getElementById('status');
const fileContainer = document.getElementById('file-container');

uploadButton.addEventListener('click', async () => {
    await uploadFile();
    console.log('clicked the upload button!');
});

async function uploadFile() {
    const selectFile = fileInput.files[0];
    if (!selectFile) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectFile);

    try {
        const response = await fetch('http://localhost:5005/v1/video/', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('File uploaded successfully.');
            const finalRes = await response.json();
            console.log('finalRes:', finalRes);
            // await getFile(finalRes.fileID);
        } else {
            console.error('File upload failed.');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}

async function getFile(fileID) {
    try {
        const response = await fetch(`http://localhost:3000/v1/get/${fileID}`);
        if (response.ok) {
            const fileBlob = await response.blob();
            console.log('file:', fileBlob);
            const fileURL = URL.createObjectURL(fileBlob);
            displayFile(fileURL, fileBlob.type);
        } else {
            console.error('Error getting file:', response.statusText);
        }
    } catch (error) {
        console.error('Error getting file:', error);
    }
}

function displayFile(fileURL, mimeType) {
    fileContainer.innerHTML = ''; // Clear any previous content
    console.log(mimeType);
    if (mimeType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = fileURL;
        img.alt = 'Uploaded Image';
        fileContainer.appendChild(img);
    } else if (mimeType === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.src = fileURL;
        iframe.width = '100%';
        iframe.height = '600px';
        fileContainer.appendChild(iframe);
    } else if (mimeType.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = fileURL;
        video.width = '100%';
        video.controls = true;
        fileContainer.appendChild(video);
    }else{
        const a = document.createElement('a');
        a.href = fileURL;
        a.textContent = 'Download File';
        a.download = 'file';
        fileContainer.appendChild(a);
    }
}