(function(me){

    function init(){ console.log('Map init ' + this.name); };
    function reload(){ console.log('Map reload ' + this.name); };
    function test(){ console.log('Map test ' + this.name); };

    me.func(init);
    me.func(reload);
    me.func(test);

}(ARCH.TYPE('Map')));
