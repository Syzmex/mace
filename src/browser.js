
+ function ( win ) {

  var
  nav = win.navigator,
  doc = win.document,
  ua = nav.userAgent.toLowerCase(),
  docEle = doc.documentElement,

  ie = 'ActiveXObject' in win,

  firefox   = ua.indexOf( 'firefox' ) !== -1,
  webkit    = ua.indexOf( 'webkit' ) !== -1,
  phantomjs = ua.indexOf( 'phantom' ) !== -1,
  android23 = ua.search( 'android [23]' ) !== -1,
  chrome    = ua.indexOf( 'chrome' ) !== -1,
  gecko     = ua.indexOf( 'gecko' ) !== -1  && !webkit && !win.opera && !ie,

  mobile = typeof orientation !== 'undefined' || ua.indexOf( 'mobile' ) !== -1,
  msPointer = !win.PointerEvent && win.MSPointerEvent,
  pointer = ( win.PointerEvent && nav.pointerEnabled ) || msPointer,

  ie3d = ie && ( 'transition' in docEle.style ),
  webkit3d = ( 'WebKitCSSMatrix' in win ) && ( 'm11' in new win.WebKitCSSMatrix() ) && !android23,
  gecko3d = 'MozPerspective' in docEle.style,
  opera12 = 'OTransition' in docEle.style,

  eventList = [ 'focusin', 'focusout', 'mouseenter', 'mouseleave', 'input' ],

  isSVG = docEle.nodeName.toLowerCase() === 'svg',

  touch = !phantomjs && ( pointer || 'ontouchstart' in win ||
      ( win.DocumentTouch && doc instanceof win.DocumentTouch ) ),

  createElement = function () {
    if ( typeof doc.createElement !== 'function' ) {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return doc.createElement( arguments[ 0 ] );
    } else if ( isSVG ) {
      return doc.createElementNS.call( doc, 'http://www.w3.org/2000/svg',
          arguments[ 0 ] );
    } else {
      return doc.createElement.apply( doc, arguments );
    }
  },

  hasEvent = ( function () {

    // Detect whether event support can be detected via `in`. Test on a DOM element
    // using the "blur" event b/c it should always exist. bit.ly/event-detection
    var needsFallback = !( 'onblur' in doc.documentElement );

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
    ielt9: ie && !doc.addEventListener,
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
    any3d: ( ie3d || webkit3d || gecko3d ) && !opera12 && !phantomjs,

    mobile: mobile,
    mobileWebkit: mobile && webkit,
    mobileWebkit3d: mobile && webkit3d,
    mobileOpera: mobile && win.opera,
    mobileGecko: mobile && gecko,

    touch: !!touch,
    msPointer: !!msPointer,
    pointer: !!pointer,

    retina: ( win.devicePixelRatio || ( win.screen.deviceXDPI / win.screen.logicalXDPI ) ) > 1,
  };


  // 事件测试
  M.each( eventList, function ( event ) {
    M.support[ event ] = hasEvent( event );
  } );

}( root );