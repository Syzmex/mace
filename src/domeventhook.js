
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

      var hook = {};

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


}();