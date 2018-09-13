var EMPTY_OBJECT = {};

module.exports.hap = hap;

function hap(o, p) {
  return EMPTY_OBJECT.hasOwnProperty.call(o, p);
}
