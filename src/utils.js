
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
