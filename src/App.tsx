import React, { useState } from 'react';
import { Screen, HDBTransaction } from './types';
import { HDB_TRANSACTIONS } from './data/hdbData';
import { Navbar } from './components/Navbar';
import { ExplorePrices } from './components/ExplorePrices';
import { CompareTowns } from './components/CompareTowns';
import { TransactionDetail } from './components/TransactionDetail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('explore');
  const [selectedTown, setSelectedTown] = useState<string>('ALL');
  const [selectedFlatType, setSelectedFlatType] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<HDBTransaction | null>(
    HDB_TRANSACTIONS[0] // Pre-select first transaction so detail view is immediately available
  );

  const handleSelectTransaction = (tx: HDBTransaction) => {
    setSelectedTransaction(tx);
    setCurrentScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreTownFromCompare = (town: string) => {
    setSelectedTown(town);
    setCurrentScreen('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-slate-900">
      {/* Sticky Top Navbar with Tab Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          setCurrentScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasSelectedTransaction={!!selectedTransaction}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentScreen === 'explore' && (
          <ExplorePrices
            transactions={HDB_TRANSACTIONS}
            selectedTown={selectedTown}
            selectedFlatType={selectedFlatType}
            onTownChange={setSelectedTown}
            onFlatTypeChange={setSelectedFlatType}
            onSelectTransaction={handleSelectTransaction}
          />
        )}

        {currentScreen === 'compare' && (
          <CompareTowns
            transactions={HDB_TRANSACTIONS}
            onExploreTown={handleExploreTownFromCompare}
          />
        )}

        {currentScreen === 'detail' && selectedTransaction && (
          <TransactionDetail
            transaction={selectedTransaction}
            allTransactions={HDB_TRANSACTIONS}
            onBack={() => {
              setCurrentScreen('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectTransaction={handleSelectTransaction}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-700">
            HDB Resale Price Explorer — Singapore Homebuyer & Renter Guide
          </p>
          <p>
            MGMT 6110 Human-AI Collaboration at SMU • Individual Problem Set 1
          </p>
          <p className="text-slate-400 text-[11px]">
            Invented data strictly modeled for educational comparison purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
