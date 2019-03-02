const fileName = process.argv[process.argv.length - 1];
const readline = require('linebyline');
const _ = require('lodash');
const comparePhotos = require('./comparePhoto');
const faker = require('faker');
const fs = require('fs');

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
    let last = Date.now();
    photos.forEach((a, i) => {
        table[a.id] = {};
        photos.forEach((b, j) => {
            table[a.id][b.id] = comparePhotos(photos[i], photos[j]);
        });
        console.log(i, (Date.now() - last) / 1000);
        last = Date.now();
    });
    fs.writeFileSync('./out.txt', JSON.stringify(table));
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

function createUniqArr(arr_1, arr_2) {
    for (let v of arr_2) {
        if (!arr_1.includes(v)) arr_1.push(v);
    }
    return arr_1;
}

function horizontalToSlides(h) {
    let slides = [];

    for (let i = 0; i < h.length; i += 2) {
        if (h[i] && h[i + 1]) {
            slides.push({
                id: -1,
                id_1: h[i].id,
                id_2: h[i + 1].id,
                o: 'V',
                tags: createUniqArr(h[i].tags, h[i + 1].tags),
            });
        }
    }

    return slides;
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
    const chain = [];
    for (let i = 0; i < Object.keys(tmpTable).length; i++) {
        const targetId = getIdByClosest2Average(average, tmpTable[currId], currId);
        sum += tmpTable[currId][targetId];
        chain.push({ a: currId, b: targetId });
        delete tmpTable[currId];
        delete tmpTable[targetId];
        for (const key in tmpTable) {
            delete tmpTable[key][targetId];
            delete tmpTable[key][currId];
        }
        currId = getNextId(tmpTable);
    }

    return { sum, chain };
}

function getNextId(table) {
    return faker.random.arrayElement(Object.keys(table));
}

readDataFile(fileName)
    .then((photos) => {
        let { v, h } = splitter(photos);
        console.log('splitted');
        const table = buildTableOfScoring(v);
        console.log('build table');
        const average = getAverage(table);
        console.log('average', average);
        let max = 0;
        let maxChain = null;
        for (let i = 0; i < 1000; i++) {
            console.log('iter', i);
            const startFrom = getNextId(table);
            const { sum, chain } = runRandomIteration(table, startFrom, average);
            if (sum > max) {
                max = sum;
                maxChain = chain;
            }
        }

        fs.writeFileSync('./out.txt', JSON.stringify(maxChain, null, 2));
        console.log('max', max);
        if (!maxChain) {
            maxChain = [];
        }
        const result = maxChain.map(({ a, b }) => `${a} ${b}`).join('\n');
        fs.writeFileSync('./result.txt', h.length + maxChain.length);
        fs.appendFileSync('./result.txt', '\n' + h.map(v => v.id).join('\n'),);
        fs.appendFileSync('./result.txt', '\n' + result);
        // console.log(slides.map(v => v.id));
    });
