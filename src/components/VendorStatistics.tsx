import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';
import { SoldFoodLogItem, ActiveFoodListing } from '../types';
import { formatPesos, calculateCurrentPrice } from '../utils/markdown';

interface VendorStatisticsProps {
  log: SoldFoodLogItem[];
  activeListings: ActiveFoodListing[];
  simulatedTime: number;
}

export const VendorStatistics: React.FC<VendorStatisticsProps> = ({
  log,
  activeListings,
  simulatedTime,
}) => {
  // Sales aggregates
  const totalUnitsSold = log.reduce((acc, item) => acc + (item.quantity ?? 1), 0);
  const totalRevenue = log.reduce(
    (acc, item) => acc + (item.totalRevenue ?? item.soldPrice * (item.quantity ?? 1)),
    0
  );
  const totalCOGS = log.reduce(
    (acc, item) => acc + item.unitCost * (item.quantity ?? 1),
    0
  );
  const totalGrossProfit = log.reduce(
    (acc, item) =>
      acc +
      (item.totalGrossProfit ?? (item.soldPrice - item.unitCost) * (item.quantity ?? 1)),
    0
  );
  const overallGrossMargin =
    totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;

  const belowCostSalesCount = log.filter((item) => item.wasBelowCost).length;

  // Active inventory aggregates
  const totalActiveUnits = activeListings.reduce(
    (acc, item) => acc + (item.remainingQuantity ?? 1),
    0
  );

  const activeCurrentValue = activeListings.reduce((acc, item) => {
    const { currentPrice } = calculateCurrentPrice(item, simulatedTime);
    return acc + currentPrice * (item.remainingQuantity ?? 1);
  }, 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          Performance & Sales Statistics
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Sell Volume */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            Sell Volume
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {totalUnitsSold.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {log.length} transaction{log.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Total Revenue
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {formatPesos(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            COGS: {formatPesos(totalCOGS)}
          </div>
        </div>

        {/* Total Gross Profit */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            Total Gross Profit
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              totalGrossProfit < 0 ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {formatPesos(totalGrossProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Net over unit cost
          </div>
        </div>

        {/* Overall Margin */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            Overall Margin
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              overallGrossMargin < 0 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {log.length > 0 ? `${overallGrossMargin.toFixed(2)}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Realized sales margin
          </div>
        </div>

        {/* Active Inventory */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            Active Inventory
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {totalActiveUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Current: {formatPesos(activeCurrentValue)}
          </div>
        </div>

        {/* Below Cost Sales */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Below Cost Sales
          </div>
          <div
            className={`text-lg font-bold font-mono ${
              belowCostSalesCount > 0 ? 'text-amber-700' : 'text-slate-900'
            }`}
          >
            {belowCostSalesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {belowCostSalesCount > 0 ? 'Sold beneath unit cost' : 'None below cost'}
          </div>
        </div>
      </div>
    </div>
  );
};
