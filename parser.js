const fs = require('fs');

const fileName = process.argv[process.argv.length - 1];
let photos = [];
let numLines = 0;
let id = 0;
var readline = require('linebyline'),
      rl = readline(`./${fileName}`);
rl.on('line', function(line, lineCount, byteCount) {
    if(lineCount !== 1){
        let photoObj = {
            id: 0,
            o: '',
            tags: [], 
        };
        let arr = line.split(' ');

        for(let i = 0; i < arr.length; i++){
            if(i === 0) {
                photoObj.id = id;
                id++;
                photoObj.o = arr[i];
            }
            else if(i > 1) photoObj.tags.push(arr[i]);
            else continue;
        }
        photos.push(photoObj);
    }else{
        numLines = parseInt(line);
    }

    if(lineCount > numLines){
        console.log(photos);
    }
})
.on('error', function(e) {
    console.log(e.message);
});