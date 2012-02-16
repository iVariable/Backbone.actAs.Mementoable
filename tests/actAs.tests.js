module('Backbone.actAs.Mementoable');

test('Mementos are deep clones of Model.attributes',function(){ //Need to cover all types of arguments, but have no time :(
	var testClass = {
			defaults: {
				date: ''
			}
		},
		testModel = null,
		date = new Date('2012'),
		memento;

	_.extend( testClass, Backbone.actAs.Mementoable );
	testClass = Backbone.Model.extend(testClass);

	testModel = new testClass({date: date});

	memento = testModel.saveMemento();

	notEqual( memento.memento().date, date, 'Deep clones here' );

	testModel.set({date:new Date('2011')});
	same(  memento.memento(), {date: date}, 'Modifing original attributes does nothing to memento' );

});