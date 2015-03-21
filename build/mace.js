
'use strict';

( function () {

var utils,
root = this,
mace = {};

mace.version = '0.0.1';

var PROTOTYPE_FIELDS_,
arrPt = Array.prototype,
objPt = Object.prototype,
funPt = Function.prototype;

mace.global = window;

// 空函数
mace.noop = function () {};


// 获取值的数据类型
mace.typeOf = function ( value ) {

  var s = typeof value,
  className = objPt.toString.call( value );

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
mace.isDef = function( val ) {
  return val !== void 0;
};


mace.isNull = function ( val ) {
  return val === null;
};


mace.isDefAndNotNull = function ( val ) {
  // Note that undefined == null.
  return val != null;
};


mace.isObject = function ( val ) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
};


mace.isDateLike = function ( val ) {
  return mace.isObject( val ) && typeof val.getFullYear == 'function';
};


mace.isBoolean = function ( val ) {
  return typeof val === 'boolean';
};


mace.isNumber = function ( val ) {
  return typeof val === 'number';
};


mace.isNumberAndNotNaN = function ( val ) {
  return typeof val === 'number' && val == val;
};


mace.isFunction = function ( val ) {
  return mace.typeOf( val ) == 'function';
};


mace.isString = function ( val ) {
  return mace.typeOf( val ) == 'string';
};


mace.isArray = function ( val ) {
  return mace.typeOf( val ) == 'array';
};


mace.isArrayLike = function ( val ) {
  var type = mace.typeOf( val );
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


// bind函数
mace.bindNative_ = function ( fn, selfObj, var_args ) {
  return fn.call.apply( fn.bind, arguments );
};


mace.bindJs_ = function ( fn, selfObj, var_args ) {
  if ( !fn ) {
    throw new Error();
  }

  if ( arguments.length > 2 ) {
    var boundArgs = arrPt.slice.call( arguments, 2 );
    return function () {
      // Prepend the bound arguments to the current arguments.
      var newArgs = arrPt.slice.call( arguments );
      arrPt.unshift.apply( newArgs, boundArgs );
      return fn.apply( selfObj, newArgs );
    };
  }
  else {
    return function () {
      return fn.apply( selfObj, arguments );
    };
  }
};


mace.bind = function ( fn, selfObj, var_args ) {
  // TODO(nicksantos): narrow the type signature.
  if ( funPt.bind &&
      funPt.bind.toString().indexOf( 'native code' ) != -1 ) {
    mace.bind = mace.bindNative_;
  }
  else {
    mace.bind = mace.bindJs_;
  }
  return mace.bind.apply( null, arguments );
};


mace.partial = function ( fn, var_args ) {
  var args = arrPt.slice.call( arguments, 1 );
  return function () {
    var newArgs = args.slice();
    newArgs.push.apply( newArgs, arguments );
    return fn.apply( this, newArgs );
  };
};


// 添加对象唯一标示UID
mace.UID_PROPERTY_ = 'uid_' + ( ( Math.random() * 1e9 ) >>> 0 );


mace.uidCounter_ = 0;


mace.getUid = function ( obj ) {
  return obj[ mace.UID_PROPERTY_ ] ||
  ( obj[ mace.UID_PROPERTY_ ] = ++ mace.uidCounter_ );
};


mace.hasUid = function ( obj ) {
  return !!obj[ mace.UID_PROPERTY_ ];
};


mace.removeUid = function ( obj ) {
  if ( 'removeAttribute' in obj ) {
    obj.removeAttribute( mace.UID_PROPERTY_ );
  }
  try {
    delete obj[ mace.UID_PROPERTY_ ];
  } catch ( ex ) {}
};


mace.cloneObject = function ( obj ) {
  var type = mace.typeOf( obj );
  if ( type == 'object' || type == 'array' ) {
    if ( obj.clone ) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for ( var key in obj ) {
      clone[ key ] = mace.cloneObject( obj[ key ] );
    }
    return clone;
  }
  return obj;
};


mace.mixin = function ( target, source ) {
  for ( var x in source ) {
    target[ x ] = source[ x ];
  }
};


PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


mace.extend = function( target, var_args ) {
  var i, j, l, key, source;
  for ( i = 1, l = arguments.length; i < l; i ++ ) {
    source = arguments[ i ];
    for ( key in source ) {
      target[ key ] = source[ key ];
    }

    for ( j = 0; j < PROTOTYPE_FIELDS_.length; j ++ ) {
      key = PROTOTYPE_FIELDS_[ j ];
      if ( objPt.hasOwnProperty.call( source, key ) ) {
        target[ key ] = source[ key ];
      }
    }
  }
};


mace.now =  Date.now || function () {
  return + new Date();
};


/**
 * Evals JavaScript in the global scope.  In IE this uses execScript, other
 * browsers use mace.global.eval. If mace.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
mace.globalEval = function ( script ) {
  if ( mace.global.execScript ) {
    mace.global.execScript( script, 'JavaScript' );
  }
  else if ( mace.global.eval ) {
    // Test to see if eval works
    // if ( mace.evalWorksForGlobals_ == null ) {
    //   mace.global.eval( 'var _et_ = 1;' );
    //   if ( typeof mace.global[ '_et_' ] != 'undefined' ) {
    //     delete mace.global[ '_et_' ];
    //     mace.evalWorksForGlobals_ = true;
    //   }
    //   else {
    //     mace.evalWorksForGlobals_ = false;
    //   }
    // }

    if ( mace.evalWorksForGlobals_ ) {
      mace.global.eval( script );
    }
    else {
      var
      doc = mace.global.document,
      scriptElt = doc.createElement( 'script' );
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;

      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild( doc.createTextNode( script ) );
      doc.body.appendChild( scriptElt );
      doc.body.removeChild( scriptElt );
    }
  }
  else {
    throw Error( 'mace.globalEval not available' );
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to mace.globalEval (which
 * empirically tests whether eval works for globals). @see mace.globalEval
 * @type {?boolean}
 * @private
 */
mace.evalWorksForGlobals_ = ( function () { // null
  if ( mace.global.eval ) {
    mace.global.eval( 'var _evtst_ = 1' );
    if ( mace.global[ '_evtst_' ] === 1 ) {
      delete mace.global[ '_evtst_' ];
      return true;
    }
    return false;
  } else {
    return null;
  }
} () );


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { };
 *
 * function ChildClass(a, b, c) {
 *   ChildClass.base(this, 'constructor', a, b);
 * }
 * mace.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // This works.
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
mace.inherits = function ( childCtor, parentCtor ) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  /** @override */
  childCtor.prototype.constructor = childCtor;

  childCtor.base = function ( me, methodName, var_args ) {
    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var i, l, args = [];
    for ( i = 2, l = arguments.length; i < l; i ++ ) {
      args[ i - 2 ] = arguments[ i ];
    }
    return parentCtor.prototype[ methodName ].apply( me, args );
  };
};



//==============================================================================
// mace.defineClass implementation
//==============================================================================


/**
 * Creates a restricted form of a Closure "class":
 *   - from the compiler's perspective, the instance returned from the
 *     constructor is sealed (no new properties may be added).  This enables
 *     better checks.
 *   - the compiler will rewrite this definition to a form that is optimal
 *     for type checking and optimization (initially this will be a more
 *     traditional form).
 *
 * @param {Function} superClass The superclass, Object or null.
 * @param {mace.defineClass.ClassDescriptor} def
 *     An object literal describing the
 *     the class.  It may have the following properties:
 *     "constructor": the constructor function
 *     "statics": an object literal containing methods to add to the constructor
 *        as "static" methods or a function that will receive the constructor
 *        function as its only parameter to which static properties can
 *        be added.
 *     all other properties are added to the prototype.
 * @return {!Function} The class constructor.
 */
mace.defineClass = function ( superClass, def ) {
  // TODO(johnlenz): consider making the superClass an optional parameter.
  var
  constructor = def.constructor,
  statics = def.statics;
  // Wrap the constructor prior to setting up the prototype and static methods.
  if ( !constructor || constructor == objPt.constructor ) {
    constructor = function () {
      throw Error( 'cannot instantiate an interface (no constructor defined).' );
    };
  }

  var cls = mace.defineClass.createSealingConstructor_( constructor, superClass );
  if ( superClass ) {
    mace.inherits( cls, superClass );
  }

  // Remove all the properties that should not be copied to the prototype.
  delete def.constructor;
  delete def.statics;

  mace.defineClass.applyProperties_( cls.prototype, def );
  if ( statics != null ) {
    if ( statics instanceof Function ) {
      statics( cls );
    } else {
      mace.defineClass.applyProperties_( cls, statics );
    }
  }

  return cls;
};


/**
 * @typedef {
 *     !Object|
 *     {constructor:!Function}|
 *     {constructor:!Function, statics:(Object|function(Function):void)}}
 * @suppress {missingProvide}
 */
// mace.defineClass.ClassDescriptor;


/**
 * @define {boolean} Whether the instances returned by
 * mace.defineClass should be sealed when possible.
 */
mace.defineClass.SEAL_CLASS_INSTANCES = mace.debug;


/**
 * If mace.defineClass.SEAL_CLASS_INSTANCES is enabled and Object.seal is
 * defined, this function will wrap the constructor in a function that seals the
 * results of the provided constructor function.
 *
 * @param {!Function} ctr The constructor whose results maybe be sealed.
 * @param {Function} superClass The superclass constructor.
 * @return {!Function} The replacement constructor.
 * @private
 */
mace.defineClass.createSealingConstructor_ = function ( ctr, superClass ) {
  if ( mace.defineClass.SEAL_CLASS_INSTANCES &&
      Object.seal instanceof Function ) {
      // Don't seal subclasses of unsealable-tagged legacy classes.
    if ( superClass && superClass.prototype &&
      superClass.prototype[ mace.UNSEALABLE_CONSTRUCTOR_PROPERTY_ ] ) {
      return ctr;
    }
    /**
     * @this {*}
     * @return {?}
     */
    var wrappedCtr = function () {
      // Don't seal an instance of a subclass when it calls the constructor of
      // its super class as there is most likely still setup to do.
      var instance = ctr.apply( this, arguments ) || this;
      instance[ mace.UID_PROPERTY_ ] = instance[ mace.UID_PROPERTY_ ];
      if ( this.constructor === wrappedCtr ) {
        Object.seal( instance );
      }
      return instance;
    };
    return wrappedCtr;
  }
  return ctr;
};


// TODO(johnlenz): share this function with the mace.object
/**
 * @param {!Object} target The object to add properties to.
 * @param {!Object} source The object to copy properites fromace.
 * @private
 */
mace.defineClass.applyProperties_ = function ( target, source ) {
  // TODO(johnlenz): update this to support ES5 getters/setters

  var i, l, key;
  for ( key in source ) {
    if ( objPt.hasOwnProperty.call( source, key ) ) {
      target[ key ] = source[ key ];
    }
  }

  for ( i = 0, l = PROTOTYPE_FIELDS_.length; i < l; i ++ ) {
    key = PROTOTYPE_FIELDS_[ i ];
    if ( objPt.hasOwnProperty.call( source, key ) ) {
      target[ key ] = source[ key ];
    }
  }
};


/**
 * Sealing classes breaks the older idiom of assigning properties on the
 * prototype rather than in the constructor.  As such, mace.defineClass
 * must not seal subclasses of these old-style classes until they are fixed.
 * Until then, this marks a class as "broken", instructing defineClass
 * not to seal subclasses.
 * @param {!Function} ctr The legacy constructor to tag as unsealable.
 */
mace.tagUnsealableClass = function ( ctr ) {
  if ( mace.defineClass.SEAL_CLASS_INSTANCES ) {
    ctr.prototype[ mace.UNSEALABLE_CONSTRUCTOR_PROPERTY_ ] = true;
  }
};


/**
 * Name for unsealable tag property.
 * @const @private {string}
 */
mace.UNSEALABLE_CONSTRUCTOR_PROPERTY_ = 'defineClass_legacy_unsealable';


/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in mace.disposable.IDisposable).
 * @constructor
 * @implements {mace.disposable.IDisposable}
 */
mace.Disposable = function () {
	if ( mace.Disposable.MONITORING_MODE != mace.Disposable.MonitoringMode.OFF ) {
		if ( mace.Disposable.INCLUDE_STACK_ON_CREATION ) {
			this.creationStack = new Error().stack;
		}
		mace.Disposable.instances_[ mace.getUid( this ) ] = this;
	}
	// Support sealing
	this.disposed_ = this.disposed_;
	this.onDisposeCallbacks_ = this.onDisposeCallbacks_;
};


/**
 * @enum {number} Different monitoring modes for Disposable.
 */
mace.Disposable.MonitoringMode = {
	/**
	 * No monitoring.
	 */
	OFF: 0,
	/**
	 * Creating and disposing the mace.Disposable instances is monitored. All
	 * disposable objects need to call the {@code mace.Disposable} base
	 * constructor. The PERMANENT mode must be switched on before creating any
	 * mace.Disposable instances.
	 */
	PERMANENT: 1,
	/**
	 * INTERACTIVE mode can be switched on and off on the fly without producing
	 * errors. It also doesn't warn if the disposable objects don't call the
	 * {@code mace.Disposable} base constructor.
	 */
	INTERACTIVE: 2
};


/**
 * @define {number} The monitoring mode of the mace.Disposable
 *     instances. Default is OFF. Switching on the monitoring is only
 *     recommended for debugging because it has a significant impact on
 *     performance and memory usage. If switched off, the monitoring code
 *     compiles down to 0 bytes.
 */
mace.Disposable.MONITORING_MODE = 0;
// mace.define('mace.Disposable.MONITORING_MODE', 0);


/**
 * @define {boolean} Whether to attach creation stack to each created disposable
 *     instance; This is only relevant for when MonitoringMode != OFF.
 */
mace.Disposable.INCLUDE_STACK_ON_CREATION = true;
// mace.define('mace.Disposable.INCLUDE_STACK_ON_CREATION', true);


/**
 * Maps the unique ID of every undisposed {@code mace.Disposable} object to
 * the object itself.
 * @type {!Object<number, !mace.Disposable>}
 * @private
 */
mace.Disposable.instances_ = {};


/**
 * @return {!Array<!mace.Disposable>} All {@code mace.Disposable} objects that
 *     haven't been disposed of.
 */
mace.Disposable.getUndisposedObjects = function () {
	var ret = [];
	for ( var id in mace.Disposable.instances_ ) {
		if ( mace.Disposable.instances_.hasOwnProperty( id ) ) {
			ret.push( mace.Disposable.instances_[ Number( id ) ] );
		}
	}
	return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of themace.
 */
mace.Disposable.clearUndisposedObjects = function () {
	mace.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
mace.Disposable.prototype.disposed_ = false;


/**
 * Callbacks to invoke when this object is disposed.
 * @type {Array<!Function>}
 * @private
 */
mace.Disposable.prototype.onDisposeCallbacks_;


/**
 * If monitoring the mace.Disposable instances is enabled, stores the creation
 * stack trace of the Disposable instance.
 * @const {string}
 */
mace.Disposable.prototype.creationStack;


/**
 * @return {boolean} Whether the object has been disposed of.
 * @override
 */
mace.Disposable.prototype.isDisposed = function () {
	return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
mace.Disposable.prototype.getDisposed = mace.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code mace.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 * @override
 */
mace.Disposable.prototype.dispose = function () {
	if ( !this.disposed_ ) {
		// Set disposed_ to true first, in case during the chain of disposal this
		// gets disposed recursively.
		this.disposed_ = true;
		this.disposeInternal();
		if ( mace.Disposable.MONITORING_MODE != mace.Disposable.MonitoringMode.OFF ) {
			var uid = mace.getUid( this );
			if ( mace.Disposable.MONITORING_MODE ==
				mace.Disposable.MonitoringMode.PERMANENT &&
				!mace.Disposable.instances_.hasOwnProperty( uid ) ) {
				throw Error( this + ' did not call the mace.Disposable base ' +
					'constructor or was disposed of after a clearUndisposedObjects ' +
					'call' );
			}
			delete mace.Disposable.instances_[ uid ];
		}
	}
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {mace.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
mace.Disposable.prototype.registerDisposable = function ( disposable ) {
	this.addOnDisposeCallback( mace.partial( mace.dispose, disposable ) );
};


/**
 * Invokes a callback function when this object is disposed. Callbacks are
 * invoked in the order in which they were added.
 * @param {function(this:T):?} callback The callback function.
 * @param {T=} opt_scope An optional scope to call the callback in.
 * @template T
 */
mace.Disposable.prototype.addOnDisposeCallback = function ( callback, opt_scope ) {
	if ( !this.onDisposeCallbacks_ ) {
		this.onDisposeCallbacks_ = [];
	}
	this.onDisposeCallbacks_.push(
		mace.isDef( opt_scope ) ? mace.bind( callback, opt_scope ) : callback );
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code mace.Disposable} should
 * override this method.
 * Not reentrant. To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used.
 * For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     mypackage.MyClass.base(this, 'constructor');
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   mace.inherits(mypackage.MyClass, mace.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     // Dispose logic specific to MyClass.
 *     ...
 *     // Call superclass's disposeInternal at the end of the subclass's, like
 *     // in C++, to avoid hard-to-catch issues.
 *     mypackage.MyClass.base(this, 'disposeInternal');
 *   };
 * </pre>
 * @protected
 */
mace.Disposable.prototype.disposeInternal = function () {
	if ( this.onDisposeCallbacks_ ) {
		while ( this.onDisposeCallbacks_.length ) {
			this.onDisposeCallbacks_.shift()();
		}
	}
};


/**
 * Returns True if we can verify the object is disposed.
 * Calls {@code isDisposed} on the argument if it supports it.  If obj
 * is not an object with an isDisposed() method, return false.
 * @param {*} obj The object to investigate.
 * @return {boolean} True if we can verify the object is disposed.
 */
mace.Disposable.isDisposed = function ( obj ) {
	if ( obj && typeof obj.isDisposed == 'function' ) {
		return obj.isDisposed();
	}
	return false;
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
mace.dispose = function ( obj ) {
	if ( obj && typeof obj.dispose == 'function' ) {
		obj.dispose();
	}
};


/**
 * Calls {@code dispose} on each member of the list that supports it. (If the
 * member is an ArrayLike, then {@code mace.disposeAll()} will be called
 * recursively on each of its members.) If the member is not an object with a
 * {@code dispose()} method, then it is ignored.
 * @param {...*} var_args The list.
 */
mace.disposeAll = function ( var_args ) {
	for ( var i = 0, len = arguments.length; i < len; ++ i ) {
		var disposable = arguments[ i ];
		if ( mace.isArrayLike( disposable ) ) {
			mace.disposeAll.apply( null, disposable );
		} else {
			mace.dispose( disposable );
		}
	}
};


mace.Base = mace.defineClass( mace.Disposable, {

  // 构造函数
  constructor: function () {
    mace.Base.base( this, 'constructor' );
  },

  // 类属性
  // statics: {}

  // 其他是原型属性
  destroy: function () {
    mace.Base.base( this, 'dispose' );
  }

} );


mace.makeClass = function ( proto, statics ) {

  proto = proto || {};

  var parentClass = proto.parentClass || mace.Base,
  constructor = proto.constructor;

  proto.constructor = function () {
    parentClass.apply( this, arguments );
    if ( constructor ) {
      constructor.apply( this, arguments );
    }
  };

  proto.statics = proto.statics || statics;

  if ( proto.parentClass ) delete proto.parentClass;

  return mace.defineClass( parentClass, proto );
};

if ( typeof exports !== 'undefined' ) {
  if ( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = mace;
  }
  exports.mace = mace;
} else {
  root.mace = mace;
}

}.call( this ) );