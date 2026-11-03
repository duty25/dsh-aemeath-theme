"use strict";
// Assets are served by this package's host half (lib/index.js) under one
// prefix route. Bump ASSET_REV when an asset changes to bust caches.
const ASSET_REV = '5';
const ASSET_BASE = '/aemeath-theme/assets/';
const asset = (name) => `${ASSET_BASE}${name}?v=${ASSET_REV}`;
module.exports = { ASSET_BASE, ASSET_REV, asset };
