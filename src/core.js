
'use strict';

( function () {

  var root = this,

  // 组件依赖
  utils = require( './utils' ),

  mace = {};
  mace.version = '0.0.1';

  utils.extend( mace, utils );

  if ( typeof exports !== 'undefined' ) {
    if ( typeof module !== 'undefined' && module.exports ) {
      exports = module.exports = mace;
    }
    exports.mace = mace;
  } else {
    root.mace = mace;
  }

}.call( this ) );