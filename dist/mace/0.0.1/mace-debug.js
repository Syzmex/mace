define("mace/0.0.1/mace-debug", [], function(require, exports, module) {
  var mace = require("mace/0.0.1/build/mace-debug");
  module.exports = mace;
});
define("mace/0.0.1/build/mace-debug", [], function(require, exports, module) {
  'use strict';
  (function() {
    var utils,
      root = this,
      mace = {};
    mace.version = '0.0.1';
    var PROTOTYPE_FIELDS_,
      arrPt = Array.prototype,
      objPt = Object.prototype,
      funPt = Function.prototype;
    // 空函数
    mace.noop = function() {};
    // 获取值的数据类型
    mace.typeOf = function(value) {
      var s = typeof value,
        className = objPt.toString.call(value);
      if (s == 'object') {
        if (value) {
          if (value instanceof Array) {
            return 'array';
          }
          // 因为 typeof new String( '' ) => 'object'
          else if (value instanceof String) {
            return 'string';
          } else if (value instanceof Object) {
            return s;
          }
          if (className == '[object Window]') {
            return 'object';
          }
          if (className == '[object Array]' || typeof value.length == 'number' && typeof value.splice != 'undefined' && typeof value.propertyIsEnumerable != 'undefined' && !value.propertyIsEnumerable('splice')) {
            return 'array';
          }
          if (className == '[object Function]' || typeof value.call != 'undefined' && typeof value.propertyIsEnumerable != 'undefined' && !value.propertyIsEnumerable('call')) {
            return 'function';
          }
        } else {
          return 'null';
        }
      } else if (s == 'function' && typeof value.call == 'undefined') {
        return 'object';
      }
      return s;
    };
    // 判断是否定义过，未定义则等于undefined
    mace.isDef = function(val) {
      return val !== void 0;
    };
    mace.isNull = function(val) {
      return val === null;
    };
    mace.isDefAndNotNull = function(val) {
      // Note that undefined == null.
      return val != null;
    };
    mace.isObject = function(val) {
      var type = typeof val;
      return type == 'object' && val != null || type == 'function';
    };
    mace.isDateLike = function(val) {
      return mace.isObject(val) && typeof val.getFullYear == 'function';
    };
    mace.isBoolean = function(val) {
      return typeof val === 'boolean';
    };
    mace.isNumber = function(val) {
      return typeof val === 'number';
    };
    mace.isNumberAndNotNaN = function(val) {
      return typeof val === 'number' && val == val;
    };
    mace.isFunction = function(val) {
      return mace.typeOf(val) == 'function';
    };
    mace.isString = function(val) {
      return mace.typeOf(val) == 'string';
    };
    mace.isArray = function(val) {
      return mace.typeOf(val) == 'array';
    };
    mace.isArrayLike = function(val) {
      var type = mace.typeOf(val);
      return type == 'array' || type == 'object' && typeof val.length == 'number';
    };
    // bind函数
    mace.bindNative_ = function(fn, selfObj, var_args) {
      return fn.call.apply(fn.bind, arguments);
    };
    mace.bindJs_ = function(fn, selfObj, var_args) {
      if (!fn) {
        throw new Error();
      }
      if (arguments.length > 2) {
        var boundArgs = arrPt.slice.call(arguments, 2);
        return function() {
          // Prepend the bound arguments to the current arguments.
          var newArgs = arrPt.slice.call(arguments);
          arrPt.unshift.apply(newArgs, boundArgs);
          return fn.apply(selfObj, newArgs);
        };
      } else {
        return function() {
          return fn.apply(selfObj, arguments);
        };
      }
    };
    mace.bind = function(fn, selfObj, var_args) {
      // TODO(nicksantos): narrow the type signature.
      if (funPt.bind && funPt.bind.toString().indexOf('native code') != -1) {
        mace.bind = mace.bindNative_;
      } else {
        mace.bind = mace.bindJs_;
      }
      return mace.bind.apply(null, arguments);
    };
    mace.partial = function(fn, var_args) {
      var args = arrPt.slice.call(arguments, 1);
      return function() {
        var newArgs = args.slice();
        newArgs.push.apply(newArgs, arguments);
        return fn.apply(this, newArgs);
      };
    };
    // 添加对象唯一标示UID
    mace.UID_PROPERTY_ = 'uid_' + ((Math.random() * 1e9) >>> 0);
    mace.uidCounter_ = 0;
    mace.getUid = function(obj) {
      return obj[mace.UID_PROPERTY_] || (obj[mace.UID_PROPERTY_] = ++mace.uidCounter_);
    };
    mace.hasUid = function(obj) {
      return !!obj[mace.UID_PROPERTY_];
    };
    mace.removeUid = function(obj) {
      if ('removeAttribute' in obj) {
        obj.removeAttribute(mace.UID_PROPERTY_);
      }
      try {
        delete obj[mace.UID_PROPERTY_];
      } catch (ex) {}
    };
    mace.cloneObject = function(obj) {
      var type = mace.typeOf(obj);
      if (type == 'object' || type == 'array') {
        if (obj.clone) {
          return obj.clone();
        }
        var clone = type == 'array' ? [] : {};
        for (var key in obj) {
          clone[key] = mace.cloneObject(obj[key]);
        }
        return clone;
      }
      return obj;
    };
    mace.mixin = function(target, source) {
      for (var x in source) {
        target[x] = source[x];
      }
    };
    PROTOTYPE_FIELDS_ = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];
    mace.extend = function(target, var_args) {
      var i, j, l, key, source;
      for (i = 1, l = arguments.length; i < l; i++) {
        source = arguments[i];
        for (key in source) {
          target[key] = source[key];
        }
        for (j = 0; j < PROTOTYPE_FIELDS_.length; j++) {
          key = PROTOTYPE_FIELDS_[j];
          if (objPt.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    };
    mace.each = function(obj, f, opt_obj) {
      if (mace.isArray(obj) || mace.isArrayLike(obj)) {
        if (arrPt.forEach) {
          arrPt.forEach.call(obj, f, opt_obj);
        } else {
          var i, l,
            arr2 = mace.isString(obj) ? obj.split('') : obj;
          for (i = 0, l = obj.length; i < l; i++) {
            if (i in arr2) {
              f.call(opt_obj, arr2[i], i, obj);
            }
          }
        }
      } else {
        for (var key in obj) {
          f.call(opt_obj, obj[key], key, obj);
        }
      }
    };
    mace.now = Date.now || function() {
      return +new Date();
    };
    /**
     * Indicates whether or not we can call 'eval' directly to eval code in the
     * global scope. Set to a Boolean by the first call to mace.globalEval (which
     * empirically tests whether eval works for globals). @see mace.globalEval
     * @type {?boolean}
     * @private
     */
    var evalWorks_ = (function() {
      if (root.eval || eval) {
        eval('var _evtst_ = 1');
        if (root['_evtst_'] === 1) {
          delete root['_evtst_'];
          return true;
        }
      }
      return false;
    }());
    /**
     * Evals JavaScript in the global scope.  In IE this uses execScript, other
     * browsers use mace.global.eval. If mace.global.eval does not evaluate in the
     * global scope (for example, in Safari), appends a script tag instead.
     * Throws an exception if neither execScript or eval is defined.
     * @param {string} script JavaScript string.
     */
    mace.globalEval = function(script) {
      var className = objPt.toString.call(root);
      if (className == '[object Window]') {
        if (root.execScript) {
          root.execScript(script, 'JavaScript');
        } else if (root.eval) {
          if (evalWorks_) {
            root.eval(script);
          } else {
            var doc = root.document,
              scriptElt = doc.createElement('script');
            scriptElt.type = 'text/javascript';
            scriptElt.defer = false;
            // Note(user): can't use .innerHTML since "t('<test>')" will fail and
            // .text doesn't work in Safari 2.  Therefore we append a text node.
            scriptElt.appendChild(doc.createTextNode(script));
            doc.body.appendChild(scriptElt);
            doc.body.removeChild(scriptElt);
          }
        }
      } else if (eval) {
        eval(script);
      } else {
        throw Error('Eval not available');
      }
    };
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
    mace.inherits = function(childCtor, parentCtor) {
      /** @constructor */
      function tempCtor() {};
      tempCtor.prototype = parentCtor.prototype;
      childCtor.superClass_ = parentCtor.prototype;
      childCtor.prototype = new tempCtor();
      /** @override */
      childCtor.prototype.constructor = childCtor;
      childCtor.base = function(me, methodName, var_args) {
        // Copying using loop to avoid deop due to passing arguments object to
        // function. This is faster in many JS engines as of late 2014.
        var i, l, args = [];
        for (i = 2, l = arguments.length; i < l; i++) {
          args[i - 2] = arguments[i];
        }
        return parentCtor.prototype[methodName].apply(me, args);
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
    mace.defineClass = function(superClass, def) {
      // TODO(johnlenz): consider making the superClass an optional parameter.
      var constructor = def.constructor,
        statics = def.statics;
      // Wrap the constructor prior to setting up the prototype and static methods.
      if (!constructor || constructor == objPt.constructor) {
        constructor = function() {
          throw Error('cannot instantiate an interface (no constructor defined).');
        };
      }
      var cls = mace.defineClass.createSealingConstructor_(constructor, superClass);
      if (superClass) {
        mace.inherits(cls, superClass);
      }
      // Remove all the properties that should not be copied to the prototype.
      delete def.constructor;
      delete def.statics;
      mace.defineClass.applyProperties_(cls.prototype, def);
      if (statics != null) {
        if (statics instanceof Function) {
          statics(cls);
        } else {
          mace.defineClass.applyProperties_(cls, statics);
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
    mace.defineClass.createSealingConstructor_ = function(ctr, superClass) {
      if (mace.defineClass.SEAL_CLASS_INSTANCES && Object.seal instanceof Function) {
        // Don't seal subclasses of unsealable-tagged legacy classes.
        if (superClass && superClass.prototype && superClass.prototype[mace.UNSEALABLE_CONSTRUCTOR_PROPERTY_]) {
          return ctr;
        }
        /**
         * @this {*}
         * @return {?}
         */
        var wrappedCtr = function() {
          // Don't seal an instance of a subclass when it calls the constructor of
          // its super class as there is most likely still setup to do.
          var instance = ctr.apply(this, arguments) || this;
          instance[mace.UID_PROPERTY_] = instance[mace.UID_PROPERTY_];
          if (this.constructor === wrappedCtr) {
            Object.seal(instance);
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
    mace.defineClass.applyProperties_ = function(target, source) {
      // TODO(johnlenz): update this to support ES5 getters/setters
      var i, l, key;
      for (key in source) {
        if (objPt.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
      for (i = 0, l = PROTOTYPE_FIELDS_.length; i < l; i++) {
        key = PROTOTYPE_FIELDS_[i];
        if (objPt.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
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
    mace.tagUnsealableClass = function(ctr) {
      if (mace.defineClass.SEAL_CLASS_INSTANCES) {
        ctr.prototype[mace.UNSEALABLE_CONSTRUCTOR_PROPERTY_] = true;
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
    mace.Disposable = function() {
      if (mace.Disposable.MONITORING_MODE != mace.Disposable.MonitoringMode.OFF) {
        if (mace.Disposable.INCLUDE_STACK_ON_CREATION) {
          this.creationStack = new Error().stack;
        }
        mace.Disposable.instances_[mace.getUid(this)] = this;
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
    mace.Disposable.getUndisposedObjects = function() {
      var ret = [];
      for (var id in mace.Disposable.instances_) {
        if (mace.Disposable.instances_.hasOwnProperty(id)) {
          ret.push(mace.Disposable.instances_[Number(id)]);
        }
      }
      return ret;
    };
    /**
     * Clears the registry of undisposed objects but doesn't dispose of themace.
     */
    mace.Disposable.clearUndisposedObjects = function() {
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
    mace.Disposable.prototype.isDisposed = function() {
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
    mace.Disposable.prototype.dispose = function() {
      if (!this.disposed_) {
        // Set disposed_ to true first, in case during the chain of disposal this
        // gets disposed recursively.
        this.disposed_ = true;
        this.disposeInternal();
        if (mace.Disposable.MONITORING_MODE != mace.Disposable.MonitoringMode.OFF) {
          var uid = mace.getUid(this);
          if (mace.Disposable.MONITORING_MODE == mace.Disposable.MonitoringMode.PERMANENT && !mace.Disposable.instances_.hasOwnProperty(uid)) {
            throw Error(this + ' did not call the mace.Disposable base ' + 'constructor or was disposed of after a clearUndisposedObjects ' + 'call');
          }
          delete mace.Disposable.instances_[uid];
        }
      }
    };
    /**
     * Associates a disposable object with this object so that they will be disposed
     * together.
     * @param {mace.disposable.IDisposable} disposable that will be disposed when
     *     this object is disposed.
     */
    mace.Disposable.prototype.registerDisposable = function(disposable) {
      this.addOnDisposeCallback(mace.partial(mace.dispose, disposable));
    };
    /**
     * Invokes a callback function when this object is disposed. Callbacks are
     * invoked in the order in which they were added.
     * @param {function(this:T):?} callback The callback function.
     * @param {T=} opt_scope An optional scope to call the callback in.
     * @template T
     */
    mace.Disposable.prototype.addOnDisposeCallback = function(callback, opt_scope) {
      if (!this.onDisposeCallbacks_) {
        this.onDisposeCallbacks_ = [];
      }
      this.onDisposeCallbacks_.push(mace.isDef(opt_scope) ? mace.bind(callback, opt_scope) : callback);
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
    mace.Disposable.prototype.disposeInternal = function() {
      if (this.onDisposeCallbacks_) {
        while (this.onDisposeCallbacks_.length) {
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
    mace.Disposable.isDisposed = function(obj) {
      if (obj && typeof obj.isDisposed == 'function') {
        return obj.isDisposed();
      }
      return false;
    };
    /**
     * Calls {@code dispose} on the argument if it supports it. If obj is not an
     *     object with a dispose() method, this is a no-op.
     * @param {*} obj The object to dispose of.
     */
    mace.dispose = function(obj) {
      if (obj && typeof obj.dispose == 'function') {
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
    mace.disposeAll = function(var_args) {
      for (var i = 0, len = arguments.length; i < len; ++i) {
        var disposable = arguments[i];
        if (mace.isArrayLike(disposable)) {
          mace.disposeAll.apply(null, disposable);
        } else {
          mace.dispose(disposable);
        }
      }
    };
    mace.Base = mace.defineClass(mace.Disposable, {
      // 构造函数
      constructor: function() {
        mace.Base.base(this, 'constructor');
      },
      // 类属性
      // statics: {}
      // 其他是原型属性
      destroy: function() {
        mace.Base.base(this, 'dispose');
      }
    });
    mace.makeClass = function(proto) {
      proto = proto || {};
      var cls, initiation = proto.initiation,
        parentClass = proto.parentClass || mace.Base,
        implement = proto.implement;
      if (!implement instanceof mace.makeInterface.BASE) {
        throw Error('传入接口错误：并非接口');
      }
      mace.each(implement, function(value, key, implement) {
        if (!~PROTOTYPE_FIELDS_.indexOf(key)) {
          if ((key in implement) && !(key in proto)) {
            throw Error('接口函数[' + key + ']没有实现');
          }
        }
      });
      if (!objPt.hasOwnProperty.call(proto, 'constructor')) {
        proto.constructor = function() {
          parentClass.apply(this, arguments);
          if (initiation) {
            initiation.apply(this, arguments);
          }
        };
      }
      if (proto.implement) delete proto.implement;
      if (proto.parentClass) delete proto.parentClass;
      cls = mace.defineClass(parentClass, proto);
      mace.each(cls.prototype, function(value, key, proto) {
        if (/^___[\s\S]*___$/.test(key) && objPt.hasOwnProperty.call(proto, key)) {
          proto.__defineSetter__(key, function() {
            throw Error('属性[' + key + ']不可重写');
          });
          proto.__defineGetter__(key, function() {
            return value;
          });
        }
      });
      return cls
    };
    /**
     * 创建接口
     * @param  {object} proto { methods, attr... } methods是函数名列表 attr是非函数属性
     * @return {interface}
     */
    mace.makeInterface = function(proto) {
      if (mace.isArray(proto)) {
        proto = {
          methods: proto
        }
      }
      if (!proto || !mace.isArray(proto.methods) || proto.methods.length == 0) {
        throw Error('have no method');
      }
      var interfaceCtor = new mace.makeInterface.BASE,
        abstractMethod = function() {
          throw Error('unimplemented abstract method');
        };
      // 放置虚函数
      mace.each(proto.methods, function(methodName) {
        if (mace.isString(methodName)) {
          interfaceCtor[methodName] = abstractMethod;
        }
      });
      // 放置非函数属性
      mace.each(proto, function(value, key) {
        if (key != 'methods' && !mace.isFunction(value)) {
          interfaceCtor[key] = value;
        }
      });
      return interfaceCtor;
    };
    mace.makeInterface.BASE = function() {};
    // Cookie
    // -------------
    // Thanks to:
    //  - http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/
    //  - http://developer.yahoo.com/yui/3/cookie/
    (function() {
      var Cookie = mace.cookie = {};
      var decode = decodeURIComponent;
      var encode = encodeURIComponent;
      /**
       * Returns the cookie value for the given name.
       *
       * @param {String} name The name of the cookie to retrieve.
       *
       * @param {Function|Object} options (Optional) An object containing one or
       *     more cookie options: raw (true/false) and converter (a function).
       *     The converter function is run on the value before returning it. The
       *     function is not used if the cookie doesn't exist. The function can be
       *     passed instead of the options object for conveniently. When raw is
       *     set to true, the cookie value is not URI decoded.
       *
       * @return {*} If no converter is specified, returns a string or undefined
       *     if the cookie doesn't exist. If the converter is specified, returns
       *     the value returned from the converter.
       */
      Cookie.get = function(name, options) {
        validateCookieName(name);
        if (typeof options === 'function') {
          options = {
            converter: options
          };
        } else {
          options = options || {};
        }
        var cookies = parseCookieString(document.cookie, !options['raw']);
        return (options.converter || same)(cookies[name]);
      };
      /**
       * Sets a cookie with a given name and value.
       *
       * @param {string} name The name of the cookie to set.
       *
       * @param {*} value The value to set for the cookie.
       *
       * @param {Object} options (Optional) An object containing one or more
       *     cookie options: path (a string), domain (a string),
       *     expires (number or a Date object), secure (true/false),
       *     and raw (true/false). Setting raw to true indicates that the cookie
       *     should not be URI encoded before being set.
       *
       * @return {string} The created cookie string.
       */
      Cookie.set = function(name, value, options) {
        validateCookieName(name);
        options = options || {};
        var expires = options['expires'];
        var domain = options['domain'];
        var path = options['path'];
        if (!options['raw']) {
          value = encode(String(value));
        }
        var text = name + '=' + value;
        // expires
        var date = expires;
        if (typeof date === 'number') {
          date = new Date();
          date.setDate(date.getDate() + expires);
        }
        if (date instanceof Date) {
          text += '; expires=' + date.toUTCString();
        }
        // domain
        if (isNonEmptyString(domain)) {
          text += '; domain=' + domain;
        }
        // path
        if (isNonEmptyString(path)) {
          text += '; path=' + path;
        }
        // secure
        if (options['secure']) {
          text += '; secure';
        }
        document.cookie = text;
        return text;
      };
      /**
       * Removes a cookie from the machine by setting its expiration date to
       * sometime in the past.
       *
       * @param {string} name The name of the cookie to remove.
       *
       * @param {Object} options (Optional) An object containing one or more
       *     cookie options: path (a string), domain (a string),
       *     and secure (true/false). The expires option will be overwritten
       *     by the method.
       *
       * @return {string} The created cookie string.
       */
      Cookie.remove = function(name, options) {
        options = options || {};
        options['expires'] = new Date(0);
        return this.set(name, '', options);
      };

      function parseCookieString(text, shouldDecode) {
          var cookies = {};
          if (isString(text) && text.length > 0) {
            var decodeValue = shouldDecode ? decode : same;
            var cookieParts = text.split(/;\s/g);
            var cookieName;
            var cookieValue;
            var cookieNameValue;
            for (var i = 0, len = cookieParts.length; i < len; i++) {
              // Check for normally-formatted cookie (name-value)
              cookieNameValue = cookieParts[i].match(/([^=]+)=/i);
              if (cookieNameValue instanceof Array) {
                try {
                  cookieName = decode(cookieNameValue[1]);
                  cookieValue = decodeValue(cookieParts[i].substring(cookieNameValue[1].length + 1));
                } catch (ex) {
                  // Intentionally ignore the cookie -
                  // the encoding is wrong
                }
              } else {
                // Means the cookie does not have an "=", so treat it as
                // a boolean flag
                cookieName = decode(cookieParts[i]);
                cookieValue = '';
              }
              if (cookieName) {
                cookies[cookieName] = cookieValue;
              }
            }
          }
          return cookies;
        }
        // Helpers
      function isString(o) {
        return typeof o === 'string';
      }

      function isNonEmptyString(s) {
        return isString(s) && s !== '';
      }

      function validateCookieName(name) {
        if (!isNonEmptyString(name)) {
          throw new TypeError('cookie name must be a non-empty string');
        }
      }

      function same(s) {
        return s;
      }
    }());
    if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = mace;
      }
      exports.mace = mace;
    } else {
      root.mace = mace;
    }
  }.call(this || window));
});