

+ function () {

var
splitter = /\s+/,
ielt9 = M.support.ielt9,
isECMAEvent = !!root.document.addEventListener,
eventHooks = {},

// 事件缓存
cache = new M.Dictionary(),

rFormElems = /^(?:textarea|input|select)$/i,
rInputCheck = /^(?:radio|checkbox|)$/,


// 基础的属性
baseProps = 'type target returnValue defaultPrevented currentTarget eventPhase timeStamp cancelable cancelBubble bubbles isTrusted'.split( ' ' ),


uiEventProps = baseProps.concat( 'isChar detail layerX layerY pageX pageY view which'.split( ' ' ) ),


focusEventProps = uiEventProps.push( 'relatedTarget' ),


mouseEventProps = uiEventProps.concat( 'altKey button clientX clientY ctrlKey metaKey movementX movementY offsetX offsetY relatedTarget screenX screenY shiftKey fromElement toElement webkitForce x y'.split( ' ' ) ),


keyboardEventProps = uiEventProps.concat( 'altGraphKey altKey charCode ctrlKey keyCode keyIdentifier keyLocation location metaKey shiftKey'.split( ' ' ) ),



// // 事件统计来自 'http://www.w3school.com.cn/tags/html_ref_eventattributes.asp'
// formEvent = 'blur change contextmenu focus formchange forminput input invalid reset select submit'.split( ' ' ),

// // 鼠标事件
// mouseEvent = 'click dblclick drag dragend dragenter dragleave dragover dragstart drop mousedown mousemove mouseout mouseover mouseup mousewheel scroll'.split( ' ' ),

// // 键盘事件
// keyboardEvent = 'keydown keypress keyup'.split( ' ' ),

// // 针对 window 对象触发的事件（应用到 <body> 标签）
// windowEvent = 'afterprint beforeprint beforeonload error haschange load message offline online pagehide pageshow popstate redo resize storage undo unload blur focus'.split( ' ' ),

// // 适用于所有 HTML 元素，但常见于媒介元素中，比如 <audio>、<embed>、<img>、<object> 以及 <video>）
// mediaEvent = 'abort canplay canplaythrough durationchange emptied ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange readystatechange seeked seeking stalled suspend timeupdate volumechange waiting'.split( ' ' ),



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
    copyProps = mouseEventProps;
  } else if ( root.FocusEvent && originalEvent instanceof root.FocusEvent ) {
    copyProps = focusEventProps;
  } else if ( root.KeyboardEvent && originalEvent instanceof root.KeyboardEvent ) {
    copyProps = keyboardEventProps;
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

