const file = document.getElementById('file');
const upload = document.getElementById('upload');
const status = document.getElementById('status');

upload.addEventListener('click', async () => {
    await uploadFile();
    console.log('clicked the upload button!');
});

async function uploadFile() {
    const selectFile = file.files[0];
    if (!selectFile) {
        console.error('No file selected');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectFile);

    try {
        const response = await fetch('http://localhost:3000/fileupload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            console.log('File uploaded successfully.');
        } else {
            console.error('File upload failed.');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
}