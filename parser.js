const fileName = process.argv[process.argv.length - 1];
const readline = require('linebyline');
const _ = require('lodash');
const comparePhotos = require('./comparePhoto');

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


function splitter(photos) {
    const hphotos = [];
    const vphotos = [];
    for (const photo of photos) {
        if (photo.o === 'H') {
            hphotos.push(photo);
        } else {
            vphotos.push(photo);
        }
    }
    return {
        h: hphotos,
        v: vphotos
    };
}

function buildTableOfScoring(photos) {
    const table = {};
    for (let i = 0; i < photos.length; i++) {
        for (let j = i + 1; j < photos.length; j++) {
            table[`${i}:${j}`] = comparePhotos(photos[i], photos[j]);
        }
    }
    return table;
}

function getAverage(table) {
    const size = Object.keys(table).length;
    return _.reduce(table, (memo, v, k) => {
        return memo + v / size;
    }, 0);
}

readDataFile(fileName)
    .then((photos) => {
        const { v, h } = splitter(photos);
        const table = buildTableOfScoring(v);
        const average = getAverage(table);
        console.log(table)
        console.log(average);
    });
