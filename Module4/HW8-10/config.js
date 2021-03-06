'use strict';

module.exports = {
    getSrc,
    getDest,
    getBuildPath,
    getVendors
};

const path = require('path');

const appPath = 'app';
const buildPath = 'dist';
const vendorsPath = path.join('app', 'vendors');

const src = {
    html: path.join(appPath,'/*.html'),
    scssPath:  path.join(appPath + '/scss'),
    styles: path.join(appPath + '/scss/**/*.scss'),
    img: path.join(appPath, 'img', '/*.*'),
    sprite: path.join(appPath, 'img', 'sprite', '/*.*'),
    fonts: path.join(appPath, 'fonts', '/*.*')
};

const dest = {
    html: path.join(buildPath),
    styles: path.join(buildPath, 'css'),
    js: path.join(buildPath, 'js'),
    img: path.join(buildPath, 'img'),
    fonts: path.join(buildPath, 'fonts')
};

const vendors = {
    scripts: [
        path.join(vendorsPath, 'html5shiv/dist/html5shiv-printshiv.js')
    ],

    scriptsMin: [
        path.join(vendorsPath, 'html5shiv/dist/html5shiv-printshiv.min.js')
    ]
};

function getSrc() {
    return src;
}

function getDest() {
    return dest;
}

function getBuildPath() {
    return buildPath;
}

function getVendors() {
    return vendors;
}
