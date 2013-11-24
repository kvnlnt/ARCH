ARCH = {}; // Main architecture object
ARCH.TYPES = {};

// Architectures registered apps
ARCH.TYPE = function(type){

     // create main object
    var TYPE = ARCH.TYPES[type] = !ARCH.TYPES.hasOwnProperty(type) ? {} : ARCH.TYPES[type];

    // create child objects
    if(!TYPE.hasOwnProperty('props')) TYPE.props = {}; // attach props list
    if(!TYPE.hasOwnProperty('funcs')) TYPE.funcs = {}; // attach funcs list

    // add function function
    TYPE.func = function(func){
        if(!this.funcs.hasOwnProperty(func.name)) this.funcs[func.name] = {}; // create main object
        if(typeof func == 'function') this.funcs[func.name].func = func; // attach function
        if(typeof func == 'object') for(var key in func) this.funcs[func.name][key] = func[key]; // attach keys
    };

    // add property function
    TYPE.prop = function(prop){
        prop.prop  = type + "." + prop.name;
        prop.value = prop.value;
        ARCH.TYPES[type].props[prop.name] = prop;
    };

    return TYPE;
};

// Copy object from architecture, not modules
// copying objects in JS is challenging, 
// leverage this arch's "registry" to do it correctly
// usage: object = 
//
// var object = { 
//     type:'Map', 
//     name:'map2',
//     props:{ 
//         name:'map2', 
//         descr:'Jarnette' 
//     }
// };
// ARCH.NEW(object);

ARCH.NEW = function(object){

    // get params
    var type  = object.type;
    var name  = object.name;
    var props = object.props;
    var funcs = object.funcs;

    // create new object
    var NEW = { befores:{}, afters:{} };

    // attach to global scope
    window[name] = NEW;

    // attach default properties
    for(var prop in ARCH.TYPES[type].props) NEW[ARCH.TYPES[type].props[prop].name] = ARCH.TYPES[type].props[prop].value;

    // attach default functions
    for(var func in ARCH.TYPES[type].funcs) {

        var FUNC = ARCH.TYPES[type].funcs[func];

        // attach functions
        NEW[FUNC.name] = FUNC.func;

        // attach before containers
        NEW.befores[FUNC.name] = {};
        NEW.afters[FUNC.name]  = {};

        // AOP before wiring
        var aspect = { 
            pointcut: { context:name,   func:FUNC.name }, 
            advice:   { context:'ARCH', func:'RUN', args:['befores', name, FUNC.name] } 
        };

        ARCH.AOP('before', aspect);

        // AOP after wiring
        var aspect = { 
            pointcut: { context:name,   func:FUNC.name }, 
            advice:   { context:'ARCH', func:'RUN', args:['afters', name, FUNC.name] } 
        };

        ARCH.AOP('after', aspect);

        // attach mediator default before and after functions
        NEW.befores[FUNC.name]['BEFORE'] = { context:'ARCH.MEDIATOR', func:'publish', args:[name + '.' + FUNC.name + '.BEFORE'] };
        NEW.afters[FUNC.name]['AFTER']   = { context:'ARCH.MEDIATOR', func:'publish', args:[name + '.' + FUNC.name + '.AFTER'] };

    }

    // apply instance overrides
    for(var prop in props) NEW[ARCH.TYPES[type].props[prop].name] = props[prop];
   
    return NEW;

}

ARCH.RUN = function(mode, obj, func){

    // get all before/after functions
    var funcs = eval(obj)[mode][func];

    // loop and execute each one
    for(var func in funcs){
        var fn = funcs[func];
        eval(fn.context)[fn.func].apply(fn.context, [fn.args]);
    }

};

ARCH.LOG = function(args){
    console.log('LOG ', args);
};

// Architecture's Aspect Oriented Programming Object
// usage: 
// var aspect = {
//     pointcut: { context:'', func:'', args:[] },
//     advice1:  { context:'', func:'', args:[] },
//     advice2:  { context:'', func:'', args:[] }
// };
// var mode = 'before|after|around';
// aop(mode, aspect);
ARCH.AOP = function(mode, aspect){

    var pointcut = eval(aspect.pointcut.context)[aspect.pointcut.func];
    var advice   = eval(aspect.advice.context)[aspect.advice.func];

    eval(aspect.pointcut.context)[aspect.pointcut.func] = function(){ 

      switch(mode){

        case 'before':
          advice.apply(eval(aspect.advice.context),     aspect.advice.args); 
          pointcut.apply(eval(aspect.pointcut.context), aspect.pointcut.args); 
          break;

        case 'after':
          pointcut.apply(eval(aspect.pointcut.context), aspect.pointcut.args);
          advice.apply(eval(aspect.advice.context),     aspect.advice.args); 
          break;

      } // switch

    }; // func 

};

// Architecture's Mediator pattern object : governs events
// USAGE : 
// mediator.publish('CUSTOM.EVENT.NAME', 'Kevin', 'Lint');
// mediator.subscribe('CUSTOM.EVENT.NAME', Plot.plotChange);
ARCH.MEDIATOR = {

    channels: {},

    subscribe: function(channel, fn){
        if (!ARCH.MEDIATOR.channels[channel]) ARCH.MEDIATOR.channels[channel] = [];
        ARCH.MEDIATOR.channels[channel].push({ context: this, callback: fn });
        return this;
    },
 
    publish: function(channel){
        if (!ARCH.MEDIATOR.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = ARCH.MEDIATOR.channels[channel].length; i < l; i++) {
            var subscription = ARCH.MEDIATOR.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    },

    installTo: function(obj){
        obj.subscribe = subscribe;
        obj.publish = publish;
    }
 
};