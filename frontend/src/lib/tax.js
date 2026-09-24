export function computePph(dpp, t, overrideRate) {
  const base = Number(dpp) || 0;
  if (!t) return 0;
  if (t.mode === "progressive" && t.brackets?.length) {
    let amt = 0, prev = 0;
    for (const b of t.brackets) {
      const top = b.upto == null ? base : Number(b.upto);
      if (base > prev) {
        const taxable = Math.min(base, top) - prev;
        if (taxable > 0) amt += taxable * (Number(b.rate) / 100);
        prev = top;
      } else break;
    }
    return amt;
  }
  const rate = overrideRate != null ? overrideRate : t.rate || 0;
  return base * (Number(rate) / 100);
}

export function bracketBreakdown(dpp, t) {
  const base = Number(dpp) || 0;
  const rows = [];
  let prev = 0;
  for (const b of t?.brackets || []) {
    const top = b.upto == null ? base : Number(b.upto);
    if (base <= prev) break;
    const taxable = Math.min(base, top) - prev;
    if (taxable > 0) rows.push({ rate: b.rate, taxable, tax: taxable * (Number(b.rate) / 100) });
    prev = top;
  }
  return rows;
}
