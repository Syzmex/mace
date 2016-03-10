
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