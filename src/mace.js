
if ( typeof exports !== 'undefined' ) {
  if ( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = mace;
  }
  exports.mace = mace;
} else {
  root.mace = mace;
}

}.call( this ) );