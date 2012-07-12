Backbone.actAs = Backbone.actAs || {};
Backbone.actAs.Memento = (function(){

	var diff = function( originalMemento, comparedMemento, mapFunction ){
		if( !( originalMemento instanceof Backbone.actAs.Memento ) ) throw Error('Trying to compare non-Memento object.');
		if( !( comparedMemento instanceof Backbone.actAs.Memento ) ) throw Error('Trying to compare non-Memento object.');

		var mem = comparedMemento.memento(),
			_keys = _( originalMemento.memento() )
					.chain()
					.map(mapFunction, comparedMemento.memento())
					.compact(),
			result = {};

		if( _keys.size().value() > 0 ){
			_keys.each(function(key){
				result[key] = this[key];
			}, originalMemento.memento());
		}
		return result;
	},

	deepClone = function(obj, depth) { // thanks to https://github.com/kmalakoff for this codeю

		if (!obj || (typeof obj !== 'object')) return obj; // by value
		else if (_.isString(obj)) return String.prototype.slice.call(obj);
		else if (_.isDate(obj)) return new Date(obj.valueOf());
		else if (_.isFunction(obj.clone)) return obj.clone();

		var clone;

		if (_.isArray(obj)) clone = Array.prototype.slice.call(obj);
		else if (obj.constructor!=={}.constructor) return obj; // by reference
		else clone = _.extend({}, obj);

		if (!_.isUndefined(depth) && (depth > 0)) {
			for (var key in clone) {
				clone[key] = deepClone(clone[key], depth-1);
			}
		}

		return clone;
	},

	flattenArrays = function( diff ){
		return _.flatten(_.values(diff));
	},

	flattenObjects = function( diff ){
		var values = _.values(diff);
		values.unshift({});
		return _.extend.apply(_, values);
	};

	var diffNonExistMap = function(value, key){return ( typeof this[key] == 'undefined' )?key:'';},
		diffChangedMap = function(value, key){return (_.isEqual( value, this[key] )||(typeof this[key] == 'undefined'))?'':key;};


	return Backbone.Model.extend({

		defaults:{
			type: 'Memento',
			memento: ''
		},

		initialize: function(){
			this.set({
				type: deepClone( this.type(),100 ),
				memento: deepClone( this.memento(),100 )
			},{silent: true});
		},

		equal: function( memento ){
			if( !( memento instanceof Backbone.actAs.Memento ) ) throw Error('Trying to compare non-Memento object.');
			return _.isEqual( this.toJSON(), memento.toJSON() );
		},

		diffAdded: function(memento){
			return diff( memento, this, diffNonExistMap );
		},

		diffChanged: function( memento ){ // No type comparison here!
			return diff( memento, this, diffChangedMap );
		},

		diffDeleted: function(memento){
			return diff( this, memento, diffNonExistMap );

		},

		diff: function( memento, flatten ){
			var diff = {
				changed:	this.diffChanged(memento),
				added:		this.diffAdded(memento),
				deleted:	this.diffDeleted(memento)
			};
			return flatten ? flattenObjects( diff ) : diff;
		},

		diffKeys: function( memento, flatten ){
			var diff = {
				changed:	_.keys( this.diffChanged(memento) ),
				added:		_.keys( this.diffAdded(memento) ),
				deleted:	_.keys( this.diffDeleted(memento) )
			};
			return flatten ? flattenArrays( diff ) : diff;
		},

		memento: function(memento){
			if( typeof memento != 'undefined' ) this.set({memento:deepClone(memento,100)});
			return this.get('memento');
		},

		type: function(type){
			if( typeof type != 'undefined' ) this.set({type:deepClone(type,100)});
			return this.get('type');
		}

	});

})();

Backbone.actAs.MementoCollection = Backbone.Collection.extend({
	model: Backbone.actAs.Memento
});

Backbone.actAs.Mementoable = (function(){

	return {

		lastMemento: false,

		initMementoable: function(){
			if( typeof this._saveMemento == 'function' ){
				this.on('memento:save', this._saveMemento, this);
			}
			if( typeof this._beforeRestoreMemento == 'function' ){
				this.on('memento:before-restore', this._beforeRestoreMemento, this);
			}
			if( typeof this._afterRestoreMemento == 'function' ){
				this.on('memento:after-restore', this._afterRestoreMemento, this);
			}
			return this;
		},

		getStoredMemento: function(){
			return this.lastMemento;
		},

		storeMemento: function( memento ){
			this.lastMemento = memento || this.saveMemento();
			return this;
		},

		saveMemento: function(){
			var memento = new Backbone.actAs.Memento({memento: this.toJSON()});
			this.trigger('memento:save', memento);
			return memento;
		},

		restoreMemento: function( memento ){
			var memento = memento || this.lastMemento;
			if(!memento) return this; //?
			this.trigger('memento:before-restore', memento);
			if( this instanceof Backbone.Model ) {
				this.set(memento.memento());
			}else{
				this.reset(memento.memento());
			};
			this.trigger('memento:after-restore', memento);
			return this;
		}

	};
})();