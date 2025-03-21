const fileInput = document.getElementById('file');
const uploadButton = document.getElementById('upload');
const status = document.getElementById('status');
const fileContainer = document.getElementById('file-container');

uploadButton.addEventListener('click', async () => {
    await uploadFile();
    console.log('clicked the upload button!');
});

async function uploadFile() {
    const selectFile = fileInput.files[fileInput.files.length-1];
    if (!selectFile) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectFile);

    try {
        const toUploadFile = await fetch('http://localhost:5005/v1/fileType/' + selectFile.name, {
            headers: {
                "accesstoken": "d13fc4c0-7566-4704-9850-1eced58b2028",
                "apptoken": "3610b8af-81c9-4fa2-80dc-2e2d0fd77421",
                "devtoken": "6292d8ae-8c33-4d46-a617-4ac048bd6f11",
                "userid": "12bf2cb7-0f22-49ac-930c-3689fcdbcf3f",
                "usertoken": "77639efe-fcf3-4995-86e2-4cda0073ca75"
            },
        });
        const fileType = await toUploadFile.json();
        console.log(fileType);
        if (fileType.error) {
            console.error('Error verifying file:', fileType.error);
            return;
        }
        
        const response = await 
        fetch("http://localhost:5005/v1/image", {
            "body": formData,
            "method": "POST",
            headers: {
                "accesstoken": "d13fc4c0-7566-4704-9850-1eced58b2028",
                "apptoken": "3610b8af-81c9-4fa2-80dc-2e2d0fd77421",
                "devtoken": "6292d8ae-8c33-4d46-a617-4ac048bd6f11",
                "userid": "12bf2cb7-0f22-49ac-930c-3689fcdbcf3f",
                "usertoken": "77639efe-fcf3-4995-86e2-4cda0073ca75"
            },
        })
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