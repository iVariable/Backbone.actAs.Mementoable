Backbone.actAs = Backbone.actAs || {};
Backbone.actAs.Memento = Backbone.Model.extend({

	defaults:{
		type: 'Memento',
		memento: ''
	},

	equal: function( memento ){
		if( !( memento instanceof Backbone.actAs.Memento ) ) return false;
		return _.isEqual( this.toJSON(), memento.toJSON() );
	},

	memento: function(){
		return this.get('memento');
	},

	type: function(){
		return this.get('type');
	}

});

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