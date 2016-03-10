// var o = mace.Evented.extend( {}, {} );
// var newo = new o
// var a = function(){console.log('a')}
// newo.once( 'b', a );
// newo.once( 'bcc', a );
// newo.once( 'bcc', a );
// newo.once( 'baa', a );
// newo.once( 'baa', a );
// newo.once( 'bdd', a );
// newo.once( 'bdd', a );
// newo.trigger( 'b' );
// console.log(newo.__events__)
// var i = mace.Evented.extend( {}, {} );
// var newi = new i
// newo.listenTo(newi, 'bibi', function () {
//   console.log( 'bibibibi' )
// } );
// newi.trigger( 'bibi' );
// newi.on( 'change:value', function () {
//   console.log( 'value:' + this.value );
// } );
// newo.on( 'change:value', function () {
//   console.log( 'value:' + this.value );
// } );


// var mouse = mace.filter( 'click dblclick drag dragend dragenter dragleave dragover dragstart \
//     drop mousedown mousemove mouseout mouseover mouseup mousewheel scroll'.split( ' ' ),
//     function ( event ) {
//   return /^(?:mouse|contextmenu)|click/.test( event );
// } )
// console.log( mouse )

// document.getElementsByTagName( 'body' )[ 0 ].innerHTML += '<div><input type="text" id="asd"/></div><button><input type="text" id="asd1"/></button><div id="d1" style="height:200px;width:200px;background:#999999;margin-top:10px;" draggable=true></div><div id="d2" style="height:200px;width:200px;background:#aaaaaa;margin-top:10px;" draggable=true></div><iframe id="f2" style="height:200px;width:200px;" src="iframe.html"></iframe>'
// var docEvented = new mace.DomEvented( document );
// var dEleEvented = new mace.DomEvented( document.documentElement );
var bodyEvented = new mace.DomEvented( document.body );
// var winEvented = new mace.DomEvented( window );
// var inputEvented = new mace.DomEvented( document.getElementById( 'asd' ) );
// var input1Evented = new mace.DomEvented( document.getElementById( 'asd1' ) );
// var d1dom = document.getElementById( 'd1' );
// var d1Evented = new mace.DomEvented( document.getElementById( 'd1' ) );
// var d2Evented = new mace.DomEvented( document.getElementById( 'd2' ) );
// // var f1Evented = new mace.DomEvented( document.getElementById( 'f1' ) );
// var f2Evented = new mace.DomEvented( document.getElementById( 'f2' ) );
// var objEvented = new mace.Evented();
// // console.log( bodyEvented )
// var ffun = function ( e ) {
//   console.log( e, 'ffun ' + e.usecapture );
// }
// bodyEvented.on( 'click', ffun, false );
// bodyEvented.on( 'click', ffun, true );
// bodyEvented.on( 'resize', function ( e ) {
//   console.log( e, 'body resize' );
// } );

var form1Evented = new mace.DomEvented( document.getElementById( 'form1' ) );

var aa = function ( e ) {
  console.log( this, 'aa' )
}

bodyEvented.on( 'focusin', function ( e ) {
  console.log( 'body' )
} );

bodyEvented.on( 'focusin', aa );

bodyEvented.on( 'focusin', aa );

form1Evented.on( 'focusin', function ( e ) {
  console.log( e.target.name )
} );

form1Evented.on( 'focusin', aa );


var md = new mace.Dictionary();
var o = {id:1};
md.child( o );
console.log( md );
// winEvented.on( 'click', function ( e ) {
//   console.log( 'winf' )
// }, false );
// winEvented.on( 'click', function ( e ) {
//   console.log( 'wint' )
// }, true );
// docEvented.on( 'click', function ( e ) {
//   console.log( 'doct', e )
// }, true );
// docEvented.on( 'click', function ( e ) {
//   console.log( 'docf' )
// }, false );
// bodyEvented.on( 'click', function ( e ) {
//   console.log( 'bodyf' )
// }, false );
// bodyEvented.on( 'click', function ( e ) {
//   console.log( 'bodyt' )
// }, true );

// objEvented.on( 'change:scrollHeight', function ( e ) {
//   console.log('输出：', this.scrollHeight)
// } );


// objEvented.scrollHeight = 10101010101
// // bodyEvented.off('click asd asad asdasd '.split(' '));
// console.log(bodyEvented.element.scrollHeight, bodyEvented)
// d1Evented.trigger( 'click' );
// var clickEvent = document.createEvent('MouseEvents');
// clickEvent.initMouseEvent('click', true, true, window, 1, 200, 200, 200, 200, false, false, false, false, 0, null);
// d1dom.dispatchEvent( clickEvent );

// winEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'winf', e, this )
// }, false );
// winEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'wint', e, this )
// }, true );
// docEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'doct', e, this )
// }, true );
// docEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'docf', e, this )
// }, false );
// bodyEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'bodyf', e, this )
// }, false );
// bodyEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'bodyt', e, this )
// }, true );
// dEleEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'elef', e, this )
// }, false );
// dEleEvented.element.addEventListener( 'click', function ( e ) {
//   console.log( 'elet', e, this )
// }, true );
// inputEvented.on( 'focus', function ( e ) {
//   console.log( 'input', e, this )
// } );


// inputEvented.element.parentNode.addEventListener( 'focus', function ( e ) {
//   console.log( 'input_parent', e, this )
// }, true );

// inputEvented.on( 'keydown', function ( e ) {
//   console.log( 'keydown', e, this )
// } );

// inputEvented.on( 'keypress', function ( e ) {
//   console.log( 'keypress', e, this )
// } );

// inputEvented.on( 'keyup', function ( e ) {
//   console.log( 'keyup', e, this )
// } );

// inputEvented.on( 'mousedown', function ( e ) {
//   console.log( 'mousedown', e, this )
// } );

// document.getElementById( 'asd' ).addEventListener( 'keydown', function ( e ) {
//   console.log( 'keydown', e, this )
// }, false );

// document.getElementById( 'asd' ).addEventListener( 'keypress', function ( e ) {
//   console.log( 'keypress', e, this )
// }, false );

// document.getElementById( 'asd' ).addEventListener( 'keyup', function ( e ) {
//   console.log( 'keyup', e, this )
// }, false );


// input1Evented.on( 'focus', function ( e ) {
//   console.log( 'input', e, this )
// } );


// input1Evented.on( 'click', function ( e ) {
//   console.log( 'input_click', e, this )
// } );

// input1Evented.on( 'keypress', function ( e ) {
//   console.log( 'input_keypress', e, this )
// } );

// input1Evented.on( 'mousedown', function ( e ) {
//   console.log( 'input_mousedown', e, this )
// } );

// input1Evented.element.parentNode.addEventListener( 'focus', function ( e ) {
//   console.log( 'input_parent', e, this )
// }, true );

// winEvented.on( 'click', function ( e ) {
//   console.log( 'win', e )
// }, false );

// d1dom.addEventListener( 'click', function (e) {
//   console.log('!1', e)
// }, false );
// document.documentElement.addEventListener( 'click', function (e) {
//   console.log('documentElement', e)
// }, false );
// d1dom.addEventListener( 'click', function (e) {
//   console.log('!2', e)
// }, true );
// d1dom.addEventListener( 'click', function (e) {
//   console.log('!3', e)
// }, false );
// d1dom.parentNode.addEventListener( 'click', function (e) {
//   console.log('!4', e)
// }, true );
// d1dom.parentNode.addEventListener( 'click', function (e) {
//   console.log('!5', e)
// }, false );
// d1dom.parentNode.addEventListener( 'click', function (e) {
//   console.log('!6', e)
// }, true );
// d1dom.parentNode.addEventListener( 'click', function () {
//   console.log('#')
// }, true );
// d1Evented.on( 'mouseleave', function ( e ) {
//   console.log( 'mouseleave', e );
// }, false );
// d2Evented.on( 'drag dragend dragenter dragleave dragover dragstart', function ( e ) {
//   console.log( 'd2', e );
// } );
// console.log(d1Evented)
// d1Evented.trigger( 'mouseenter' );
// var docEvented = new mace.DomEvented( document );
// docEvented.on( 'contextmenu', function ( e ) {
//   console.log( e )
// } );
// bodyEvented.off( 'click', ffun, false );

// document.addEventListener( 'click', function () {
//   console.log('4')
// }, false );
// document.addEventListener( 'click', function () {
//   console.log('1')
// }, true );
// document.addEventListener( 'click', function () {
//   console.log('5')
// }, false );
// document.addEventListener( 'click', function () {
//   console.log('2')
// }, true );
// document.addEventListener( 'click', function () {
//   console.log('6')
// }, false );
// document.addEventListener( 'click', function () {
//   console.log('3')
// }, true );