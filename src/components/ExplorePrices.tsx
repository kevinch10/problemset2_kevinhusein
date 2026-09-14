import React, { useMemo, useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Calendar,
  Clock,
  Maximize2,
} from 'lucide-react';
import { HDBTransaction } from '../types';
import { AVAILABLE_TOWNS, AVAILABLE_FLAT_TYPES } from '../data/hdbData';
import {
  calculateMedian,
  formatSGD,
  formatCompactSGD,
  formatMonth,
  getMonthlyTrends,
} from '../utils/calculations';
import { PriceTrendChart } from './PriceTrendChart';

interface ExplorePricesProps {
  transactions: HDBTransaction[];
  selectedTown: string;
  selectedFlatType: string;
  onTownChange: (town: string) => void;
  onFlatTypeChange: (flatType: string) => void;
  onSelectTransaction: (tx: HDBTransaction) => void;
}

export const ExplorePrices: React.FC<ExplorePricesProps> = ({
  transactions,
  selectedTown,
  selectedFlatType,
  onTownChange,
  onFlatTypeChange,
  onSelectTransaction,
}) => {
  const [sortBy, setSortBy] = useState<'date_desc' | 'price_desc' | 'price_asc' | 'area_desc'>(
    'date_desc'
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchTown = selectedTown === 'ALL' || tx.town === selectedTown;
      const matchType = selectedFlatType === 'ALL' || tx.flatType === selectedFlatType;
      return matchTown && matchType;
    });
  }, [transactions, selectedTown, selectedFlatType]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    switch (sortBy) {
      case 'date_desc':
        return list.sort((a, b) => b.transactionMonth.localeCompare(a.transactionMonth));
      case 'price_desc':
        return list.sort((a, b) => b.resalePrice - a.resalePrice);
      case 'price_asc':
        return list.sort((a, b) => a.resalePrice - b.resalePrice);
      case 'area_desc':
        return list.sort((a, b) => b.floorArea - a.floorArea);
      default:
        return list;
    }
  }, [filteredTransactions, sortBy]);

  // Pagination configuration (capped at 30 flats per page)
  const PAGE_SIZE = 30;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTown, selectedFlatType, sortBy]);

  const totalPages = Math.ceil(sortedTransactions.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, sortedTransactions.length);

  const paginatedTransactions = useMemo(() => {
    return sortedTransactions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedTransactions, startIndex]);

  // Key Summary Information
  const prices = useMemo(() => filteredTransactions.map((t) => t.resalePrice), [filteredTransactions]);
  const medianPrice = useMemo(() => calculateMedian(prices), [prices]);
  const highestPrice = useMemo(() => (prices.length ? Math.max(...prices) : 0), [prices]);
  const lowestPrice = useMemo(() => (prices.length ? Math.min(...prices) : 0), [prices]);
  const transactionCount = filteredTransactions.length;

  // Monthly trends for the chart
  const trendPoints = useMemo(() => getMonthlyTrends(filteredTransactions), [filteredTransactions]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Title & Intro */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Explore HDB Resale Prices
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Filter by Singapore town and flat type to understand current resale valuations, historical price trends, and recent transaction records.
        </p>
      </div>

      {/* Filter Controls Card */}
      <section
        id="filter-controls-section"
        aria-label="Filter Controls"
        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Filter Transactions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Town Filter */}
          <div>
            <label htmlFor="select-town" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Town / Location
            </label>
            <select
              id="select-town"
              value={selectedTown}
              onChange={(e) => onTownChange(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              {AVAILABLE_TOWNS.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Towns across Singapore' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="select-sort" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sort Transactions By
            </label>
            <select
              id="select-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="date_desc">Most Recent Month First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="area_desc">Floor Area: Largest First</option>
            </select>
          </div>
        </div>

        {/* Flat Type Filter Chips */}
        <div>
          <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Flat Type
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Flat Type Selection">
            {AVAILABLE_FLAT_TYPES.map((type) => {
              const isActive = selectedFlatType === type;
              return (
                <button
                  key={type}
                  id={`filter-flat-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onFlatTypeChange(type)}
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Flat Types' : type}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Summary Information - 4 Metrics */}
      <section aria-label="Key Summary Information">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Key Summary Information
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Based on {transactionCount} recorded sales
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Median Resale Price */}
          <div
            id="summary-median-price"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
              <span>Median Resale Price</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {transactionCount > 0 ? formatSGD(medianPrice) : '—'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Midpoint valuation for selected flats
            </div>
          </div>

          {/* Number of Transactions */}
          <div
            id="summary-tx-count"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
              <span>Transactions</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {transactionCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Recent recorded resale transactions
            </div>
          </div>

          {/* Highest Transaction Price */}
          <div
            id="summary-highest-price"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
              <span>Highest Price</span>
              <ArrowUpRight className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {transactionCount > 0 ? formatSGD(highestPrice) : '—'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Top recorded sale in filter
            </div>
          </div>

          {/* Lowest Transaction Price */}
          <div
            id="summary-lowest-price"
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
              <span>Lowest Price</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              {transactionCount > 0 ? formatSGD(lowestPrice) : '—'}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Most accessible entry sale
            </div>
          </div>
        </div>
      </section>

      {/* Simple Price Trend Chart */}
      <section aria-label="Price Trend Chart">
        <PriceTrendChart
          trendPoints={trendPoints}
          town={selectedTown}
          flatType={selectedFlatType}
        />
      </section>

      {/* Recent Resale Transactions List */}
      <section aria-label="Recent Resale Transactions List" id="recent-transactions-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div>
            <h3 id="recent-transactions-heading" className="text-base sm:text-lg font-bold text-slate-900">
              Recent Resale Transactions
            </h3>
            <p className="text-xs text-slate-500">
              {sortedTransactions.length > PAGE_SIZE ? (
                <>
                  Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{sortedTransactions.length}</strong> recorded flats (capped at 30 per page).
                </>
              ) : (
                <>
                  Showing <strong>{sortedTransactions.length}</strong> recorded flats.
                </>
              )}{' '}
              Tap any transaction to inspect details & comparable sales.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Sorted by:{' '}
            {sortBy === 'date_desc'
              ? 'Most Recent'
              : sortBy === 'price_desc'
              ? 'Price (High to Low)'
              : sortBy === 'price_asc'
              ? 'Price (Low to High)'
              : 'Largest Area'}
          </span>
        </div>

        {sortedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <Building className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="font-semibold text-slate-800">No transactions match the selected filters</p>
            <p className="text-xs text-slate-500 mt-1">
              Try switching Town to "All Towns" or Flat Type to "All Flat Types".
            </p>
            <button
              onClick={() => {
                onTownChange('ALL');
                onFlatTypeChange('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer min-h-[44px]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTransactions.map((tx) => (
              <div
                key={tx.id}
                id={`tx-row-${tx.id}`}
                onClick={() => onSelectTransaction(tx)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-400 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTransaction(tx);
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left block: Location & Flat Type */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                        {tx.town}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {tx.flatType}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Storey {tx.storeyRange}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      Blk {tx.block} {tx.streetName}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                        <strong>{tx.floorArea} sqm</strong> ({Math.round(tx.floorArea * 10.764)} sqft)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Lease: {tx.remainingLease}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Sold: {formatMonth(tx.transactionMonth)}
                      </span>
                    </div>
                  </div>

                  {/* Right block: Price & CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                        {formatSGD(tx.resalePrice)}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {formatSGD(tx.pricePerSqm)} / sqm
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-amber-600 sm:mt-2">
                      <span>Inspect Flat</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                id="pagination-controls"
                className="mt-6 p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                  Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> (showing {startIndex + 1}–{endIndex} of {sortedTransactions.length} flats)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="prev-page-button"
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      document.getElementById('recent-transactions-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPage <= 1}
                    className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors min-h-[44px] cursor-pointer ${
                      currentPage <= 1
                        ? 'border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Page</span>
                  </button>

                  <button
                    id="next-page-button"
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      document.getElementById('recent-transactions-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={currentPage >= totalPages}
                    className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors min-h-[44px] cursor-pointer ${
                      currentPage >= totalPages
                        ? 'border border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                    }`}
                    aria-label="Next Page"
                  >
                    <span>Next Page</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
