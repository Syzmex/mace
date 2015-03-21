
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