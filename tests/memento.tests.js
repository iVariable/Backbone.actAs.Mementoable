module('Backbone.actAs.Memento');

test('Creation', 2, function(){
	var memento = new Backbone.actAs.Memento();
	equal( memento.type(), 'Memento', 'Default type' );
	equal( memento.memento(), '', 'Default memento' );
});

test( 'Setters with _.clone', 5, function(){
	var memento = new Backbone.actAs.Memento(),
		type	= 'hello world',
		mem		= {one: 'one', two:2};

	same( memento.type(type), type, 'type() setter returns new value' );
	same( memento.type(), type, 'type() getter' );

	same( memento.memento(mem), mem, 'memento() setter returns new value' );
	same( memento.memento(), mem, 'memento() getter' );
	notEqual( memento.memento(), mem, 'Mementos are same objects, but not one (_.clone on getter)' ); //because of _.clone();
} );

test( 'Equality', 6, function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2},
		mem2	 = {one: 'one', two:2, three: new Date()},
		mem3	 = {one: 'one', two:3};

	raises(function(){
		memento1.equal(new Date());
	}, 'non-memento comparison');

	ok( memento1.equal(memento2), 'All mementos are equal at creation' );

	memento1.memento(mem1);
	memento2.memento(mem1);
	ok( memento1.equal(memento2), 'Same memento' );

	memento1.memento(mem1);
	memento2.memento(_.clone(mem1));
	ok( memento1.equal(memento2), 'Cloned memento' );

	memento1.memento(mem1);
	memento2.memento(mem2);
	ok(!memento1.equal(memento2), 'Whole different mementos');

	memento1.memento(mem1);
	memento2.memento(mem3);
	ok(!memento1.equal(memento2), 'ByValue different mementos');
} );

test( 'Diff', function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2},
		mem2	 = {one: 'one', two:2, three: 'ololo'},
		mem3	 = {one: 'one', two:3};

	raises(function(){
		memento1.diff(new Date());
	}, 'non-memento comparison');

	memento1.memento( mem1 );
	memento2.memento( mem1 );

	same( memento1.diff(memento2), {}, 'Same mementos = no diff' );

	memento2.memento(mem3);
	same( memento1.diff(memento2), {two:2}, 'ByValue difference' );
	same( memento2.diff(memento1), {two:3}, 'ByValue difference other side' );

	memento2.memento(mem2);
	same( memento1.diff(memento2), {}, 'No additional option in first memento' );
	same( memento2.diff(memento1), {three:"ololo"}, 'Additional option in second memento' );
} );