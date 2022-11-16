// openitnow();
// async function openitnow() {
//     await fetch('http://localhost:9000/', {
//         method: 'POST',
//     });
// }

const file = document.getElementById('file');
const upload = document.getElementById('upload');
const status = document.getElementById('status');
upload.addEventListener('click',async () => {
    await readTheFile();
    console.log('clicked the upload button!');
});

async function readTheFile() {
    
    const fileReader = new FileReader(); // initialize the object  
    fileReader.readAsArrayBuffer(file); // read file as array buffer

    const selectFile = file.files[0];
    console.log(selectFile)
    const fileBuffer = await fileReader.readAsArrayBuffer(selectFile);
    await fetch('http://localhost:9000/', {
        method: 'POST',
        body: {
            "file": fileBuffer
        }
    });

}