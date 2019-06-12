import test from 'ava';
import memoria from '.';

test('title', t => {
	const err = t.throws(() => {
		memoria(123);
	}, TypeError);
	t.is(err.message, 'Expected a string, got number');

	t.is(memoria('unicorns'), 'unicorns & rainbows');
});
