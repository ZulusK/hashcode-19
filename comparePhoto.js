const comparePhoto = (photo, other) => {
    let average = 0;
    if (!other.hashes) {
        other.hashes = new Set();
        other.tags.forEach(tag => other.hashes.add(tag));
    }

    photo.tags.forEach(tag => {
        if (other.hashes.has(tag)) average++;
    });

    return Math.min(photo.tags.length - average, average, other.tags.length - average);
};


module.exports = comparePhoto;
