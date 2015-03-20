
'use strict';

var M = require( './class' );

M.Page = M.defineClass( M.Disposable, {

  // 构造函数
  constructor: function () {
    M.Page.base( this, 'constructor' );

    this.dialogs = [];
    this.xhrs = [];
    this.tips = [];

  },

  // 类属性
  // statics: {}

  // 其他是原型属性
  destroy: function () {
    M.Page.base( this, 'dispose' );

    for ( var dialog, i = 0, l  = this.dialogs.length; i < l; i ++ ) {
      dialog = this.dialogs[ i ];
      dialog && dialog.remove && dialog.remove();
    }

    for ( var xhr, i = 0, l = this.xhrs.length; i < l; i ++ ) {
      xhr = this.xhrs[ i ];
      xhr && xhr.abort && xhr.abort();
    }

    for ( var obj, i = 0, l = this.tips.length; i < l; i ++ ) {
      obj = this.tips[ i ];
      obj && obj.destroy && obj.destroy();
    }

    this.dialogs = null;
    this.xhrs = null;
    this.tips = null;

  }

} );


M.definePageClass = function ( proto, statics ) {

  proto = proto || {};

  var parentClass = M.Page,
  constructor = proto.constructor;

  proto.constructor = function () {
    parentClass.apply( this, arguments );
    if ( constructor ) {
      constructor.apply( this, arguments );
    }
  };

  proto.statics = proto.statics || statics;

  return M.defineClass( parentClass, proto );
};

var Page = M.definePageClass();

var p = new Page;
// p.destroy();

console.log( p )