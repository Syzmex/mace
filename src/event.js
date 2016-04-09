

+ function () {


  /**
   * 自定义事件对象
   */
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

  };

  M.Event = M.createClass( eventProto );


  var

  // 事件名称分割符
  splitter = /\s+/,

  // 带变量名的change事件
  changeSplitter = /:/,
  changeName = /^change:\S*$/,

  // 事件池
  eventpool_ = {},


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


}();