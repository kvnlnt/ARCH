// register types
(function(){

    //
    // CHORDYNATOR
    // 
    var Chordynator = ARCH.TYPE('Chordynator');

        // props
        Chordynator.prop({name:'name',  value:'default', type:String});
        Chordynator.prop({name:'descr', value:'default', type:String});

        // funcs
        Chordynator.func({name:'init'});
        Chordynator.func({name:'reload'});
        Chordynator.func({name:'test'});

    //
    // MAP
    // 
    var Map = ARCH.TYPE('Map');

        // props
        Map.prop({name:'name',  value:'default', type:String});
        Map.prop({name:'descr', value:'default', type:String});

        // funcs
        Map.func({name:'init', descr:'descr'});
        Map.func({name:'reload', descr:'descr'});
        Map.func({name:'test', descr:'descr'});
        Map.func({name:'util', descr:'descr'});

}());



