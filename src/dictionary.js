

+ function () {

  var

  counter_ = 0,

  dictionary = {},

  dicmap = {};



  var

  dicProto = {

    init: function () {
      this.length = 0;
      this.__hash__ = 0;
      this.__cache__ = {};
      this.__contents__ = {};
    },


    // 获取/创建 子字典
    child: function ( namespace ) {
      if ( !this.has( namespace ) ) {
        var dic = new M.Dictionary();
        this.put( namespace, dic );
        return dic;
      } else {
        return this.get( namespace );
      }
    },


    /**
     * 放入
     * @param  {obj|string|num} namespace 对象、文字、数字
     */
    put: function ( namespace, content ) {
      if ( !this.has( namespace ) ) {
        this.__cache__[ this.__hash__ ] = namespace;
        this.__contents__[ this.__hash__ ++ ] = content;
        this.length ++;
      } else {
        for ( var hash in this.__cache__ ) {
          if ( this.__cache__[ hash ] === namespace ) {
            this.__contents__[ hash ] = content;
          }
        }
      }
      return this;
    },


    /**
     * 取出
     * @param  {obj|string|num} namespace 对象、文字、数字
     */
    get: function ( namespace ) {
      for ( var hash in this.__cache__ ) {
        if ( this.__cache__[ hash ] === namespace ) {
          return this.__contents__[ hash ];
        }
      }
      return null;
    },


    has: function ( namespace ) {
      for ( var hash in this.__cache__ ) {
        if ( this.__cache__[ hash ] === namespace ) {
          return true;
        }
      }
      return false;
    },


    remove: function ( namespace ) {
      if ( this.has( namespace ) ) {
        for ( var hash in this.__cache__ ) {
          if ( this.__cache__[ hash ] === namespace ) {
            delete this.__cache__[ hash ];
            delete this.__contents__[ hash ];
            this.length --;
          }
        }
      }
      return this;
    }

  },


  dicStatic = {

    uuid: function () {
      return ++ counter_;
    }

  };


  M.Cache = M.Dictionary = M.createClass( dicProto, dicStatic );


} ();


/*

var
mode = new M.Cache();
mode.put( obj, {} );
mode.get( obj ); ==> {}

 */
