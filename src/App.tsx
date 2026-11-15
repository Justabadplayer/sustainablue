/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import { ActiveFoodListing, SoldFoodLogItem } from './types';
import { useSimulatedClock } from './hooks/useSimulatedClock';
import { FoodEntryForm } from './components/FoodEntryForm';
import { ActiveFoodList } from './components/ActiveFoodList';
import { PriceLogTable } from './components/PriceLogTable';
import { VendorStatistics } from './components/VendorStatistics';
import { TimeControlsBar } from './components/TimeControlsBar';
import { GuideModal } from './components/GuideModal';

const STORAGE_KEY_ACTIVE = 'dmp_active_listings';
const STORAGE_KEY_LOG = 'dmp_price_log';

export default function App() {
  const {
    simulatedTime,
    rate,
    isPaused,
    setSpeedAndDirection,
    togglePause,
    stepFastForward,
    stepReverse,
  } = useSimulatedClock();

  const [activeListings, setActiveListings] = useState<ActiveFoodListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            initialQuantity: item.initialQuantity ?? item.quantity ?? 1,
            remainingQuantity: item.remainingQuantity ?? item.quantity ?? 1,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [priceLog, setPriceLog] = useState<SoldFoodLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            quantity: item.quantity ?? 1,
            totalRevenue: item.totalRevenue ?? item.soldPrice * (item.quantity ?? 1),
            totalGrossProfit:
              item.totalGrossProfit ??
              (item.soldPrice - item.unitCost) * (item.quantity ?? 1),
          }));
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Sync active listings to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeListings));
    } catch {
      // Ignore
    }
  }, [activeListings]);

  // Sync price log to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(priceLog));
    } catch {
      // Ignore
    }
  }, [priceLog]);

  const handleAddListing = (listing: ActiveFoodListing) => {
    setActiveListings((prev) => [...prev, listing]);
  };

  const handleMarkSold = (
    soldItem: SoldFoodLogItem,
    originalListingId: string,
    quantitySold: number
  ) => {
    setActiveListings((prev) =>
      prev
        .map((item) => {
          if (item.id === originalListingId) {
            const rem = (item.remainingQuantity ?? 1) - quantitySold;
            return rem > 0 ? { ...item, remainingQuantity: rem } : null;
          }
          return item;
        })
        .filter((item): item is ActiveFoodListing => item !== null)
    );
    setPriceLog((prev) => [soldItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-32 sm:pb-28">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Dynamic Markdown Calculator and Price Log
          </h1>

          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-md transition-colors cursor-pointer border border-slate-300"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            Guide
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Food-entry form */}
        <FoodEntryForm
          onAddListing={handleAddListing}
          currentSimulatedTime={simulatedTime}
        />

        {/* Active food listings */}
        <ActiveFoodList
          listings={activeListings}
          simulatedTime={simulatedTime}
          onMarkSold={handleMarkSold}
        />

        {/* Price Log */}
        <PriceLogTable log={priceLog} />

        {/* Vendor Statistics at bottom area */}
        <VendorStatistics
          log={priceLog}
          activeListings={activeListings}
          simulatedTime={simulatedTime}
        />
      </main>

      {/* Guide Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Fixed Bottom Time Controls */}
      <TimeControlsBar
        simulatedTime={simulatedTime}
        rate={rate}
        isPaused={isPaused}
        onStepFastForward={stepFastForward}
        onStepReverse={stepReverse}
        onSetNormalSpeed={() => setSpeedAndDirection(1)}
        onTogglePause={togglePause}
      />
    </div>
  );
}
