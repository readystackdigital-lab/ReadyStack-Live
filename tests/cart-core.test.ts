import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRICING, BUNDLES } from '../src/data/pricing.ts';
import {
  addItem, removeItem, sanitize, resolveItems, totals,
  type CartItem,
} from '../src/scripts/cart-core.ts';

const page = (id: string): CartItem => ({ id, type: 'page' });
const addon = (id: string): CartItem => ({ id, type: 'addon' });
const care = (id: string): CartItem => ({ id, type: 'care' });
const bundle = (id: string): CartItem => ({ id, type: 'bundle' });

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
  assert.deepEqual(addItem([], { id: 'seo', type: 'bundle' }), []);
});

test('bundle removes members, other bundles, page and care; keeps non-member addons', () => {
  let items: CartItem[] = [page('landing'), addon('seo'), addon('ai'), care('careplus'), bundle('launch')];
  items = addItem(items.slice(0, 4), bundle('launch')); // launch includes landing, seo, care
  assert.deepEqual(items, [addon('ai'), bundle('launch')]);
  items = addItem(items, bundle('growth-engine'));
  assert.deepEqual(items, [addon('ai'), bundle('growth-engine')]);
});

test('adding a page or care after a bundle replaces the bundle', () => {
  assert.deepEqual(addItem([bundle('launch')], page('growth')), [page('growth')]);
  assert.deepEqual(addItem([bundle('launch')], care('care')), [care('care')]);
});

test('addon already covered by a bundle is a no-op', () => {
  const items = [bundle('launch')]; // includes seo
  assert.deepEqual(addItem(items, addon('seo')), items);
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
  assert.equal(t.upfrontMin, 1450);
  assert.equal(t.upfrontMax, 1850);
  assert.equal(t.monthly, 100);
  assert.equal(t.hasConsult, false);
  assert.equal(t.count, 3);
});

test('totals: consult items flag but add nothing', () => {
  const t = totals([page('custom'), addon('ecom')]);
  assert.equal(t.upfrontMin, 0);
  assert.equal(t.hasConsult, true);
});

test('totals: bundle uses bundle upfront and monthly', () => {
  const t = totals([bundle('ai-front-desk')]);
  assert.equal(t.upfrontMin, 3735);
  assert.equal(t.upfrontMax, 3735);
  assert.equal(t.monthly, 299);
});

test('every bundle: saving and monthly are consistent with member pricing', () => {
  const find = (id: string) =>
    [...PRICING.pages, ...PRICING.addons, ...PRICING.care].find((e) => e.id === id)!;
  for (const b of BUNDLES) {
    let upfront = 0, monthly = 0;
    for (const id of b.includes) {
      const e = find(id);
      assert.ok(e, `bundle ${b.id} references unknown id ${id}`);
      if (typeof e.min === 'number') upfront += e.min;
      if (typeof e.price === 'number') upfront += e.price;
      if (typeof e.monthly === 'number') monthly += e.monthly;
    }
    assert.equal(b.upfront + b.saving, upfront, `bundle ${b.id} saving math`);
    assert.equal(b.monthly, monthly, `bundle ${b.id} monthly sum`);
  }
});

test('resolveItems formats bundles with contents and saving', () => {
  const [r] = resolveItems([bundle('launch')]);
  assert.equal(r.label, 'Launch Ready');
  assert.equal(r.priceText, 'from $1,300');
  assert.equal(r.monthlyText, '$100/mo');
  assert.equal(r.saving, 150);
  assert.ok(r.includes.includes('SEO setup'));
});

test('resolveItems formats page, addon, consult and flagOnly', () => {
  const rs = resolveItems([page('landing'), addon('seo'), addon('ecom'), addon('email')]);
  assert.equal(rs[0].priceText, 'from $1,000–$1,400');
  assert.equal(rs[1].priceText, '+$450');
  assert.equal(rs[2].priceText, 'Custom quote');
  assert.equal(rs[3].priceText, 'Included in quote');
});
