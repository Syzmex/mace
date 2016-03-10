


+ function () {

  if ( !doc ) return;

  var dom = {


    getWindow: function ( elem ) {
      return elem ? this.getDocument( elem ).defaultView : window;
    },

    getDocument: function ( elem ) {
      return ( elem && elem.ownerDocument ) || document;
    },

    // 检测a元素是否包含了b元素
    contains: function ( a, b ) {

      // 标准浏览器支持compareDocumentPosition
      if ( a.compareDocumentPosition ) {
        return !!( a.compareDocumentPosition( b ) & 16 );
      }
      else if ( a.contains ) {
        return a !== b && a.contains( b );
      }
      else {
        while ( b = b.parentNode ) {
          if ( a == b ) return true;
        }
      }
      return false;
    },


    parent: function ( elem ) {
      return elem.parentNode;
    },


    parents: function ( elem, reverse_, all_ ) {

      var
      doc_, win_, end_,
      parentList = [],
      parent = this.parent( elem );

      if ( all_ ) {
        doc_ = this.getDocument( elem );
        win_ = doc_.defaultView || window;
        end_ = reverse_ ? [ win_, doc_ ] : [ doc_, win_ ];
      }

      if ( parent == doc_ ) {
        return end_ || [];
      }
      else if ( parent ) {
        parentList = reverse_
            ? this.parents( parent, reverse_, all_ ).concat( [ parent ] )
            : [ parent ].concat( this.parents( parent, reverse_, all_ ) );
      }

      return parentList;
    }

  };

  M.dom = dom;

} ();