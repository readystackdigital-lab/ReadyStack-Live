import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addItem, removeItem, sanitize, resolveItems, totals,
  type CartItem,
} from '../src/scripts/cart-core.ts';

const page = (id: string): CartItem => ({ id, type: 'page' });
const addon = (id: string): CartItem => ({ id, type: 'addon' });
const care = (id: string): CartItem => ({ id, type: 'care' });

test('adding a second page tier replaces the first', () => {
  const items = addItem(addItem([], page('landing')), page('business'));
  assert.deepEqual(items, [page('business')]);
});

test('adding a second care plan replaces the first', () => {
  const items = addItem(addItem([], care('care')), care('careplus'));
  assert.deepEqual(items, [care('careplus')]);
});

test('addon add is idempotent', () => {
  const items = addItem(addItem([], addon('seo')), addon('seo'));
  assert.equal(items.length, 1);
});

test('unknown ids are rejected', () => {
  assert.deepEqual(addItem([], addon('nope')), []);
  assert.deepEqual(addItem([], page('nope')), []);
});

test('removeItem removes by id', () => {
  assert.deepEqual(removeItem([addon('seo'), addon('blog')], 'seo'), [addon('blog')]);
});

test('sanitize drops junk, unknown ids and duplicates', () => {
  const raw = [addon('seo'), addon('seo'), { id: 'zzz', type: 'addon' }, 'junk', null, { id: 'care' }];
  assert.deepEqual(sanitize(raw), [addon('seo')]);
  assert.deepEqual(sanitize('not an array'), []);
});

test('totals: landing + seo + care', () => {
  const t = totals([page('landing'), addon('seo'), care('care')]);
  assert.equal(t.upfrontMin, 1248);
  assert.equal(t.upfrontMax, 1648);
  assert.equal(t.monthly, 99);
  assert.equal(t.hasConsult, false);
  assert.equal(t.count, 3);
});

test('totals: consult items flag but add nothing', () => {
  const t = totals([page('custom'), addon('ecom')]);
  assert.equal(t.upfrontMin, 0);
  assert.equal(t.hasConsult, true);
});

test('resolveItems formats page, addon, consult and flagOnly', () => {
  const rs = resolveItems([page('landing'), addon('seo'), addon('ecom'), addon('email')]);
  assert.equal(rs[0].priceText, 'from $799–$1,199');
  assert.equal(rs[1].priceText, '+$449');
  assert.equal(rs[2].priceText, 'Custom quote');
  assert.equal(rs[3].priceText, 'Included in quote');
});
