// Deterministic blockchain simulation — generates realistic-looking on-chain
// data derived purely from the product's id + batch number so it stays
// consistent across page refreshes and users.

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return h >>> 0; // unsigned 32-bit
}

function deterministicHex(seed, bytes = 32) {
  let result = '';
  let state = seed;
  while (result.length < bytes * 2) {
    const n = djb2(state + result.length);
    result += n.toString(16).padStart(8, '0');
    state = result;
  }
  return '0x' + result.slice(0, bytes * 2);
}

function deterministicInt(seed, min, max) {
  return min + (djb2(seed) % (max - min));
}

export function simulateBlockchain(productId, batchNumber, createdAt) {
  const seed = `${productId}:${batchNumber}`;

  const txHash     = deterministicHex(seed + 'tx', 32);
  const certTxHash = deterministicHex(seed + 'cert', 32);
  const wallet     = deterministicHex(seed + 'wallet', 20);
  const blockNum   = deterministicInt(seed + 'block', 12_000_000, 17_000_000);
  const gasUsed    = deterministicInt(seed + 'gas', 68_000, 130_000);
  const dataHash   = deterministicHex(seed + 'data', 32);

  // Simulated registration time: a few minutes after product creation
  const regDate = createdAt
    ? new Date(new Date(createdAt).getTime() + deterministicInt(seed, 120, 600) * 1000)
    : new Date();

  return {
    txHash,
    certTxHash,
    wallet,
    blockNum,
    gasUsed,
    dataHash,
    regDate: regDate.toISOString(),
    network: 'Polygon Amoy Testnet',
    explorerBase: 'https://amoy.polygonscan.com',
  };
}
