const fileName = process.argv[process.argv.length - 1];
const readline = require('linebyline');
const _ = require('lodash');
const comparePhotos = require('./comparePhoto');
const faker = require('faker');

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
        table[i] = {};
        for (let j = 0; j < photos.length; j++) {
            table[i][j] = comparePhotos(photos[i], photos[j]);
        }
    }
    return table;
}

function getAverage(table) {
    const size = Object.keys(table).length ** 2;
    return _.reduce(table, (memo, row) => {
        return memo + _.reduce(row, (m2, cell) => {
            return m2 + cell / size;
        }, 0);
    }, 0);
}

function getIdByClosest2Average(average, row, id) {
    let closestId = 0;
    let prevDiff = Number.POSITIVE_INFINITY;
    _.forEach(row, (v, k) => {
        if (+k !== id && v > 0 && v - average < prevDiff) {
            prevDiff = v - average;
            closestId = k;
        }
    });
    if (!Number.isFinite(prevDiff)) {
        for (const key in row) {
            if (key !== id) {
                return key;
            }
        }
    }
    return closestId;
}

function runRandomIteration(table, startFrom, average) {
    const tmpTable = JSON.parse(JSON.stringify(table));
    let sum = 0;
    let currId = startFrom;
    for (let i = 0; i < Object.keys(tmpTable).length; i++) {
        const targetId = getIdByClosest2Average(average, tmpTable[currId], currId);
        sum += tmpTable[currId][targetId];
        delete tmpTable[currId];
        delete tmpTable[targetId];
        for (const key in tmpTable) {
            delete tmpTable[key][targetId];
            delete tmpTable[key][currId];
        }
        currId = getNextId(tmpTable);
    }
    return sum;
}

function getNextId(table) {
    return faker.random.arrayElement(Object.keys(table));
}

readDataFile(fileName)
    .then((photos) => {
        const { v, h } = splitter(photos);
        const table = buildTableOfScoring(v);
        const average = getAverage(table);
        console.log('average', average);
        let max = 0;
        const size = Object.keys(table).length;
        for (let i = 0; i < 100; i++) {
            console.log('iter', i);
            const startFrom = getNextId(table);
            const currMax = runRandomIteration(table, startFrom, average);
            console.log(currMax);
            if (currMax > max) {
                max = currMax;
            }
        }
        console.log('max', max);
        const slides = [...h];
        // console.log(slides.map(v => v.id));
    });
