import React, { useState } from 'react';
import { ShoppingBag, CheckCircle, AlertTriangle, Clock, Layers } from 'lucide-react';
import { ActiveFoodListing, SoldFoodLogItem } from '../types';
import {
  calculateCurrentPrice,
  formatPesos,
  formatDurationHoursMinutes,
} from '../utils/markdown';

interface ActiveFoodListProps {
  listings: ActiveFoodListing[];
  simulatedTime: number;
  onMarkSold: (
    soldItem: SoldFoodLogItem,
    originalListingId: string,
    quantitySold: number
  ) => void;
}

export const ActiveFoodList: React.FC<ActiveFoodListProps> = ({
  listings,
  simulatedTime,
  onMarkSold,
}) => {
  const [sellQuantities, setSellQuantities] = useState<{ [id: string]: number }>({});

  const getSellQty = (item: ActiveFoodListing): number => {
    const raw = sellQuantities[item.id];
    const available = item.remainingQuantity ?? 1;
    if (typeof raw !== 'number' || isNaN(raw) || raw < 1) return 1;
    return Math.min(raw, available);
  };

  const handleQtyChange = (id: string, value: number, max: number) => {
    const clamped = Math.max(1, Math.min(value, max));
    setSellQuantities((prev) => ({ ...prev, [id]: clamped }));
  };

  const handleSoldClick = (item: ActiveFoodListing, qtyToSell: number) => {
    const { currentPrice, currentMargin, isBelowCost } = calculateCurrentPrice(
      item,
      simulatedTime
    );

    const grossProfit = Math.round((currentPrice - item.unitCost) * 100) / 100;
    const totalRevenue = Math.round(currentPrice * qtyToSell * 100) / 100;
    const totalGrossProfit = Math.round(grossProfit * qtyToSell * 100) / 100;

    const soldRecord: SoldFoodLogItem = {
      id: `sold-${item.id}-${Math.round(simulatedTime)}-${Math.random().toString(36).slice(2, 6)}`,
      name: item.name,
      foodType: item.foodType,
      startingPrice: item.startingPrice,
      unitCost: item.unitCost,
      minimumPrice: item.minimumPrice,
      soldPrice: currentPrice,
      soldSimulatedTime: simulatedTime,
      grossProfit,
      grossMargin: currentMargin,
      wasBelowCost: isBelowCost,
      quantity: qtyToSell,
      totalRevenue,
      totalGrossProfit,
    };

    onMarkSold(soldRecord, item.id, qtyToSell);

    // Reset local sell quantity
    setSellQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          Active Food Listings ({listings.length})
        </h2>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          No active food listings. Add an item above to begin dynamic markdown tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((item) => {
            const availableQty = item.remainingQuantity ?? 1;
            const currentSellQty = getSellQty(item);

            const { currentPrice, currentMargin, isBelowCost, t, remainingMs } =
              calculateCurrentPrice(item, simulatedTime);

            const isAtMinimum = t >= 1 || currentPrice <= item.minimumPrice;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded">
                          {item.foodType}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <Layers className="w-3 h-3 text-indigo-600" />
                          {availableQty} available
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-emerald-700 tracking-tight">
                        {formatPesos(currentPrice)}
                      </div>
                      {isAtMinimum && (
                        <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">
                          Floor Price Reached
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-200 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Starting Price:</span>
                      <span className="font-medium text-slate-800">
                        {formatPesos(item.startingPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Unit Cost:</span>
                      <span className="font-medium text-slate-800">
                        {formatPesos(item.unitCost)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Minimum Price:</span>
                      <span className="font-medium text-slate-800">
                        {formatPesos(item.minimumPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200/70">
                      <span className="font-semibold text-slate-700">
                        Current Gross Margin:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold font-mono ${
                            isBelowCost ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {currentMargin.toFixed(2)}%
                        </span>
                        {isBelowCost && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Below cost
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Time to Floor:
                      </span>
                      <span className="font-mono text-slate-700">
                        {isAtMinimum ? '0m' : formatDurationHoursMinutes(remainingMs)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Action Section */}
                <div className="pt-3 space-y-2">
                  {availableQty > 1 && (
                    <div className="flex items-center justify-between gap-2 text-xs bg-white p-1.5 rounded-md border border-slate-200">
                      <span className="text-slate-600 font-medium pl-1">Qty to Sell:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(item.id, currentSellQty - 1, availableQty)
                          }
                          disabled={currentSellQty <= 1}
                          className="w-6 h-6 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={availableQty}
                          value={currentSellQty}
                          onChange={(e) =>
                            handleQtyChange(
                              item.id,
                              parseInt(e.target.value, 10) || 1,
                              availableQty
                            )
                          }
                          className="w-12 text-center text-xs font-mono font-semibold py-0.5 border border-slate-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(item.id, currentSellQty + 1, availableQty)
                          }
                          disabled={currentSellQty >= availableQty}
                          className="w-6 h-6 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 font-bold flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.id, availableQty, availableQty)}
                          className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          All
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSoldClick(item, currentSellQty)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Sold {availableQty > 1 ? `(${currentSellQty} of ${availableQty})` : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
