import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INDUSTRIES, type Industry } from '../src/data/industries.ts';

/** Every human-readable string in one industry entry, flattened. */
const allText = (i: Industry): string[] => [
  i.name, i.navLabel, i.cardPromise, i.metaTitle, i.metaDescription,
  i.heroTitle, i.heroSub, i.scenario.heading, i.scenario.body,
  ...i.trades,
  ...i.painPoints.flatMap((p) => [p.t, p.d]),
  ...i.services.flatMap((s) => [s.t, s.d]),
  ...i.faqs.flatMap((f) => [f.q, f.a]),
];

test('every slug is unique', () => {
  const slugs = INDUSTRIES.map((i) => i.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('every slug is lowercase, hyphenated and URL safe', () => {
  for (const i of INDUSTRIES) {
    assert.match(i.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${i.slug}`);
  }
});

test('no em dashes anywhere in industry copy', () => {
  for (const i of INDUSTRIES) {
    for (const s of allText(i)) {
      assert.ok(!s.includes('—'), `em dash in ${i.slug}: ${s}`);
    }
  }
});

test('no decorative dot separators in industry copy', () => {
  for (const i of INDUSTRIES) {
    for (const s of allText(i)) {
      assert.ok(!/[·•]/.test(s), `decorative dot in ${i.slug}: ${s}`);
    }
  }
});

test('each industry names at least three real trades', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.trades.length >= 3, `${i.slug} names only ${i.trades.length} trades`);
  }
});

test('each industry has 3 to 5 pain points', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.painPoints.length >= 3 && i.painPoints.length <= 5,
      `${i.slug} has ${i.painPoints.length} pain points`);
  }
});

test('each industry selects 3 to 5 services', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.services.length >= 3 && i.services.length <= 5,
      `${i.slug} has ${i.services.length} services`);
  }
});

test('each industry has 3 to 5 faqs', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.faqs.length >= 3 && i.faqs.length <= 5,
      `${i.slug} has ${i.faqs.length} faqs`);
  }
});

test('meta titles fit the search result window', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.metaTitle.length <= 60, `${i.slug} metaTitle is ${i.metaTitle.length} chars`);
  }
});

test('meta descriptions fit the search snippet window', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.metaDescription.length <= 160,
      `${i.slug} metaDescription is ${i.metaDescription.length} chars`);
  }
});

test('the six pages do not all render the same section shape', () => {
  // Guard against the competitor failure: six pages that are one template with
  // the nouns swapped. Only meaningful once all six entries exist.
  if (INDUSTRIES.length < 6) return;
  const shapes = new Set(
    INDUSTRIES.map((i) => `${i.painPoints.length}-${i.services.length}-${i.faqs.length}`),
  );
  assert.ok(shapes.size >= 3,
    `only ${shapes.size} distinct section shapes across ${INDUSTRIES.length} industries; entries are too uniform`);
});

test('every industry names at least one Australian city somewhere in its copy', () => {
  for (const i of INDUSTRIES) {
    assert.ok(i.cities.length >= 1, `${i.slug} lists no cities`);
    const body = allText(i).join(' ');
    assert.ok(i.cities.some((c) => body.includes(c)),
      `${i.slug} lists cities but names none of them in its copy`);
  }
});
