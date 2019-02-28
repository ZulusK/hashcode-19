const fileName = process.argv[process.argv.length - 1];
const readline = require('linebyline');

function readDataFile(filename) {
    const rl = readline(`./${fileName}`);
    return new Promise((resolve, reject) => {
        let photos = [];
        let numLines = 0;
        let id = 0;
        rl.on('line', (line, lineCount) => {
            if (lineCount !== 1) {
                let photoObj = {
                    id: 0,
                    o: '',
                    tags: [],
                };
                let arr = line.split(' ');

                for (let i = 0; i < arr.length; i++) {
                    if (i === 0) {
                        photoObj.id = id;
                        id++;
                        photoObj.o = arr[i];
                    } else if (i > 1) photoObj.tags.push(arr[i]);
                }
                photos.push(photoObj);
            } else {
                numLines = parseInt(line);
            }
            if (lineCount > numLines) {
                return resolve(photos);
            }
        })
            .on('error', (e) => {
                console.log(e.message);
                reject(e);
            });
    });
}

readDataFile(fileName).then(console.log);
