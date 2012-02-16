module('Backbone.actAs.Mementoable Issues');

test( 'Issue #2. Dates diff.', function(){

	var testClass = {
			defaults: {
				date: ''
			}
		},
		testModel = null,
		newDate = new Date('2012'),
		oldDate = new Date('2011'),
		memento1, memento2;

	_.extend( testClass, Backbone.actAs.Mementoable );
	testClass = Backbone.Model.extend(testClass);

	testModel = new testClass({date: oldDate});

	memento1 = testModel.saveMemento();
	testModel.set({date:newDate});

	memento2 = testModel.saveMemento();

	ok( !memento1.equal(memento2), 'Mementos not equal' );
	same( memento1.diffChanged( memento2 ), {date: newDate}, 'Date changed' );

} );