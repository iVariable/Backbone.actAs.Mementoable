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
	};

	var diffNonExistMap = function(value, key){ return ( typeof this[key] == 'undefined' )?key:''; },
		diffChangedMap = function(value, key){ return (_.isEqual( value, this[key] )||(typeof this[key] == 'undefined'))?'':key; };


	return Backbone.Model.extend({

		defaults:{
			type: 'Memento',
			memento: ''
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

		diff: function( memento ){
			return {
				changed:	this.diffChanged(memento),
				added:		this.diffAdded(memento),
				deleted:	this.diffDeleted(memento)
			};
		},

		memento: function(memento){
			if( typeof memento != 'undefined' ) this.set({memento:_.clone(memento)});
			return this.get('memento');
		},

		type: function(type){
			if( typeof type != 'undefined' ) this.set({type:_.clone(type)});
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
				this.bind( 'memento:save', _.bind( this._saveMemento, this ) );
			}
			if( typeof this._beforeRestoreMemento == 'function' ){
				this.bind( 'memento:before-restore', _.bind( this._beforeRestoreMemento, this ) );
			}
			if( typeof this._afterRestoreMemento == 'function' ){
				this.bind( 'memento:after-restore', _.bind( this._afterRestoreMemento, this ) );
			}
		},

		getStoredMemento: function(){
			return this.lastMemento;
		},

		storeMemento: function( memento ){
			this.lastMemento = memento || this.saveMemento();
		},

		saveMemento: function(){
			var mem = {};
			_(this.toJSON()).each(function(value, key){ //simple two-level clone. deepClone must be here!
				mem[key] = _.clone(value);
			});
			var memento = new Backbone.actAs.Memento({memento: mem});
			this.trigger('memento:save', memento);
			return memento;
		},

		restoreMemento: function( memento ){
			var memento = memento || this.lastMemento;
			if(!memento) return; //?
			this.trigger('memento:before-restore', memento);
			if( this instanceof Backbone.Model ) {
				this.set(memento.get('memento'));
			}else{
				this.reset(memento.get('memento'));
			};
			this.trigger('memento:after-restore', memento);
		}

	};
})();