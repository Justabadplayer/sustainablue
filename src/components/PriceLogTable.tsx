import React from 'react';
import { History, AlertTriangle } from 'lucide-react';
import { SoldFoodLogItem } from '../types';
import { formatPesos, formatSimulatedDateTime } from '../utils/markdown';

interface PriceLogTableProps {
  log: SoldFoodLogItem[];
}

export const PriceLogTable: React.FC<PriceLogTableProps> = ({ log }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-600" />
          Price Log ({log.length})
        </h2>
      </div>

      {log.length === 0 ? (
        <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
          No sold items recorded yet. Marking an active listing as sold will log it here.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200 tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-2.5">
                  Food Item
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Type
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-center">
                  Qty
                </th>
                <th scope="col" className="px-3.5 py-2.5">
                  Sold Time (Simulated)
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Start Price
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Unit Cost
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Sold Price
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Total Revenue
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Total Profit
                </th>
                <th scope="col" className="px-3.5 py-2.5 text-right">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {log.map((item) => {
                const qty = item.quantity ?? 1;
                const totalRev = item.totalRevenue ?? item.soldPrice * qty;
                const totalProf =
                  item.totalGrossProfit ?? (item.soldPrice - item.unitCost) * qty;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium text-slate-700">
                        {item.foodType}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center font-mono font-semibold text-indigo-700 whitespace-nowrap">
                      {qty}
                    </td>
                    <td className="px-3.5 py-3 text-slate-600 font-mono whitespace-nowrap">
                      {formatSimulatedDateTime(item.soldSimulatedTime)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatPesos(item.startingPrice)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-slate-600 whitespace-nowrap">
                      {formatPesos(item.unitCost)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatPesos(item.soldPrice)}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {formatPesos(totalRev)}
                    </td>
                    <td
                      className={`px-3.5 py-3 text-right font-mono font-semibold whitespace-nowrap ${
                        totalProf < 0 ? 'text-red-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatPesos(totalProf)}
                    </td>
                    <td className="px-3.5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`font-mono font-semibold ${
                            item.wasBelowCost ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {item.grossMargin.toFixed(2)}%
                        </span>
                        {item.wasBelowCost && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Below cost
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
