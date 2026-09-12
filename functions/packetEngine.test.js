/**
 * Automated Unit Test Suite for Master Bale Packing Engine (Best-Fit Decreasing)
 * Usage: node packetEngine.test.js
 */
const assert = require('assert');
const { packOrderEngine, bundleCapacityUnits, capacityPercent, BALE_CAPACITY_UNITS } = require('./packingEngine');

console.log('🧪 Starting Master Bale Packing Engine Unit Tests...\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
    failedTests++;
  }
}

// ─── Test 1: Capacity unit calculations ────────────────────────────────────────
test('bundleCapacityUnits calculates exact integer scale (120 units)', () => {
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 3 }), 40);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 4 }), 30);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 5 }), 24);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 6 }), 20);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 8 }), 15);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 10 }), 12);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 12 }), 10);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 15 }), 8);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 24 }), 5);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 40 }), 3);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 60 }), 2);
  assert.strictEqual(bundleCapacityUnits({ bundlesPerPack: 120 }), 1);
});

// ─── Test 2: Single item filling exactly 1 master bale ─────────────────────────
test('8 bundles of an 8-pack product fills exactly 100% of 1 master bale', () => {
  const items = [{
    itemId: 'MAT_001',
    title: 'Panipat Cotton Mat',
    bundlesPerPack: 8,
    piecesPerBundle: 10,
    orderedBundles: 8
  }];

  const result = packOrderEngine(items);
  assert.strictEqual(result.totalBales, 1);
  assert.strictEqual(result.totalBundles, 8);
  assert.strictEqual(result.totalPieces, 80);
  assert.strictEqual(result.bales[0].capacityUnits, 120);
  assert.strictEqual(Number(result.bales[0].capacityPercent), 100);
  assert.strictEqual(result.bales[0].remainingCapacityUnits, 0);
});

// ─── Test 3: Specification Example (Multi-product mixed order) ─────────────────
test('Mixed order matching specification example packs into 3 bales', () => {
  const items = [
    { itemId: 'M001', title: 'Robomat',    bundlesPerPack: 3,  piecesPerBundle: 50, orderedBundles: 1 },
    { itemId: 'M002', title: '13x19',      bundlesPerPack: 8,  piecesPerBundle: 50, orderedBundles: 2 },
    { itemId: 'M003', title: 'Rubber Mat', bundlesPerPack: 5,  piecesPerBundle: 50, orderedBundles: 3 },
    { itemId: 'M004', title: 'EVA Mat',    bundlesPerPack: 12, piecesPerBundle: 50, orderedBundles: 3 },
    { itemId: 'M005', title: 'Door Mat',   bundlesPerPack: 10, piecesPerBundle: 50, orderedBundles: 1 },
    { itemId: 'M006', title: 'Anti-Slip',  bundlesPerPack: 6,  piecesPerBundle: 50, orderedBundles: 3 }
  ];

  const result = packOrderEngine(items);
  assert.strictEqual(result.totalBales, 3, 'Should pack into exactly 3 Master Bales');
  assert.strictEqual(result.totalBundles, 13);
  assert.strictEqual(result.totalPieces, 650);

  // Verify all bales are within 120 capacity limit
  result.bales.forEach((bale, idx) => {
    assert(bale.capacityUnits <= BALE_CAPACITY_UNITS, `Bale ${idx + 1} exceeds 120 limit`);
  });
});

// ─── Test 4: Empty order handling ─────────────────────────────────────────────
test('Empty items array returns 0 bales gracefully', () => {
  const result = packOrderEngine([]);
  assert.strictEqual(result.totalBales, 0);
  assert.strictEqual(result.totalBundles, 0);
  assert.strictEqual(result.bales.length, 0);
});

// ─── Test 5: Partial fills and remaining capacity ─────────────────────────────
test('1 bundle of 3-pack consumes 40 units (33.33%) with 80 units (66.67%) remaining', () => {
  const items = [{
    itemId: 'M001',
    title: 'Robomat',
    bundlesPerPack: 3,
    piecesPerBundle: 50,
    orderedBundles: 1
  }];

  const result = packOrderEngine(items);
  assert.strictEqual(result.totalBales, 1);
  assert.strictEqual(result.bales[0].capacityUnits, 40);
  assert.strictEqual(Number(result.bales[0].capacityPercent), 33.33);
  assert.strictEqual(result.bales[0].remainingCapacityUnits, 80);
  assert.strictEqual(Number(result.bales[0].remainingCapacityPercent), 66.67);
});

console.log(`\n========================================`);
console.log(`Summary: ${passedTests} Passed, ${failedTests} Failed`);
console.log(`========================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
