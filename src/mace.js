
if ( typeof exports !== 'undefined' ) {
  if ( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = M;
  }
  exports.mace = M;
} else {
  root.mace = M;
}

}.call( this || window ) );
