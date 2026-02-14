export interface ProrataItem {
  id: string;
  unitPrice: number;
}

export interface ProrataResult {
  id: string;
  share: number;
}

export function calculateProrataShares(items: ProrataItem[], totalCost: number): ProrataResult[] {
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice, 0);

  const shares = items.map((item) => ({
    id: item.id,
    share: Number(((item.unitPrice / totalPrice) * totalCost).toFixed(2)),
  }));

  // Correction des arrondis sur le dernier item
  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
  const diff = Number((totalCost - totalShares).toFixed(2));
  if (diff !== 0 && shares.length > 0) {
    shares[shares.length - 1].share = Number((shares[shares.length - 1].share + diff).toFixed(2));
  }

  return shares;
}
