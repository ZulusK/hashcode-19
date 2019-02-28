const comparePhoto = (photo, other) => {
    let owerage = 0;
    const smallestArray = photo.tags.length >= other.tags.length ? other.tags : photo.tags;
    const biggestArray = photo.tags.length >= other.tags.length ? photo.tags : other.tags;
    smallestArray.forEach(el => {
        if (biggestArray.find(val => val === el)) owerage++;
    });

    return Math.min(photo.tags.length - owerage, owerage, other.tags.length - owerage);
};


module.exports = comparePhoto;
