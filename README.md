# About Backbone.ActAs.Mementoable

[Memento pattern](http://sourcemaking.com/design_patterns/memento) realization for Backbone.js models.
I know that an implementation of this pattern already [exists](https://github.com/derickbailey/backbone.memento),
but i need more flexibility so i've written my own implementation.

## Plugin contents

1.	Backbone.actAs.Memento - memento object for storing your object state.
2.	Backbone.actAs.Mementoable - special behavioral methods-helpers for mixin to your model.

### Differences from Backbone.Memento

1.	Independent object (Backbone.actAs.Memento) for storing memento information.
	Of course this object is a child of Backbone.Model with all bonuses from this fact.
2.	Backbone.actAs.Memento object are comparable. You can compare two Memento objects by simple call of equal() method. As a result of comparable you can get difference between two mementos by diff() method.
3.	There are special methods for retrieving, storing and restoring Memento objects.
	You can call saveMemento() to get current state of your model in the form of Backbone.actAs.Memento and make some operations over it.
	Or you can call storeMemento(), to store Memento internally in your object.
	And of course you can restore any memento with restoreMemento(memento) call.
4.	There are three special events that fires than you working with store/restoreMemento methods: memento:save, memento:before-restore, memento:after-restore.
	In memento:save, memento:before-restore you have access to the resulting Backbone.actAs.Memento object and you can modify it as you need.

# Getting started

You only need to have Backbone (including underscore.js - a requirement for Backbone) in your page before including the Backbone.ActAs.Mementoable plugin.

## Setup a model

There are two ways of using this actAs-plugin:

1.	*Globally.* You can simply mix it to Backbone.Model.prototype (like Backbone.Events) and all your models automatically become Mementoable.
```javascript
_.extend( Backbone.Model.prototype, Backbone.actAs.Mementoable );
```

2.	*Locally.* See first paragraf, but mix Backbone.actAs.Mementoable to your own model prototype.

3.	*Secret way ^_^.* You can use Backbone.actAs.Memento directly without using Backbone.actAs.Mementoable.

## Usage

### Simple operations

```javascript
/**
 * Let's create test object
 */
_.extend( Backbone.Model.prototype, Backbone.actAs.Mementoable );
var MyCoolModel = Backbone.Model.extend({
	defaults:{
		name: 'Ihha!!1',
		description: 'testme, bro'
	}
});

var TestObject = new MyCoolModel(),
	Memento0,
	Memento1;

console.log( TestObject.get('name') ); //'Ihha!!1'

Memento0 = TestObject.saveMemento(); // Saving our object state in first memento
Memento1 = TestObject.saveMemento(); // Saving our object state in second memento
if( Memento0.equal( Memento1 ) ){
	console.log('Mementos are equal because we haven\'t changed an original object');
};

console.dir( Memento0.type(), Memento0.memento() ); //Let's have a look inside our memento

TestObject.set({name:'Ooops'}); // Let's change our object
console.log( TestObject.get('name') ); //'Ooops'

if( !Memento0.equal( TestObject.saveMemento() ) ){
	console.log('Now mementos aren\'t equal');
	console.dir( Memento0.diff( TestObject.saveMemento() ) ); // Let's see what is different form our saved state
}

TestObject.restoreMemento( Memento0 ); // Restoring our memento

if( Memento0.equal( TestObject.saveMemento() ) ){
	console.log('And now they are equal again :)');
	console.log( TestObject.get('name') ); //'Ihha!!1'
};

// If you don't want to store your memento externally you can use storeMemento() method...
TestObject.storeMemento();

TestObject.set({name:'Ooops'});
console.log( TestObject.get('name') ); //'Ooops'

// ...and restoreMemento() method without parameters
TestObject.restoreMemento();
console.log( TestObject.get('name') ); //'Ihha!!1'

```
Really simple, yeah? :)

### Using event hooks

If you have some attributes of an object that you don't want to store/restore
(or you want to add some additional params for comparing ),
you don't need to rewrite store/restoreMememnto methods. All you need is to bind
some callbacks to special events.

```javascript
_.extend( Backbone.Model.prototype, Backbone.actAs.Mementoable );
var MyCoolModel = Backbone.Model.extend({
	defaults:{
		name: 'Ihha!!1',
		description: 'testme, bro',
		uselessCounter: 0
	},

	additionalParam: 'special generated param'
});

var TestObject = new MyCoolModel(),
	Memento0;

/**
 * Let's modify our memento on saveMememto() call
 */
TestObject.bind( 'memento:save', function(memento){
	var newMemento = memento.memento();
	delete newMemento.uselessCounter;							// removing useless param...
	newMemento.additionalParam = _.clone(this.additionalParam);	// ... and adding useful :)
	memento.set({
		memento:newMemento
	});
}, TestObject );


/**
 * And we need to restore our special additionalParam
 */
TestObject.bind( 'memento:before-restore', function(memento){
	var newMemento = memento.memento();
	this.additionalParam = newMemento.additionalParam;	// restoring our special param...
	delete newMemento.additionalParam;					// ... and removing it, to prevent attributes garbaging
	memento.set({
		memento:newMemento
	});
}, TestObject );

```

### Using model hooks

This use-case is just a syntactic sugar for events hooks. It's useful to keep all your logic inside your model.
Of course you can bind event hooks inside your initialize() method, but there is a better way.

Let's rewrite previous example in a new way.

```javascript

_.extend( Backbone.Model.prototype, Backbone.actAs.Mementoable );
var MyCoolModel = Backbone.Model.extend({
	defaults:{
		name: 'Ihha!!1',
		description: 'testme, bro',
		uselessCounter: 0
	},

	additionalParam: 'special generated param',

	initialize: function(){
		this.initMementoable(); // Special binding call!
	},

	_saveMemento: function(memento){
		var newMemento = memento.memento();
		delete newMemento.uselessCounter;							// removing useless param...
		newMemento.additionalParam = _.clone(this.additionalParam);	// ... and adding useful :)
		memento.set({
			memento:newMemento
		});
	},

	_beforeRestoreMemento: function(memento){
		var newMemento = memento.memento();
		this.additionalParam = newMemento.additionalParam;	// restoring our special param...
		delete newMemento.additionalParam;					// ... and removing it, to prevent attributes garbaging
		memento.set({
			memento:newMemento
		});
	}
});
```
As you can see, code is much more neat than before.

# API

For API - see source in src/ folder in this repository. I want to believe code is self-explanatory. :)

# ChangeLog

## v0.2
* diff() method changed. Now it just collaborate the results of diffChanged, diffAdded, diffDeleted methods (issue #1)
* diffChanged() method added. (issue #1)
* diffAdded() method added. (issue #1)
* diffDeleted() method added. (issue #1)

## v0.1.1
* diff() method added. (issue #1)

## v0.1
* Initial release