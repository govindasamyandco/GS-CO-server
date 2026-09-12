/**
 * Master Bale Packing Engine — Server-side (CommonJS)
 *
 * Pure JS, no Firebase or React dependencies.
 * Mirrors GS-CO-user/src/utils/packetEngine.js (ES Module version).
 *
 * Algorithm: Best-Fit Decreasing with 120-unit integer capacity scale.
 */

const BALE_CAPACITY_UNITS = 120;

function bundleCapacityUnits(input) {
  const bppVal = typeof input === 'object' && input !== null ? input.bundlesPerPack : input;
  const bpp = Math.round(Number(bppVal) || 0);
  if (!bpp || bpp <= 0) return BALE_CAPACITY_UNITS;
  return Math.round(BALE_CAPACITY_UNITS / bpp);
}

function capacityPercent(units) {
  return Number(((units / BALE_CAPACITY_UNITS) * 100).toFixed(2));
}

function getMaxAdditionalBundles(remainingUnits, capUnitsPerBundle) {
  if (!capUnitsPerBundle || capUnitsPerBundle <= 0) return 0;
  return Math.floor(remainingUnits / capUnitsPerBundle);
}

/**
 * packOrderEngine
 *
 * @param {Array} items   - [{ itemId, title, bundlesPerPack, piecesPerBundle, orderedBundles }]
 * @returns {{ bales, totalBales, totalBundles, totalPieces, orderedBundles }}
 */
function packOrderEngine(items) {
  if (!items || items.length === 0) {
    return { bales: [], totalBales: 0, totalBundles: 0, totalPieces: 0, orderedBundles: 0 };
  }

  const entries = items
    .filter((it) => it.orderedBundles > 0 && it.bundlesPerPack > 0)
    .map((it) => ({
      productId:       it.itemId,
      title:           it.title || it.itemId,
      piecesPerBundle: Number(it.piecesPerBundle || 0),
      capUnits:        bundleCapacityUnits(it.bundlesPerPack),
      remainingBundles: Math.round(Number(it.orderedBundles)),
      orderedBundles:   Math.round(Number(it.orderedBundles))
    }));

  if (entries.length === 0) {
    return { bales: [], totalBales: 0, totalBundles: 0, totalPieces: 0, orderedBundles: 0 };
  }

  entries.sort((a, b) => b.capUnits - a.capUnits);

  const bales = [];
  let baleCounter = 1;

  for (const entry of entries) {
    while (entry.remainingBundles > 0) {
      let bestBale = null;
      let bestRemainingAfterAdd = Infinity;

      for (const bale of bales) {
        const remaining = BALE_CAPACITY_UNITS - bale.capacityUnits;
        const maxCanFit = Math.floor(remaining / entry.capUnits);
        if (maxCanFit <= 0) continue;
        const toAdd = Math.min(entry.remainingBundles, maxCanFit);
        const remainingAfterAdd = remaining - toAdd * entry.capUnits;
        if (remainingAfterAdd < bestRemainingAfterAdd) {
          bestRemainingAfterAdd = remainingAfterAdd;
          bestBale = bale;
        }
      }

      if (!bestBale) {
        bestBale = {
          baleId: 'MB' + String(baleCounter).padStart(3, '0'),
          capacityUnits: 0,
          totalBundles: 0,
          totalPieces: 0,
          items: []
        };
        baleCounter++;
        bales.push(bestBale);
      }

      const remaining  = BALE_CAPACITY_UNITS - bestBale.capacityUnits;
      const maxCanFit  = Math.floor(remaining / entry.capUnits);
      const toAdd      = Math.min(entry.remainingBundles, maxCanFit);
      if (toAdd <= 0) break;

      const addedCapUnits = toAdd * entry.capUnits;
      const addedPieces   = toAdd * entry.piecesPerBundle;

      const existingItem = bestBale.items.find((it) => it.itemId === entry.productId);
      if (existingItem) {
        existingItem.bundleQty     += toAdd;
        existingItem.pieces        += addedPieces;
        existingItem.capacityUnits += addedCapUnits;
      } else {
        bestBale.items.push({
          itemId:        entry.productId,
          title:         entry.title,
          bundleQty:     toAdd,
          pieces:        addedPieces,
          capacityUnits: addedCapUnits
        });
      }

      bestBale.capacityUnits += addedCapUnits;
      bestBale.totalBundles  += toAdd;
      bestBale.totalPieces   += addedPieces;
      entry.remainingBundles -= toAdd;
    }
  }

  for (const bale of bales) {
    bale.capacityPercent          = capacityPercent(bale.capacityUnits);
    bale.remainingCapacityUnits   = BALE_CAPACITY_UNITS - bale.capacityUnits;
    bale.remainingCapacityPercent = capacityPercent(bale.remainingCapacityUnits);
    for (const item of bale.items) {
      item.capacityPercent = capacityPercent(item.capacityUnits);
    }
  }

  const totalBundles = entries.reduce((s, e) => s + e.orderedBundles, 0);
  const totalPieces  = bales.reduce((s, b) => s + b.totalPieces, 0);

  return {
    bales,
    totalBales:     bales.length,
    totalBundles,
    totalPieces,
    orderedBundles: totalBundles
  };
}

module.exports = { packOrderEngine, bundleCapacityUnits, capacityPercent, getMaxAdditionalBundles, BALE_CAPACITY_UNITS };
