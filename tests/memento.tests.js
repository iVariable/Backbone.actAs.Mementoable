module('Backbone.actAs.Memento');

test('Creation', 2, function(){
	var memento = new Backbone.actAs.Memento();
	equal( memento.type(), 'Memento', 'Default type' );
	equal( memento.memento(), '', 'Default memento' );
});

test( 'Setters with _.clone', 5, function(){
	var memento = new Backbone.actAs.Memento(),
		type	= 'hello world',
		mem		= {one: 'one', two:2, three: new Date('2011')};

	same( memento.type(type), type, 'type() setter returns new value' );
	same( memento.type(), type, 'type() getter' );

	same( memento.memento(mem), mem, 'memento() setter returns new value' );
	same( memento.memento(), mem, 'memento() getter' );
	notEqual( memento.memento(), mem, 'Mementos are same objects, but not one (_.clone on getter)' ); //because of _.clone();
} );

test( 'Equality', 5, function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2},
		mem2	 = {one: 'one', two:2, three: new Date()},
		mem3	 = {one: 'one', two:3};

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

test( 'DiffChanged', function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2, date: (new Date(2012))},
		mem2	 = {one: 'one', two:2, three: 'ololo', date: (new Date(2011))},
		mem3	 = {one: 'one', two:3};

	memento1.memento( mem1 );
	memento2.memento( mem1 );

	same( memento1.diffChanged(memento2), {}, 'Same mementos = no diff' );

	memento2.memento(mem3);
	same( memento1.diffChanged(memento2), {two:3}, 'ByValue difference' );
	same( memento2.diffChanged(memento1), {two:2}, 'ByValue difference other side' );

	memento2.memento(mem2);
	same( memento1.diffChanged(memento2), { date:mem2.date }, 'No additional option in first memento' );
	same( memento2.diffChanged(memento1), { date:mem1.date }, 'Additional option in second memento is not treated as changed, but as deleted' );

} );

test( 'DiffDeleted', function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2},
		mem2	 = {one: 'one', two:2, three: 'ololo'};

	memento1.memento( mem1 );
	memento2.memento( mem1 );

	same( memento1.diffDeleted(memento2), {}, 'Same mementos = no diff' );

	memento2.memento(mem2);
	same( memento1.diffDeleted(memento2), {}, 'All attributes present in compared diff' );
	same( memento2.diffDeleted(memento1), {three:"ololo"}, 'One attribute was deleted' );
} );

test( 'DiffAdded', function(){
var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		mem1	 = {one: 'one', two:2},
		mem2	 = {one: 'one', two:2, three: 'ololo'};

	memento1.memento( mem1 );
	memento2.memento( mem1 );

	same( memento1.diffAdded(memento2), {}, 'Same mementos = no diff' );

	memento2.memento(mem2);
	same( memento2.diffAdded(memento1), {}, 'No additional attributes was added' );
	same( memento1.diffAdded(memento2), {three:"ololo"}, 'One attribute was added' );
} );

test( 'Diff', function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		memento3 = new Backbone.actAs.Memento(),
		memento4 = new Backbone.actAs.Memento(),
		memento5 = new Backbone.actAs.Memento();

	memento1.memento( {one: 'one', two:2});
	memento2.memento( {one: 'one', two:2, three: 'ololo'} );
	memento3.memento( {one: 'one', two: 3} );
	memento4.memento( {one: 'one', two:5, three: 'ololo'} );
	memento5.memento( {one: 'one', three: 'three', four: 'four'} );

	same( memento1.diff(memento1), {changed: {}, added: {}, deleted: {}}, 'Same mementos = no diff' );

	same( memento2.diff(memento1), {changed: {}, added: {}, deleted: {three:"ololo"}}, 'Deleted attribute' );
	same( memento1.diff(memento2), {changed: {}, added: {three:"ololo"}, deleted: {}}, 'Added attribute' );

	same( memento1.diff(memento3), {changed: {two:3}, added: {}, deleted: {}}, 'changed value' );
	same( memento3.diff(memento1), {changed: {two:2}, added: {}, deleted: {}}, 'changed value other side' );

	same( memento1.diff(memento4), {changed: {two:5}, added: {three:"ololo"}, deleted: {}}, 'changed value and added attribute' );
	same( memento4.diff(memento1), {changed: {two:2}, added: {}, deleted: {three:"ololo"}}, 'the other way around' );

	same( memento2.diff(memento5), {changed: {three:"three"}, added: {four:"four"}, deleted: {two: 2}}, 'changed value, added and deleted attributes' );
	same( memento5.diff(memento2), {changed: {three:"ololo"}, added: {two:2}, deleted: {four:"four"}}, 'the other way around' );


	// flattened diffs
	same( memento1.diff(memento1, true), {}, 'Same mementos = no diff, flattened' );

	same( memento2.diff(memento1, true), {three:"ololo"}, 'Deleted attribute, flattened' );
	same( memento1.diff(memento2, true), {three:"ololo"}, 'Added attribute, flattened' );

	same( memento1.diff(memento3, true), {two:3}, 'changed value, flattened' );
	same( memento3.diff(memento1, true), {two:2}, 'changed value other side, flattened' );

	same( memento1.diff(memento4, true), {two:5, three:"ololo"}, 'changed value and added attribute, flattened' );
	same( memento4.diff(memento1, true), {two:2, three:"ololo"}, 'the other way around, flattened' );

	same( memento2.diff(memento5, true), {three:"three", four:"four", two: 2}, 'changed value, added and deleted attributes, flattened' );
	same( memento5.diff(memento2, true), {three:"ololo", two:2, four:"four"}, 'the other way around, flattened' );
} );

test( 'DiffFields', function(){
	var memento1 = new Backbone.actAs.Memento(),
		memento2 = new Backbone.actAs.Memento(),
		memento3 = new Backbone.actAs.Memento(),
		memento4 = new Backbone.actAs.Memento(),
		memento5 = new Backbone.actAs.Memento();

	memento1.memento( {one: 'one', two:2});
	memento2.memento( {one: 'one', two:2, three: 'ololo'} );
	memento3.memento( {one: 'one', two: 3} );
	memento4.memento( {one: 'one', two:5, three: 'ololo'} );
	memento5.memento( {one: 'one', three: 'three', four: 'four'} );

	same( memento1.diffKeys(memento1), {changed: [], added: [], deleted: []}, 'Same mementos = no diff' );

	same( memento2.diffKeys(memento1), {changed: [], added: [], deleted: ["three"]}, 'Deleted attribute' );
	same( memento1.diffKeys(memento2), {changed: [], added: ["three"], deleted: []}, 'Added attribute' );

	same( memento1.diffKeys(memento3), {changed: ["two"], added: [], deleted: []}, 'changed value' );
	same( memento3.diffKeys(memento1), {changed: ["two"], added: [], deleted: []}, 'changed value other side' );

	same( memento1.diffKeys(memento4), {changed: ["two"], added: ["three"], deleted: []}, 'changed value and added attribute' );
	same( memento4.diffKeys(memento1), {changed: ["two"], added: [], deleted: ["three"]}, 'the other way around' );

	same( memento2.diffKeys(memento5), {changed: ["three"], added: ["four"], deleted: ["two"]}, 'changed value, added and deleted attributes' );
	same( memento5.diffKeys(memento2), {changed: ["three"], added: ["two"], deleted: ["four"]}, 'the other way around' );

	// flattened keys
	same( memento1.diffKeys(memento1, true), [], 'Same mementos = no diff, flattened' );

	same( memento2.diffKeys(memento1, true), ["three"], 'Deleted attribute, flattened' );
	same( memento1.diffKeys(memento2, true), ["three"], 'Added attribute, flattened' );

	same( memento1.diffKeys(memento3, true), ["two"], 'changed value, flattened' );
	same( memento3.diffKeys(memento1, true), ["two"], 'changed value other side, flattened' );

	same( memento1.diffKeys(memento4, true), ["two", "three"], 'changed value and added attribute, flattened' );
	same( memento4.diffKeys(memento1, true), ["two", "three"], 'the other way around, flattened' );

	same( memento2.diffKeys(memento5, true), ["three", "four", "two"], 'changed value, added and deleted attributes, flattened' );
	same( memento5.diffKeys(memento2, true), ["three", "two", "four"], 'the other way around, flattened' );

} );

test('Non-memento operations', 5, function(){

	var memento = new Backbone.actAs.Memento();

	raises(function(){
		memento.equal(new Date());
	}, 'equal()');

	raises(function(){
		memento.diffAdded(new Date());
	}, 'diffAdded()');

	raises(function(){
		memento.diffChanged(new Date());
	}, 'diffChanged()');

	raises(function(){
		memento.diffDeleted(new Date());
	}, 'diffDeleted()');

	raises(function(){
		memento.diff(new Date());
	}, 'diff()');


});