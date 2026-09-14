export type Screen = 'explore' | 'compare' | 'detail';

export type FlatType = '3 ROOM' | '4 ROOM' | '5 ROOM' | 'EXECUTIVE';

export interface HDBTransaction {
  id: string;
  town: string;
  flatType: FlatType;
  block: string;
  streetName: string;
  storeyRange: string;
  floorArea: number; // in square metres (sqm)
  resalePrice: number; // in SGD
  pricePerSqm: number; // in SGD/sqm
  remainingLease: string; // e.g. "93 years 04 months"
  remainingLeaseYears: number; // e.g. 93.3
  transactionMonth: string; // e.g. "2024-08"
}

export interface FilterState {
  town: string;
  flatType: string;
  sortBy: 'date_desc' | 'price_desc' | 'price_asc' | 'area_desc';
}

export interface TownSummary {
  town: string;
  medianPrice: number;
  avgPricePerSqm: number;
  transactionCount: number;
  priceChangePercent: number; // % change compared to early period
  highestPrice: number;
  lowestPrice: number;
  flatTypeBreakdown: Record<string, number>;
}
