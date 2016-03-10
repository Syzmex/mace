
'use strict';

( function () {

var
M = {},
root = M.global = this,
nav = root.navigator,
doc = root.document;

M.version = '0.0.1';

var
ArrProto = Array.prototype,
ObjProto = Object.prototype,
FunProto = Function.prototype,


// push     = ArrProto.push,
slice    = ArrProto.slice,
toString = ObjProto.toString,
hasOwnProperty = ObjProto.hasOwnProperty,


// Keys in IE < 9 that won’t be iterated by for key in ... and thus missed.
nonenumprops_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
],

// 检查浏览器是否可以遍历出以上属性
hasEnumBug = !{ toString: null }.propertyIsEnumerable( 'toString' ),

// getLength = M.property( 'length' ),


// 优化回调
// 函数中使用到arguments时编译器就无法对此函数优化所以尽量避免函数中使用arguments
// 因此这里尽可能多的返回含有多个参数的函数，避免使用到arguments
// 而系统中使用的函数参数尽量小于5个
// 在准确知道参数个数的时候比较管用
// optimizeCb_ = function( func, cxt, count ) {
//   if ( cxt === void 0 ) return func;
//   switch ( count == null ? 5 : count ) {
//     case 1: return function ( a1 ) {
//       return func.call( cxt, a1 );
//     };
//     case 2: return function ( a1, a2 ) {
//       return func.call( cxt, a1, a2 );
//     };
//     case 3: return function ( a1, a2, a3 ) {
//       return func.call( cxt, a1, a2, a3 );
//     };
//     case 4: return function ( a1, a2, a3, a4 ) {
//       return func.call( cxt, a1, a2, a3, a4 );
//     };
//   }
//   return function () {
//     return func.apply( cxt, arguments );
//   };
// },


collectnonenumprops_ = function ( obj, keys_ ) {
  var key, keys = [], idx = nonenumprops_.length;
  while ( idx -- ) {
    key = nonenumprops_[ idx ];
    if ( hasOwnProperty.call( obj, key ) && !~M.indexOf( keys_, key ) ) {
      keys.push( key );
    }
  }
  return keys;
},


createindexfinder_ = function ( dir, predicateFind /*, sortedIndex*/ ) {
  return function ( array, item, idx ) {
    var i = 0, length = array.length;
    if ( typeof idx == 'number' ) {
      if ( dir > 0 ) {
        i = idx >= 0 ? idx : Math.max( idx + length, i );
      } else {
        length = idx >= 0 ? Math.min( idx + 1, length ) : idx + length + 1;
      }
    }

    // 二分法优化
    // else if ( sortedIndex && idx && length ) {
    //   idx = sortedIndex( array, item );
    //   return array[ idx ] === item ? idx : -1;
    // }

    // 找NaN
    if ( item !== item ) {
      idx = predicateFind( slice.call( array, i, length ), M.isNaN );
      return idx >= 0 ? idx + i : -1;
    }

    for ( idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir ) {
      if ( array[ idx ] === item ) return idx;
    }
    return -1;
  };
},


createpredicateindexfinder_ = function ( dir ) {
  return function ( array, predicate, context ) {
    var
    length = array.length,
    index = dir > 0 ? 0 : length - 1;
    for (; index >= 0 && index < length; index += dir ) {
      if ( predicate( array[ index ], index, array ) ) return index;
    }
    return -1;
  };
},


/**
 * 如果参数 value 为 object function string 等生成获取方法
 */
// cb_ = function ( value, context, argCount ) {
//   if ( value == null ) return _.identity;
//   if ( _.isFunction( value ) ) return optimizeCb_( value, context, argCount );
//   if ( _.isObject( value ) ) return M.matcher( value );
//   return _.property( value );
// };

// M.iteratee = function ( value, context ) {
//   return cb_( value, context, Infinity );
// };



findIndex_     = createpredicateindexfinder_( 1 ),
findLastIndex_ = createpredicateindexfinder_( -1 );


M.indexOf     = createindexfinder_( 1, findIndex_ /*, M.sortedIndex*/ );
M.lastIndexOf = createindexfinder_( -1, findLastIndex_ );


// 对象计数
M.uidcounter_ = 0;

// mace对象唯一标识
M._uid_ = 'uid_' + ( ( Math.random() * 1e9 ) >>> 0 );


M.getUid = function ( obj ) {
  return obj[ M._uid_ ] ||
  ( obj[ M._uid_ ] = ++ M.uidcounter_ );
};


M.hasUid = function ( obj ) {
  return !!obj[ M._uid_ ];
};


M.removeUid = function ( obj ) {
  if ( 'removeAttribute' in obj ) {
    obj.removeAttribute( M._uid_ );
  }
  try {
    delete obj[ M._uid_ ];
  } catch ( ex ) {}
};


// M.property = function ( key ) {
//   return function ( obj ) {
//     return obj == null ? void 0 : obj[ key ];
//   };
// };


M.cloneObject = function ( obj ) {
  var type = M.typeOf( obj );
  if ( type == 'object' || type == 'array' ) {
    if ( obj.clone ) {
      return obj.clone();
    }
    var i, l, keys = M.keys( obj ),
    clone = type == 'array' ? [] : {};
    for ( i = 0, l = keys.length; i < l; i ++ ) {
      clone[ keys[ i ] ] = M.cloneObject( obj[ keys[ i ] ] );
    }
    return clone;
  }
  return obj;
};


M.pick = function ( obj, props ) {
  var rs = {};
  if ( !M.isArray( props ) ) {
    props = [ props ];
  }
  M.each( props, function ( prop ) {
    rs[ prop ] = obj[ prop ];
  } );
  return rs;
};


// 扩展函数
M.extend = function( target /*, var_args*/ ) {

  var i, j, l, npl, key, source;

  l = arguments.length;
  npl = nonenumprops_.length;
  if ( l < 2 || target == null ) return target;

  for ( i = 1; i < l; i ++ ) {
    source = arguments[ i ];
    for ( key in source ) {
      target[ key ] = source[ key ];
    }

    if ( hasEnumBug ) {
      for ( j = 0; j < npl; j ++ ) {
        key = nonenumprops_[ j ];
        if ( hasOwnProperty.call( source, key ) ) {
          target[ key ] = source[ key ];
        }
      }
    }
  }

  return target;

};


M.extendOwn = function( target /*, var_args*/ ) {

  var i, j, l, npl, key, source;

  l = arguments.length;
  npl = nonenumprops_.length;
  if ( l < 2 || target == null ) return target;

  for ( i = 1; i < l; i ++ ) {
    source = arguments[ i ];
    for ( key in source ) {
      if ( hasOwnProperty.call( source, key ) ) {
        target[ key ] = source[ key ];
      }
    }

    if ( hasEnumBug ) {
      for ( j = 0; j < npl; j ++ ) {
        key = nonenumprops_[ j ];
        if ( hasOwnProperty.call( source, key ) ) {
          target[ key ] = source[ key ];
        }
      }
    }
  }

  return target;

};


// 获取值的数据类型
M.typeOf = function ( value ) {

  var s = typeof value,
  className = toString.call( value );

  if ( s == 'object' ) {
    if ( value ) {

      if ( value instanceof Array ) {
        return 'array';
      }

      // 因为 typeof new String( '' ) => 'object'
      else if ( value instanceof String ) {
        return 'string';
      } else if ( value instanceof Object ) {
        return s;
      }

      if ( className == '[object Window]' ) {
        return 'object';
      }

      if ( className == '[object Array]' ||
          typeof value.length == 'number' &&
          typeof value.splice != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable( 'splice' ) ) {
        return 'array';
      }

      if ( className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable( 'call' ) ) {
        return 'function';
      }

    } else {
      return 'null';
    }

  } else if ( s == 'function' && typeof value.call == 'undefined' ) {
    return 'object';
  }

  return s;
};

// 判断是否定义过，未定义则等于undefined
M.isDef = function( val ) {
  return val !== void 0;
};


M.isNull = function ( val ) {
  return val === null;
};


M.isNaN = function ( val ) {
  return val !== val;
};


M.isDefAndNotNull = function ( val ) {
  // Note that undefined == null.
  return val != null;
};


M.isObject = function ( obj ) {
  var type = typeof obj;
  return type == 'object' && obj != null || type == 'function';
};


M.isDateLike = function ( obj ) {
  return M.isObject( obj ) && typeof obj.getFullYear == 'function';
};


M.isBoolean = function ( val ) {
  return typeof val === 'boolean';
};


M.isNumberAndNotNaN = function ( val ) {
  return typeof val === 'number' && val == val;
};


M.isArray = ArrProto.isArray || function ( val ) {
  return M.typeOf( val ) == 'array';
};


M.isArrayLike = function ( obj ) {
  return M.isArray( obj ) || M.isObject( obj ) && typeof obj.length == 'number';
};


M.isString = function ( obj ) {
  return toString.call( obj ) === '[object String]';
};


M.isEmpty = function ( obj ) {

  if ( obj == null ) return true;
  if ( M.isArrayLike( obj ) &&
      ( M.isArray( obj ) || M.isString( obj ) || M.isArguments( obj ) ) ) {
    return obj.length === 0;
  }

  var key, keys;

  for ( key in obj ) {
    return false;
  }

  if ( hasEnumBug ) {
    keys = collectnonenumprops_( obj, [] );
    return keys.length === 0;
  }

  return true;
};


M.has = function ( obj, key ) {
  return obj != null && hasOwnProperty.call( obj, key );
};


M.each = function ( obj, fn, context ) {
  var i, l, arr;
  if ( M.isArray( obj ) || M.isArrayLike( obj ) ) {
    if ( ArrProto.forEach ) {
      ArrProto.forEach.call( obj, fn, context );
    } else {
      arr = M.isString( obj ) ? obj.split( '' ) : obj;
      for ( i = 0, l = obj.length; i < l; i ++ ) {
        fn.call( context, arr[ i ], i, obj );
      }
    }
  } else {
    arr = M.keys( obj );
    for ( i = 0, l = arr.length; i < l; i ++ ) {
      fn.call( context, obj[ arr[ i ] ], arr[ i ], obj );
    }
  }
};


M.filter = function ( obj, predicate, context ) {
  var results = [];
  M.each( obj, function ( value, index, list ) {
    if ( predicate( value, index, list ) ) results.push( value );
  } );
  return results;
};


M.keys = function ( obj ) {

  if ( !M.isObject( obj ) ) return [];
  if ( Object.keys ) return Object.keys( obj );

  var key, keys = [];
  for ( key in obj ) {
    if ( M.has( obj, key ) ) keys.push( key );
  }

  if ( hasEnumBug ) {
    keys.concat( collectnonenumprops_( obj, keys ) );
  }

  return keys;
};



// bind函数
var bindNative_ = function ( fn, context /*, var_args*/ ) {
  return fn.call.apply( fn.bind, arguments );  // 溜
};


var bindJs_ = function ( fn, context /*, var_args*/ ) {
  if ( arguments.length > 2 ) {
    var boundArgs = ArrProto.slice.call( arguments, 2 );
    return function () {
      // Prepend the bound arguments to the current arguments.
      var newArgs = ArrProto.slice.call( arguments );
      ArrProto.unshift.apply( newArgs, boundArgs );
      return fn.apply( context, newArgs );
    };
  }
  else {
    return function () {
      return fn.apply( context, arguments );
    };
  }
};


M.bind = function ( fn, context /*, var_args*/ ) {

  if ( !fn ) {
    throw new Error( "Can't find any function" );
  }

  if ( FunProto.bind && FunProto.bind.toString().indexOf( 'native code' ) != -1 ) {
    M.bind = bindNative_;
  } else {
    M.bind = bindJs_;
  }

  return M.bind.apply( null, arguments );
};


M.partial = function ( fn /*, var_args*/ ) {
  var args = ArrProto.slice.call( arguments, 1 );
  return function () {
    var newArgs = args.slice();
    newArgs.push.apply( newArgs, arguments );
    return fn.apply( this, newArgs );
  };
};


M.each( [ 'Arguments', 'Function', 'Number', 'Date', 'RegExp', 'Error' ], function ( name ) {
  M[ 'is' + name ] = function ( obj ) {
    return toString.call( obj ) === '[object ' + name + ']';
  };
} );

+ function () {
  if ( !M.isArguments( arguments ) ) {
    M.isArguments = function ( obj ) {
      return M.has( obj, 'callee' );
    };
  }
}();

/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to mace.globalEval (which
 * empirically tests whether eval works for globals). @see mace.globalEval
 * @type {?boolean}
 * @private
 */
var evalWorksForGlobals_ = !!root.execScript || ( function () {
  root.eval( 'var _et_ = 1' );
  if ( root._et_ != void 0 ) {
    delete root._et_;
    return true;
  }
  return false;
} () );


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use mace.global.eval. If mace.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
M.globalEval = function ( script ) {
  if ( root.execScript ) {
    root.execScript( script, 'JavaScript' );
  } else if ( root.eval ) {
    if ( evalWorksForGlobals_ ) {
      root.eval( script );
    } else if ( doc ) {
      var scriptElt = doc.createElement( 'script' );
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild( doc.createTextNode( script ) );
      doc.body.appendChild( scriptElt );
      doc.body.removeChild( scriptElt );
    }
  } else {
    throw Error( 'globalEval not available' );
  }
};


+ function ( win, document, navigator ) {

  if ( !document ) return;

  var
  ua = navigator.userAgent.toLowerCase(),
  doc = document.documentElement,

  ie = 'ActiveXObject' in win,

  firefox   = ua.indexOf( 'firefox' ) !== -1,
  webkit    = ua.indexOf( 'webkit' ) !== -1,
  phantomjs = ua.indexOf( 'phantom' ) !== -1,
  android23 = ua.search( 'android [23]') !== -1,
  chrome    = ua.indexOf( 'chrome' ) !== -1,
  gecko     = ua.indexOf( 'gecko' ) !== -1  && !webkit && !win.opera && !ie,

  mobile = typeof orientation !== 'undefined' || ua.indexOf( 'mobile' ) !== -1,
  msPointer = !win.PointerEvent && win.MSPointerEvent,
  pointer = ( win.PointerEvent && navigator.pointerEnabled ) || msPointer,

  ie3d = ie && ( 'transition' in doc.style ),
  webkit3d = ( 'WebKitCSSMatrix' in win ) && ( 'm11' in new win.WebKitCSSMatrix() ) && !android23,
  gecko3d = 'MozPerspective' in doc.style,
  opera12 = 'OTransition' in doc.style,

  eventList = [ 'focusin', 'focusout', 'mouseenter', 'mouseleave', 'input' ],

  isSVG = doc.nodeName.toLowerCase() === 'svg',

  touch = !phantomjs && ( pointer || 'ontouchstart' in win ||
      ( win.DocumentTouch && document instanceof win.DocumentTouch ) ),

  createElement = function () {
    if ( typeof document.createElement !== 'function' ) {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return document.createElement( arguments[ 0 ] );
    } else if ( isSVG ) {
      return document.createElementNS.call( document, 'http://www.w3.org/2000/svg',
          arguments[ 0 ] );
    } else {
      return document.createElement.apply( document, arguments );
    }
  },

  hasEvent = ( function () {

    // Detect whether event support can be detected via `in`. Test on a DOM element
    // using the "blur" event b/c it should always exist. bit.ly/event-detection
    var needsFallback = !( 'onblur' in document.documentElement );

    return function inner ( eventName, element ) {

      var isSupported;
      if ( !eventName ) { return false; }
      if ( !element || typeof element === 'string' ) {
        element = createElement( element || 'div' );
      }

      // Testing via the `in` operator is sufficient for modern browsers and IE.
      // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
      // "resize", whereas `in` "catches" those.
      eventName = 'on' + eventName;
      isSupported = eventName in element;

      // Fallback technique for old Firefox - bit.ly/event-detection
      if ( !isSupported && needsFallback ) {
        if ( !element.setAttribute ) {
          // Switch to generic element if it lacks `setAttribute`.
          // It could be the `document`, `window`, or something else.
          element = createElement( 'div' );
        }

        element.setAttribute( eventName, '' );
        isSupported = typeof element[ eventName ] === 'function';

        if ( element[ eventName ] !== undefined ) {
          // If property was created, "remove it" by setting value to `undefined`.
          element[ eventName ] = undefined;
        }
        element.removeAttribute( eventName );
      }
      return isSupported;
    }
  } )();

  M.support = {
    ie: ie,
    ielt9: ie && !document.addEventListener,
    firefox: firefox,
    webkit: webkit,
    gecko: gecko,
    android: ua.indexOf( 'android' ) !== -1,
    android23: android23,
    chrome: chrome,
    safari: !chrome && ua.indexOf( 'safari' ) !== -1,

    ie3d: ie3d,
    webkit3d: webkit3d,
    gecko3d: gecko3d,
    opera12: opera12,
    any3d: !win.L_DISABLE_3D && ( ie3d || webkit3d || gecko3d ) && !opera12 && !phantomjs,

    mobile: mobile,
    mobileWebkit: mobile && webkit,
    mobileWebkit3d: mobile && webkit3d,
    mobileOpera: mobile && win.opera,
    mobileGecko: mobile && gecko,

    touch: !!touch,
    msPointer: !!msPointer,
    pointer: !!pointer,

    retina: ( win.devicePixelRatio || ( win.screen.deviceXDPI / win.screen.logicalXDPI ) ) > 1
  };


  // 事件测试
  M.each( eventList, function ( event ) {
    M.support[ event ] = hasEvent( event );
  } );

}( root, doc, nav );

+ function () {

var
BaseClass = function () {

  // 初始化
  if ( this.__init__ ) {
    this.__init__.apply( this, arguments );
  }

};


BaseClass.version = '0.0.1';


BaseClass.prototype.destroy = function () {
  this.destroyInternal();
  M.each( this, function ( v, key ) {
    M.has( this, key ) && ( this[ key ] = null );
  }, this );
  this.isDisposed = true;
};


/**
 * 连带销毁的使用场景
 * 父页面子页面继承与同一个类
 * 父页面销毁连带子页面销毁只要用此方法不需要在destroy中添加销毁的代码
 */

// 运行销毁回调函数
// 可以连带销毁相关的对象
BaseClass.prototype.destroyInternal = function () {
  if ( this.internalCallbacks_ ) {
    while ( this.internalCallbacks_.length ) {
      this.internalCallbacks_.shift()();
    }
  }
};

// 添加连带销毁的对象
BaseClass.prototype.addInternalCallbacks = function ( fun ) {
  if ( M.isFunction( fun ) ) {
    this.internalCallbacks_
        ? this.internalCallbacks_.push( fun )
        : this.internalCallbacks_ = [ fun ];
  } else {
    new Error( "Can't find function" );
  }
};



// 摒弃之前的makeClass把extend(父类)作为参数传递进来的写法
// 避免检查extend(父类)参数的合法性
// 该方法应该作为一个类方法
// proto上只写方法不要写属性基本没有实际意义
var objectExtend = function ( proto, staticProperty ) {

  var Derivative,
  parent = this;

  if ( proto && M.has( proto, 'constructor' ) ) {
    Derivative = proto.constructor;
  } else {
    Derivative = function () { return parent.apply( this, arguments ) };
  }

  /**
   * 创建一个构造函数
   */
  var Progenitor = function () { this.constructor = Derivative };
  Progenitor.prototype = parent.prototype;
  Derivative.prototype = new Progenitor;


  // 初始化函数
  if ( !proto.__init__ ) {
    proto.__init__ = function () {
      if ( M.isFunction( parent.prototype.__init__ ) ) {
        parent.prototype.__init__.apply( this, arguments );
      }
      if ( M.isFunction( proto.init ) ) {
        proto.init.apply( this, arguments );
      }
    };
  }

  // 销毁方法所有属性清空
  var destroy_ = proto.destroy;
  proto.destroy = function () {
    if ( M.isFunction( destroy_ ) ) {
      destroy_.apply( this, arguments );
    }
    if ( M.isFunction( parent.prototype.destroy ) ) {
      parent.prototype.destroy.apply( this, arguments );
    }
  };

  // 新属性
  M.extend( Derivative.prototype, proto );

  // 类方法叠加
  if ( M.isFunction( staticProperty ) ) {
    M.extend( Derivative, parent );
    staticProperty( Derivative );
  } else {
    M.extend( Derivative, parent, staticProperty );
  }

    // 记录父类的原型
  Derivative.__super__ = parent.prototype;

  // 添加寻找父类方法的途径，更好的来访问父类的方法
  Derivative.super_ = function ( obj, methodName ) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var i, l, args = [];
    for ( i = 2, l = arguments.length; i < l; i ++ ) {
      args[ i - 2 ] = arguments[ i ];
    }
    return parent.prototype[ methodName ].apply( obj, args );
  };

  return Derivative;

};


BaseClass.extend = objectExtend;
BaseClass.include = function ( opt ) {
  M.extend( this.prototype, opt );
};


/**
 * 用函数创建类
 * 默认从BaseClass继承
 */
M.createClass = function ( base, proto, staticProperty ) {
  if ( M.isFunction( base ) && base.extend === objectExtend ) {
    return base.extend( proto, staticProperty );
  } else {
    staticProperty = proto;
    proto = base;
  }
  return BaseClass.extend( proto, staticProperty );
};

}();


+ function () {

  var

  counter_ = 0,

  dictionary = {},

  dicmap = {};



  var

  dicProto = {

    init: function () {
      this.length = 0;
      this.__hash__ = 0;
      this.__cache__ = {};
      this.__contents__ = {};
    },


    // 获取/创建 子字典
    child: function ( namespace ) {
      if ( !this.has( namespace ) ) {
        var dic = new M.Dictionary();
        this.put( namespace, dic );
        return dic;
      } else {
        return this.get( namespace );
      }
    },


    /**
     * 放入
     * @param  {obj|string|num} namespace 对象、文字、数字
     */
    put: function ( namespace, content ) {
      if ( !this.has( namespace ) ) {
        this.__cache__[ this.__hash__ ] = namespace;
        this.__contents__[ this.__hash__ ++ ] = content;
        this.length ++;
      } else {
        for ( var hash in this.__cache__ ) {
          if ( this.__cache__[ hash ] === namespace ) {
            this.__contents__[ hash ] = content;
          }
        }
      }
      return this;
    },


    /**
     * 取出
     * @param  {obj|string|num} namespace 对象、文字、数字
     */
    get: function ( namespace ) {
      for ( var hash in this.__cache__ ) {
        if ( this.__cache__[ hash ] === namespace ) {
          return this.__contents__[ hash ];
        }
      }
      return null;
    },


    has: function ( namespace ) {
      for ( var hash in this.__cache__ ) {
        if ( this.__cache__[ hash ] === namespace ) {
          return true;
        }
      }
      return false;
    },


    remove: function ( namespace ) {
      if ( this.has( namespace ) ) {
        for ( var hash in this.__cache__ ) {
          if ( this.__cache__[ hash ] === namespace ) {
            delete this.__cache__[ hash ];
            delete this.__contents__[ hash ];
            this.length --;
          }
        }
      }
      return this;
    }

  },


  dicStatic = {

    uuid: function () {
      return ++ counter_;
    }

  };


  M.Cache = M.Dictionary = M.createClass( dicProto, dicStatic );


} ();


/*

var
mode = new M.Cache();
mode.put( obj, {} );
mode.get( obj ); ==> {}

 */


var


// 事件名称分割符
splitter = /\s+/,

// 带变量名的change事件
changeSplitter = /:/,
changeName = /^change:\S*$/,


// 事件池
eventpool_ = {},

// sortStack = function ( stack ) {
//   var i, j, l, newStack = [];
//   for ( i = 0, l = stack.length; i < l; i ++ ) {
//     var ling1 = stack[ i ], ling2 = stack[ l - i - 1 ];
//     if ( M.isBoolean( ling1.context ) && ling1.context === false ) {
//       newStack.push( ling1 );
//     }
//     if ( M.isBoolean( ling2.context ) && ling2.context === true ) {
//       newStack.unshift( ling2 );
//     }
//   }
//   return newStack;
// },

/**
 * 针对变量名添加时间触发
 * 参数 name = 'change:变量名'
 * writable: false
 * enumerable: true
 * configurable: false
 * 不建议频繁赋值该属性
 */
bindAttributeChangeTrigger_ = function ( obj, name ) {
  var curr, varName = name.split( changeSplitter )[ 1 ];
  Object.defineProperty( obj, varName, {
    set: function ( val ) {
      if ( curr !== val ) {
        this.trigger( name, curr = val );
      }
    },
    get: function () {
      return curr;
    },
    enumerable: true
  } );
},


/**
 * 添加事件到列表
 */
putIntoEvent_ = function ( events, obj, name, clb, context, listening ) {

  var i, l, ling,
  cxt = context !== void 0 ? context : ( listening ? listening.listener : obj ),
  stack = events[ name ] || ( events[ name ] = [] );

  // 相同函数不重复绑定
  for ( i = 0, l = stack.length; i < l; i ++ ) {
    if ( context !== void 0 ) {
      if ( stack[ i ].callback === clb && stack[ i ].context === context ) return events;
      if ( clb.__clb__ && stack[ i ].callback.__clb__ === clb.__clb__ &&
          stack[ i ].context === context ) return events;
    } else {
      if ( stack[ i ].callback === clb ) return events;
      if ( clb.__clb__ && stack[ i ].callback.__clb__ === clb.__clb__ ) return events;
    }
  }

  ling = {
    obj: obj,
    context: cxt,
    callback: clb
  };

  if ( listening ) {
    listening.count ++;
    ling.listener = listening.listener;
  }

  if ( changeName.test( name ) ) {
    bindAttributeChangeTrigger_( obj, name );
  }

  stack.push( ling );

  return events;
},


/**
 * 从列表删除事件
 */
clearOutofEvent_ = function ( events, obj, name, clb, context, listening ) {

  // 监听销毁
  // 取出监听相关的事件比对删除
  if ( listening ) {
    var allLen = 0, listener = listening.listener;
    M.each( name ? [ name ] : M.keys( events ), function ( name ) {
      var stack = events[ name ], len = stack.length;
      stack = M.filter( stack, function ( event ) {
        if ( event.listener === listener ) {
          if ( clb && event.callback.__clb__ ) {
            return context === void 0 ? event.callback.__clb__ !== clb
                : ( event.context !== context || event.callback.__clb__ !== clb );
          } else if ( clb ) {
            return context === void 0 ? event.callback !== clb
                : ( event.context !== context || event.callback !== clb );
          }
        }
        return true;
      } );
      allLen += len - stack.length;
      if ( stack.length ) {
        events[ name ] = stack;
      } else {
        delete events[ name ];
      }
    } );
    listening.count -= allLen;
  }

  // 普通事件删除
  else  if ( clb ) {
    M.each( name ? [ name ] : M.keys( events ), function ( name ) {
      var stack = events[ name ];
      stack = M.filter( stack, function ( event ) {
        if ( event.callback.__clb__ ) {
          return context === void 0 ? event.callback.__clb__ !== clb
              : ( event.context !== context || event.callback.__clb__ !== clb );
        }
        return context === void 0 ? event.callback !== clb
            : ( event.context !== context || event.callback !== clb );
      } );
      if ( stack.length ) {
        events[ name ] = stack;
      } else {
        delete events[ name ];
      }
    } );
  } else if ( name ) {
    delete events[ name ];
  } else {
    events = {};
  }

  return events;
},


/**
 * 添加到事件池
 */
addToPool_ = function ( obj, name, clb, context, listening ) {
  if ( clb ) {
    var
    uid = M.getUid( obj ),
    eventCache = eventpool_[ uid ],
    events = obj.__events__ || ( obj.__events__ = {} );
    obj.__events__ = putIntoEvent_( events, obj, name, clb, context, listening );
    if ( !eventCache ) {
      eventpool_[ uid ] = obj;
    }
    if ( listening ) {
      var listeners = obj.__listeners__ || ( obj.__listeners__ = {} ),
      listener = listeners[ listening.id ];
      if ( !listener ) {
        listeners[ listening.id ] = listening;
      }
    }
  }
},


/**
 * 从事件池清除
 */
clearOutofPool_ = function ( obj, name, clb, context, listening ) {
  var
  uid = M.getUid( obj ),
  events = obj.__events__;

  if ( events ) {
    events = clearOutofEvent_( events, obj, name, clb, context, listening );
  }

  if ( events && M.isEmpty( events ) ) {
    delete obj.__events__;
    delete eventpool_[ uid ];
  } else {
    obj.__events__ = events;
  }

  if ( listening ) {
    var
    listener = listening.listener,
    listeners = obj.__listeners__,
    listentos = listener.__listenTo__;
    if ( listening.count === 0 ) {
      delete listeners[ listening.id ];
      delete listentos[ listening.objId ];
    }
    if ( M.isEmpty( listeners ) ) {
      delete obj.__listeners__;
    }
    if ( M.isEmpty( listentos ) ) {
      delete listener.__listenTo__;
    }
  }
},


// 事件处理
eventsArgs_ = function ( predicate, obj, events, callback, context, listening ) {

  // jQuery风格
  if ( M.isObject( events ) ) {
    var i, l, k, evtList = M.isArray( events ) ? events : M.keys( events );
    for ( i = 0, l = evtList.length; i < l; i ++ ) {
      eventsArgs_( predicate, obj, k = evtList[ i ], events[ k ], callback, listening );
    }
  }

  // 多个处理
  else if ( events && splitter.test( events ) ) {
    M.each( events.split( splitter ), function ( evt ) {
      evt && predicate( obj, evt, callback, context, listening );
    } );
  }

  // 单个处理
  else {
    predicate( obj, events, callback, context, listening );
  }

},


// 绑定事件
on_ = function ( obj, events, callback, context, listening  ) {
  if ( callback && M.isObject( events ) ) {
    context = callback;
    callback = void 0;
  }
  eventsArgs_( addToPool_, obj, events, callback, context, listening );
},


once_ = function ( obj, events, callback, context, listening ) {

  if ( M.isObject( events ) ) {
    var i, l, k, names = M.keys( events );
    for ( i = 0, l = names.length; i < l; i ++ ) {
      once_( obj, k = names[ i ], events[ k ], callback, listening );
    }
  }

  var clb = function () {
    callback.apply( this, arguments );
    obj.off( events, clb, context );
  };
  clb.__clb__ = callback;

  on_( obj, events, clb, context, listening );
},


// 销毁事件
// -events void 0 void 0 (object|string _ _)
// -void 0 callback void 0 (_ function _)
// -events callback void 0 (string function _)
// -events void 0 context (object|string _ object|bool)
// -void 0 callback context (_ function object|bool)
// -events callback context (string function object|bool)
off_ = function ( obj, events, callback, context, listening ) {
  if ( M.isFunction( events ) ) {
    context = callback;
    callback = events;
    events = void 0;
  } else if ( events && callback && !M.isFunction( callback ) && !M.isFunction( events ) ) {
    context = callback;
    callback = void 0;
  }
  eventsArgs_( clearOutofPool_, obj, events, callback, context, listening );
},


// 触发事件
emit_ = function ( obj, names, args, wantEvent ) {
  var
  events = obj.__events__;
  M.each( names.split( splitter ), function ( name ) {

    // 事件触发开关
    // silenceStack中的事件不触发
    if ( name && !~M.indexOf( obj.__silenceStack__, name ) ) {
      triggerEvt_( obj, events, name, args, wantEvent );
    }

  } );
},


triggerEvt_ = function ( obj, events, name, args, wantEvent ) {
  var ev,
  stack = events[ name ],
  allStack = events[ 'all' ];
  if ( stack ) {
    if ( wantEvent ) {
      ev = new M.Event( { type: name, currentType: name, target: obj, data: args } );
    }
    callEvtCb_( stack, ev ? [ ev ].concat( args ) : args );
  }
  if ( allStack && name !== 'all' ) {
    if ( wantEvent ) {
      ev = new M.Event( { type: name, currentType: 'all', target: obj, data: args } );
    }
    callEvtCb_( allStack, ev ? [ ev ].concat( args ) : args );
  }
},


// 函数运行优化
callEvtCb_ = function ( stack, args ) {
  var a1 = args[ 0 ], a2 = args[ 1 ], a3 = args[ 2 ], a4 = args[ 3 ];
  switch ( args.length ) {
    case 1: doWhileWithoutArguments_( stack, a1 ); return;
    case 2: doWhileWithoutArguments_( stack, a1, a2 ); return;
    case 3: doWhileWithoutArguments_( stack, a1, a2, a3 ); return;
    case 4: doWhileWithoutArguments_( stack, a1, a2, a3, a4 ); return;
    default: doWhile_( stack, args ); return;
  }
},


doWhileWithoutArguments_ = function ( stack, a1, a2, a3, a4 ) {
  var fireAll, sk,
  isImmediatePropagationStopped = false,
  ev = a1, i = -1, l = stack.length, trueList = [], falseList = [];
  while ( ++ i < l && !isImmediatePropagationStopped ) {

    // 基础自定义事件处理
    sk = stack[ i ];

    // DomEvented 事件处理
    if ( sk.obj.__eventhandle__ ) {
      fireAll = sk.obj.__eventhandle__[ ev.type ].__fireAll__;
      if ( fireAll || ( ev.fired && ev.usecapture == void 0 ) || ev.usecapture === sk.context ) {
        sk.callback.call( sk.obj.element, a1, a2, a3, a4 );
      }
    }

    // 普通事件处理
    else {
      sk.callback.call( sk.context, a1, a2, a3, a4 );
    }

    isImmediatePropagationStopped = ev && ev.isImmediatePropagationStopped;

  }
},


doWhile_ = function ( stack, args ) {
  var fireAll, sk,
  isImmediatePropagationStopped = false,
  ev = args[ 0 ], i = -1, l = stack.length;
  while ( ++ i < l && !isImmediatePropagationStopped ) {

    // 基础自定义事件处理
    sk = stack[ i ];

    // DomEvented 事件处理
    if ( sk.obj.__eventhandle__ ) {
      fireAll = sk.obj.__eventhandle__[ ev.type ].__fireAll__;
      if ( fireAll || ( ev.fired && ev.usecapture == void 0 ) || ev.usecapture === sk.context ) {
        sk.callback.apply( sk.obj.element, args );
      }
    }

    // 普通事件处理
    else {
      sk.callback.apply( sk.context, args );
    }

    isImmediatePropagationStopped = ev && ev.isImmediatePropagationStopped;

  }
},


listenTo_ = function ( onFun, obj, events, callback, context ) {
  var
  thisId = M.getUid( this ),
  objId = M.getUid( obj ),
  listenTo = this.__listenTo__ || ( this.__listenTo__ = {} ),
  listening = listenTo[ objId ];
  if ( !listening ) {
    listening = listenTo[ objId ] = { obj: obj, objId: objId, listener: this,
        id: thisId, count: 0 };
  }
  onFun( obj, events, callback, context, listening );
},


eventedProto = {

  init: function () {

    // 我是独一无二的
    M.getUid( this );

    // 事件机制总开关
    this.__silence__ = false;

    this.__silenceStack__ = [];
  },


  destroy: function () {
    M.removeUid( this );
    M.Evented.super_( this, 'destroy' );
  },


  /**
   * 添加事件开关
   */
  silence: function ( names /*, var_args*/ ) {
    if ( !names ) return this.__silence__ = true;
    if ( !M.isArray( names ) ) {
      names = slice.call( arguments );
    }
    M.each( names, function ( name ) {
      if ( !~M.indexOf( this.__silenceStack__, name ) ) {
        this.__silenceStack__.push( name );
      }
    } );
  },


  /**
   * 取消事件开关
   */
  desilence: function ( names ) {
    if ( !names ) return this.__silence__ = false;
    if ( !M.isArray( names ) ) names = [ names ];
    this.__silenceStack__ = M.filter( this.__silenceStack__, function ( name ) {
      return !~M.indexOf( names, name );
    } );
  },


  /**
   * 绑定事件
   * 1.单个参数jquery风格
   * { click: callback ... }
   * 2.多个参数
   * ( 'click', callback, [ context ] )
   * ( 'click blur', callback, [ context ] )
   */
  on: function ( events, callback, context ) {
    events && on_( this, events, callback, context );
    return this;
  },


  once: function ( events, callback, context ) {
    events && once_( this, events, callback, context );
    return this;
  },


  /**
   * 解绑事件
   * 参数同上
   */
  off: function ( events, callback, context ) {
    if ( events && this.__events__ ) off_( this, events, callback, context );
    return this;
  },


  /**
   * 触发事件
   * 参数 names ('click'|'click blur')
   */
  trigger: function ( names /*, var_args*/ ) {
    if ( !this.__silence__ && names && this.__events__ ) {
      var ev, args = slice.call( arguments, 1 );
      if ( M.isObject( names ) && names.type ) {
        ev = names;
        names = [ ev.type ];
        args.unshift( ev );
        this.__wantEvent__ = false;
        ev.isImmediatePropagationStopped = false;
      }
      emit_( this, names, args, this.__wantEvent__ !== false );
    }
    return this;
  },


  listenTo: function ( obj, events, callback, context ) {
    obj && listenTo_.call( this, on_, obj, events, callback, context );
    return this;
  },


  listenToOnce: function ( obj, events, callback, context ) {
    obj && listenTo_.call( this, once_, obj, events, callback, context );
    return this;
  },


  stopListen: function ( obj, events, callback, context ) {
    if ( obj && this.__listenTo__ ) {
      var i, l, listening,
      listenTo = this.__listenTo__,
      ids = obj ? [ M.getUid( obj ) ] : M.keys( this.__listenTo__ );

      for ( i = 0, l = ids.length; i < l; i ++ ) {
        listening = listenTo[ ids[ i ] ];
        if ( !listening ) break;
        off_( listening.obj, events, callback, context, listening );
      }
    }
    return this;
  }

},


// 类方法
eventedStatic = {
  version: '0.0.1',
  eventpool: eventpool_,
  getObject: function ( uid ) {
    return eventpool_[ uid ];
  }
};


M.Object = M.Evented = M.createClass( eventedProto, eventedStatic );


var

eventProto = {
  init: function ( props ) {
    this.type;
    this.currentType;
    M.extendOwn( this, props );

    // 判定是否阻止了同类型事件的冒泡
    this.isImmediatePropagationStopped = false;

  },

  stopImmediatePropagation: function () {
    this.isImmediatePropagationStopped = true;
  }

},

eventStatic = {};

M.Event = M.createClass( eventProto, eventStatic );





+ function () {

  if ( !doc ) return;

  var dom = {


    getWindow: function ( elem ) {
      return elem ? this.getDocument( elem ).defaultView : window;
    },

    getDocument: function ( elem ) {
      return ( elem && elem.ownerDocument ) || document;
    },

    // 检测a元素是否包含了b元素
    contains: function ( a, b ) {

      // 标准浏览器支持compareDocumentPosition
      if ( a.compareDocumentPosition ) {
        return !!( a.compareDocumentPosition( b ) & 16 );
      }
      else if ( a.contains ) {
        return a !== b && a.contains( b );
      }
      else {
        while ( b = b.parentNode ) {
          if ( a == b ) return true;
        }
      }
      return false;
    },


    parent: function ( elem ) {
      return elem.parentNode;
    },


    parents: function ( elem, reverse_, all_ ) {

      var
      doc_, win_, end_,
      parentList = [],
      parent = this.parent( elem );

      if ( all_ ) {
        doc_ = this.getDocument( elem );
        win_ = doc_.defaultView || window;
        end_ = reverse_ ? [ win_, doc_ ] : [ doc_, win_ ];
      }

      if ( parent == doc_ ) {
        return end_ || [];
      }
      else if ( parent ) {
        parentList = reverse_
            ? this.parents( parent, reverse_, all_ ).concat( [ parent ] )
            : [ parent ].concat( this.parents( parent, reverse_, all_ ) );
      }

      return parentList;
    }

  };

  M.dom = dom;

} ();


+ function () {

if ( !doc ) return;

var
ielt9 = M.support.ielt9,
isECMAEvent = !!doc.addEventListener,
eventHooks = {},

// 事件缓存
cache = new M.Dictionary(),

rFormElems = /^(?:textarea|input|select)$/i,
rInputCheck = /^(?:radio|checkbox|)$/,


// 基础的属性
baseProps = 'type target returnValue defaultPrevented currentTarget eventPhase timeStamp cancelable cancelBubble bubbles isTrusted'.split( ' ' ),


uiEventProps = 'isChar detail layerX layerY pageX pageY view which'.split( ' ' ),


focusEventProps = uiEventProps.concat( 'relatedTarget'.split( ' ' ) ),


mouseEventProps = uiEventProps.concat( 'altKey button clientX clientY ctrlKey metaKey movementX movementY offsetX offsetY relatedTarget screenX screenY shiftKey fromElement toElement webkitForce x y'.split( ' ' ) ),

keyboardEventProps = uiEventProps.concat( 'altGraphKey altKey charCode ctrlKey keyCode keyIdentifier keyLocation location metaKey shiftKey'.split( ' ' ) ),



// 事件统计来自 'http://www.w3school.com.cn/tags/html_ref_eventattributes.asp'
formEvent = 'blur change contextmenu focus formchange forminput input invalid reset select submit'.split( ' ' ),

// 鼠标事件
mouseEvent = 'click dblclick drag dragend dragenter dragleave dragover dragstart drop mousedown mousemove mouseout mouseover mouseup mousewheel scroll'.split( ' ' ),

// 键盘事件
keyboardEvent = 'keydown keypress keyup'.split( ' ' ),

// 针对 window 对象触发的事件（应用到 <body> 标签）
windowEvent = 'afterprint beforeprint beforeonload error haschange load message offline online pagehide pageshow popstate redo resize storage undo unload blur focus'.split( ' ' ),

// 适用于所有 HTML 元素，但常见于媒介元素中，比如 <audio>、<embed>、<img>、<object> 以及 <video>）
mediaEvent = 'abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange readystatechange seeked seeking stalled suspend timeupdate volumechange waiting'.split( ' ' ),


allEvent = ( function () {
  var all = [];
  M.each( [
    formEvent,
    mouseEvent,
    keyboardEvent,
    windowEvent,
    mediaEvent
  ], function ( list ) {
    var tmp = M.filter( list, function ( item ) {
      return !~M.indexOf( all, item );
    } );
    all = all.concat( tmp );
  } );
  return all;
} )(),


domAddEventListener_ = function ( dom, name, callback, useCapture ) {
  if ( dom.addEventListener ) {
    dom.addEventListener( name, callback, useCapture );
  }
  else if ( dom.attachEvent ) {
    dom.attachEvent( 'on' + name, callback );
  }
  else {
    dom[ 'on' + name ] = callback;
  }
},


domRemoveEventListener_ = function ( dom, name, callback, useCapture ) {
  if ( dom.removeEventListener ) {
    dom.removeEventListener( name, callback, useCapture );
  }
  else if ( dom.detachEvent ) {
    dom.detachEvent( 'on' + name, callback );
  }
  else {
    dom[ 'on' + name ] = null;
  }
},


addEventHandle_ = function ( dom, name, callback, useCapture ) {

  this.__eventhandle__ || ( this.__eventhandle__ = {} );

  var
  that = this,
  hook = eventHooks[ name ],
  cuKey = name + ':' + useCapture,
  deCuKey = name + ':' + !useCapture,
  stack = this.__events__[ name ],
  fireMap = this.__eventhandle__[ name ] || ( this.__eventhandle__[ name ] = {} );
  if ( !fireMap[ cuKey ] ) {
    fireMap[ cuKey ] = function ( e ) {

      // 捕获和正常事件函数都存在时，只需要运行一次函数列表
      if ( fireMap[ deCuKey ] && fireMap.__fireAll__ ) {
        delete fireMap.__fireAll__; return;
      }

      // 触发函数只有一个或是本身触发
      // 运行函数列表全部函数
      if ( !fireMap[ deCuKey ] || e.target === this ) {
        fireMap.__fireAll__ = true;
      }

      var fixed = hook && hook.fix ? hook.fix( fixedEvent_( e ) ) : fixedEvent_( e );
      fixed.usecapture = useCapture;
      M.DomEvented.super_( that, 'trigger', name, fixed );

    };
    if ( hook && hook.on ) {
      hook.on( dom, name, fireMap[ cuKey ], useCapture );
    } else {
      domAddEventListener_( dom, name, fireMap[ cuKey ], useCapture );
    }
  }
},


removeEventHandle_ = function ( dom, name, callback, useCapture ) {
  var cuKeys, stack, hook,
  eventhandle = this.__eventhandle__,
  fireMap = eventhandle && eventhandle[ name ];
  if ( fireMap ) {
    hook = eventHooks[ name ] || {};
    stack = this.__events__ && this.__events__[ name ];
    cuKeys = useCapture === void 0
        ? [ name + ':false', name + ':true' ]
        : [ name + ':' + useCapture ];
    M.each( cuKeys, function ( cuKey, i ) {
      var
      TrueOrFalse = useCapture === void 0 ? !!i : useCapture,
      ucEvent = M.filter( stack, function ( event ) {
        return event.context === TrueOrFalse;
      } );
      if ( !ucEvent.length ) {
        if ( hook.off ) {
          hook.off( dom, name, fireMap[ cuKey ], TrueOrFalse );
        } else {
          domRemoveEventListener_( dom, name, fireMap[ cuKey ], TrueOrFalse );
        }
        delete fireMap[ cuKey ];
      }
    } );
  }
  if ( fireMap && !fireMap[ name + ':false' ] && !fireMap[ name + ':true' ] ) {
    delete this.__eventhandle__[ name ];
  }
  if ( eventhandle && M.isEmpty( eventhandle ) ) {
    delete this.__eventhandle__;
  }
},


domeventsArgs_ = function ( predicate, obj, events, callback, useCapture ) {

  // jQuery风格
  if ( M.isObject( events ) ) {
    var i, l, k, evtList = M.isArray( events ) ? events : M.keys( events );
    for ( i = 0, l = evtList.length; i < l; i ++ ) {
      domeventsArgs_( predicate, obj, k = evtList[ i ], events[ k ], useCapture );
    }
  }

  // 多个处理
  else if ( events && splitter.test( events ) ) {
    M.each( events.split( splitter ), function ( evt ) {
      evt && predicate( obj, evt, callback, useCapture );
    } );
  }

  // 单个处理
  else {
    predicate( obj, events, callback, useCapture );
  }

},


fixedEvent_ = function ( originalEvent ) {
  var newEvent, newProps, copyProps = baseProps;

  // 不同事件类添加不同的属性
  if ( root.MouseEvent && originalEvent instanceof root.MouseEvent ) {
    copyProps = baseProps.concat( mouseEventProps );
  } else if ( root.FocusEvent && originalEvent instanceof root.FocusEvent ) {
    copyProps = baseProps.concat( focusEventProps );
  } else if ( root.KeyboardEvent && originalEvent instanceof root.KeyboardEvent ) {
    copyProps = baseProps.concat( keyboardEventProps );
  }

  newProps = M.pick( originalEvent, copyProps );
  newProps.originalEvent = originalEvent;
  newEvent = new M.DomEvent( newProps );
  return fixEvent( newEvent, originalEvent );
},


mixEventHook = function ( events, hookFactory ) {
  M.isArray( events ) || ( events = [ events ] );
  var eventhookmap = hookFactory( events );
  eventhookmap && M.each( eventhookmap, function ( hook, event ) {
    eventHooks[ event ] = hook;
  } );
},


fixEvent = function ( event, originalEvent ) {

  var oEvent = originalEvent || event.originalEvent;

  // IE6-8
  // if ( !oEvent.target && oEvent.srcElement ) {
  //   event.target = oEvent.srcElement;
  // }

  // safari中的target可能是文本节点
  if ( oEvent.target.nodeType === 3 ) {
    event.target = oEvent.target.parentNode;
  }

  // IE6-8没有metaKey属性
  // if ( oEvent.metaKey === void 0 && oEvent.ctrlKey !== void 0 ) {
  //   event.metaKey = oEvent.ctrlKey;
  // }

  return event;

};


M.allEvent = allEvent;

var
hookMouseEvent = 'contextmenu click dblclick mousedown mousemove mouseout mouseover mouseup mousewheel'.split( ' ' ),

hookKeybordEvent = 'keydown keypress keyup'.split( ' ' );


mixEventHook( [ 'focusin', 'focusout' ], function ( events ) {

  var
  eventHooksMap= {},
  names = {
    focusin: 'focus',
    focusout: 'blur'
  };

  if ( !M.support.focusin ) {

    M.each( events, function ( eventName ) {

      var
      hook = {};

      hook.fix = function ( event ) {

        // 修正模拟事件的一些Event属性
        event.type = eventName;
        return event;
      };

      hook.on = function ( dom, name, callback, useCapture ) {

        // 在target上绑定执行函数
        if ( useCapture === false ) {
          var
          funcKey = eventName + ':false',
          binders = cache.child( dom );
          if ( !binders.has( funcKey ) ) {
            binders.put( funcKey, function ( e ) {
              var
              target = e.target,
              targetStack = cache.child( target ),
              stack = targetStack.get( funcKey + ':stack' );
              if ( !stack ) {
                var fun = function ( e ) {
                  var i, l;
                  for ( i = 0, l = stack.length; i < l; i ++ ) {
                    stack[ i ].call( this, e );
                  }
                  domRemoveEventListener_( target, e.type, fun, false );
                  targetStack.remove( funcKey + ':stack' );
                  if ( targetStack.length == 0 ) {
                    cache.remove( target );
                  }
                };
                targetStack.put( funcKey + ':stack', stack = [ callback ] );
                domAddEventListener_( target, e.type, fun, false );
              }

              // 不重复添加绑定过的函数
              else if ( !~M.indexOf( stack, callback ) ) {
                stack.unshift( callback );
              }
            } );
            domAddEventListener_( dom, names[ eventName ], binders.get( funcKey ), true );
          }
        }

        // useCapture === true 不做特殊处理
        else {
          domAddEventListener_( dom, names[ eventName ], callback, true );
        }
      };

      hook.off = function ( dom, name, callback, useCapture ) {
        if ( useCapture === false ) {
          var
          funcKey = eventName + ':false',
          binders = cache.get( dom );
          if ( binders && binders.get( funcKey ) ) {
            domRemoveEventListener_( dom, names[ eventName ], binders.get( funcKey ), true );
          }
        } else {
          domRemoveEventListener_( dom, names[ eventName ], callback, true );
        }
      };

      eventHooksMap[ eventName ] = hook;

    } );

    return eventHooksMap;
  }
} );


mixEventHook( [ 'mouseenter', 'mouseleave' ], function ( events ) {

  var
  eventHooksMap= {},
  callbacks = {},
  names = {
    mouseenter: 'mouseover',
    mouseleave: 'mouseout'
  };

  if ( !M.support.mouseenter ) {

    M.each( events, function ( eventName ) {

      var hook = {};

      hook.fix = function ( event ) {

        // 修正模拟事件的一些Event属性
        event.type = eventName;
        return event;
      };

      hook.on = function ( dom, name, callback, useCapture ) {

        var
        key = eventName + ':' + useCapture,
        clb_ = callbacks[ key ];
        if ( !clb_ ) {
          clb_ = function ( event ) {
            var relatedTarget = event.relatedTarget;

            // 通过判断relatedTarget不为绑定事件元素的子元素来实现模拟
            if ( this !== relatedTarget && !M.dom.contains( this, relatedTarget ) ) {

              // 执行真正的事件处理器
              callback.call( this, event );
            }
          };
        }
        domAddEventListener_( dom, names[ eventName ], clb_, useCapture );
      };

      hook.off = function ( dom, name, callback, useCapture ) {
        var
        key = eventName + ':' + useCapture,
        clb_ = callbacks[ key ];
        if ( clb_ ) {
          callbacks[ key ] = null;
          domRemoveEventListener_( dom, names[ eventName ], clb_, useCapture );
        }
      };

      eventHooksMap[ eventName ] = hook;

    } );

    return eventHooksMap;
  }

} );


mixEventHook( hookMouseEvent, function ( events ) {

  var
  eventHooksMap= {},
  doc = document,
  docElem = doc.documentElement,
  body = doc.body;

  M.each( events, function ( eventName ) {

    var hook = {};

    hook.fix = function ( event ) {

      var
      oEvent = event.originalEvent,
      target = oEvent.target;

      if ( event.offsetX === void 0 ) {
        event.offsetX = oEvent.layerX;
        event.offsetY = oEvent.layerY;
      }

      // IE6-8不支持event.pageX和event.pageY
      // if ( event.pageX === void 0 && oEvent.clientX !== void 0 ) {

      //   if ( target.ownerDocument && target.ownerDocument != doc ) {
      //     doc = target.ownerDocument;
      //     docElem = doc.documentElement;
      //     body = doc.body;
      //   }

      //   var
      //   scrollLeft = ( docElem && docElem.scrollLeft || body && body.scrollLeft || 0 ),
      //   scrollTop = ( docElem && docElem.scrollTop || body && body.scrollTop || 0 ),
      //   clientLeft = ( docElem && docElem.clientLeft || body && body.clientLeft || 0 ),
      //   clientTop = ( docElem && docElem.clientTop || body && body.clientTop || 0 );
      //   event.pageX = oEvent.clientX + scrollLeft - clientLeft;
      //   event.pageY = oEvent.clientY + scrollTop - clientTop;
      // }

      // relatedTarget 属性返回触发 mouseover 和 mouseout 的元素
      // IE6-8：mouseover 为 fromElement，mouseout 为 toElement
      // if ( !event.relatedTarget && oEvent.fromElement ) {
      //   event.relatedTarget = oEvent.fromElement === target
      //       ? oEvent.toElement : oEvent.fromElement;
      // }

      if ( M.support.firefox && eventName == 'mousewheel' ) {

        // 修正鼠标滚轮事件，统一使用wheelDelta属性
        if ( 'detail' in oEvent ) {
          event.wheelDelta = - oEvent.detail * 40;
        }

        event.type = eventName;

      }

      // For IE < 9
      // 为 click 事件添加 which 属性，左1 中2 右3
      // IE button的含义：
      // 0：没有键被按下
      // 1：按下左键
      // 2：按下右键
      // 3：左键与右键同时被按下
      // 4：按下中键
      // 5：左键与中键同时被按下
      // 6：中键与右键同时被按下
      // 7：三个键同时被按下
      // if ( eventName == 'click' && !event.which && oEvent.button !== void 0 ) {
      //   event.which = [ 0, 1, 3, 0, 2, 0, 0, 0 ][ oEvent.button ];
      // }

      return event;
    };

    if ( M.support.firefox && eventName == 'mousewheel' ) {

      hook.on = function ( dom, name, callback, useCapture ) {
        domAddEventListener_( dom, 'DOMMouseScroll', callback, useCapture );
      };

      hook.off = function ( dom, name, callback, useCapture ) {
        domRemoveEventListener_( dom, 'DOMMouseScroll', callback, useCapture );
      };

    }

    eventHooksMap[ eventName ] = hook;

  } );

  return eventHooksMap;

} );


mixEventHook( hookKeybordEvent, function ( events ) {

  var eventHooksMap= {};

  M.each( events, function ( eventName ) {

    var hook = {};

    hook.fix = function ( event ) {

      // oldIE
      // keydown:  keyCode = 键码   charCode = undefined
      // keypress: keyCode = 字符码 charCode = undefined
      // keyup:    keyCode = 键码   charCode = undefined

      // Firefox
      // keydown:  keyCode = 键码  charCode = 0
      // keypress: keyCode = 0    charCode = 字符码
      // keyup:    keyCode = 键码  charCode = 0

      // Chrome
      // keydown:  keyCode = 键码   charCode = 0
      // keypress: keyCode = 字符码 charCode = 字符码
      // keyup:    keyCode = 键码   charCode = 0

      // 修正之后
      // keydown:  keyCode = 键码   charCode = 0
      // keypress: keyCode = 字符码 charCode = 字符码
      // keyup:    keyCode = 键码   charCode = 0

      if ( event.type == 'keyup' || event.type == 'keydown' ) {
        event.charCode = 0;
      }

      // 功能键不触发keypress
      if ( event.type == 'keypress' ) {
        event.keyCode = event.keyCode || event.charCode;
        event.charCode = event.keyCode;
      }

      // 返回被按下的键盘按钮键码
      // if ( event.which === void 0 ) {
      //   event.which = event.keyCode;
      // }

      return event;
    };

    eventHooksMap[ eventName ] = hook;

  } );

  return eventHooksMap;

} );


var

eventProto = {

  init: function () {

    M.has( this, 'currentType' ) && ( delete this.currentType );

    // 判定是否阻止了默认事件
    this.isDefaultPrevented = false;

    // 判定是否阻止了冒泡
    this.isPropagationStopped = false;

    // 判定是否阻止了同类型事件的冒泡
    this.isImmediatePropagationStopped = false;
  },

  // 模拟DOM LV2的阻止默认事件的方法
  preventDefault: function () {
    // DOM LV3
    this.isDefaultPrevented = true;
    var e = this.originalEvent;

    if ( e ) {
      // DOM LV2
      if ( e.preventDefault ) {
        e.preventDefault();
      }
      // IE6-8
      else {
        e.returnValue = false;
      }
    }
  },

  // 模拟DOM LV2阻止事件冒泡的方法
  stopPropagation: function () {
    // DOM LV3
    this.isPropagationStopped = true;
    var e = this.originalEvent;

    if ( e ) {
      // DOM LV2
      if ( e.stopPropagation ) {
        e.stopPropagation();
      }

      // IE6-8
      this.cancelBubble = e.cancelBubble = true;
    }
  },

  // 模拟DOM LV3阻止同类型事件冒泡的方法
  stopImmediatePropagation: function () {
    this.isImmediatePropagationStopped = true;
    this.stopPropagation();
  }

},

eventStatic = {};

M.DomEvent = M.createClass( M.Event, eventProto, eventStatic );


var

domEventedProto = {

  init: function ( element ) {
    this.element = element;
    this.__wantEvent__ = false;
    element.__isEvented__ = M.getUid( this );
    cache.child( element ).put( 'evented', this );
  },


  // 先绑定dom再绑定object
  on: function ( events, callback, useCapture ) {
    var predicate = M.bind( addEventHandle_, this );
    useCapture = !isECMAEvent || useCapture === true;
    M.DomEvented.super_( this, 'on', events, callback, useCapture );
    domeventsArgs_( predicate, this.element, events, callback, useCapture );
  },


  // 先解绑object再解绑dom
  off: function ( events, callback, useCapture ) {
    var predicate = M.bind( removeEventHandle_, this );
    if ( !events ) {
      events = M.keys( this.__events__ ).join( ' ' );
    }
    M.DomEvented.super_( this, 'off', events, callback, useCapture );
    domeventsArgs_( predicate, this.element, events, callback, useCapture );
  },


  trigger: function ( names /*, var_args*/ ) {
    var ev, parents, args = slice.call( arguments, 1 );
    if ( M.isObject( names ) && names.type ) {
      ev = names;
      names = [ ev.type ];
    } else if ( M.isString( names ) ) {
      names = names.split( splitter );
    }

    M.each( names, function ( name ) {

      var firedEvent;

      if ( !name ) return;
      parents = M.dom.parents( this.element, true, true );

      // 模拟捕获
      if ( !ev || ev.usecapture == void 0 ) {
        M.each( parents, function ( parent ) {
          if ( parent.__isEvented__ && !this.isPropagationStopped ) {
            var evt, obj = M.Evented.getObject( parent.__isEvented__ );
            if ( obj ) {
              evt = new M.DomEvent( { type: name, target: this.element, usecapture: true } );
              M.DomEvented.super_.apply( null, [ obj, 'trigger', name, evt ].concat( args ) );
            }
          }
        }, this );
      }

      if ( firedEvent = ev ) {
        firedEvent = new M.DomEvent( { type: name, target: this.element, fired: true } );
      }
      M.DomEvented.super_.apply( null, [ this, 'trigger', name, firedEvent ].concat( args ) );

      // 模拟冒泡
      if ( !ev || ev.usecapture == void 0 ) {
        M.each( parents.reverse(), function ( parent ) {
          if ( parent.__isEvented__ ) {
            var evt, obj = M.Evented.getObject( parent.__isEvented__ );
            if ( obj ) {
              evt = new M.DomEvent( { type: name, target: this.element, usecapture: false } );
              M.DomEvented.super_.apply( null, [ obj, 'trigger', name, evt ].concat( args ) );
            }
          }
        }, this );
      }

    }, this );
  }
},

domEventedStatic = {};

M.DomEvented = M.createClass( M.Evented, domEventedProto, domEventedStatic );

} ();

if ( typeof exports !== 'undefined' ) {
  if ( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = M;
  }
  exports.mace = M;
} else {
  root.mace = M;
}

}.call( this || window ) );
