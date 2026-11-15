import React from 'react';
import { X, HelpCircle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg bg-white p-6 shadow-2xl border border-slate-200 text-slate-800 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 id="guide-title" className="text-base font-semibold text-slate-900">
              Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 leading-relaxed">
          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Base Decay Timelines</h3>
            <p className="text-slate-600 mb-2">
              Each food classification has a default duration to decay from its starting price down
              to its designated minimum price:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-900">Hot prepared meal:</span> 3 hours
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-900">Bakery or pastry:</span> 6 hours
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-900">Chilled prepared food:</span> 10 hours
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="font-medium text-slate-900">Other:</span> 8 hours
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Gross Margin Adjustment</h3>
            <p className="text-slate-600">
              The starting gross margin is derived as{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                ((Starting Price - Unit Cost) / Starting Price) × 100
              </code>
              . Items with higher margins markdown faster to stimulate purchase, while tighter
              margin items preserve value longer:
            </p>
            <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
              effective time = base time × (1.25 - 0.50 × m)
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Quadratic Markdown Curve</h3>
            <p className="text-slate-600">
              The price reduces gently early on and accelerates as expiration approaches:
            </p>
            <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono">
              current price = starting price - (starting price - minimum price) × t²
            </div>
            <p className="text-slate-600 mt-1.5">
              The minimum price serves as a strict floor. Reversing simulated time calculates along
              the identical trajectory, elevating the active price back to its starting level.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Batch Quantities & Sold Logging</h3>
            <p className="text-slate-600">
              Vendors can input a batch quantity when adding items. For active multi-unit listings,
              you can sell individual units or multiple units simultaneously. Each transaction logs
              the exact simulated timestamp, unit sold price, batch revenue, and profit into the
              Price Log. Sold quantities cease further price adjustments.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Performance & Sales Statistics</h3>
            <p className="text-slate-600">
              The statistics section at the bottom provides an aggregate view of total units sold,
              cumulative gross revenue, cost of goods sold (COGS), net gross profit, realized margin,
              and live active inventory market value.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-slate-900 mb-1">Repeating Simulation Controls</h3>
            <p className="text-slate-600">
              The bottom bar allows running time in reverse or accelerating forward:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 mt-1 text-xs">
              <li>
                <strong>Fast Forward:</strong> Clicking repeatedly doubles speed: 2× → 4× → 8× → 16× → 32× → 64× → 128× → 256× → 512× → 1024× (and wraps back to 2×).
              </li>
              <li>
                <strong>Reverse:</strong> Clicking toggles and steps reverse speed between 1× and 2×.
              </li>
              <li>
                <strong>Pause / Resume & 1× Normal:</strong> Freeze simulated time or reset directly to real-time 1× forward rate.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
