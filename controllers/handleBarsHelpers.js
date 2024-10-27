"use strict";
const helper = {};
helper.createStarList = (stars) => {
    let str = '<div class="ratting">'
    let i;
    for (i = 1; i <= 5; i++) {
        if (i <= Math.floor(stars)) {
            str += '<i class="fa fa-star"></i>'
        } else if (i - stars < 1) {
            str += '<i class="fa fa-star-half-o"></i>'
        } else {
            str += '<i class="fa fa-star-o"></i>'
        }
    };
    str += '</div>'
    return str;
}

module.exports = helper;