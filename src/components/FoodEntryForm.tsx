import React, { useState, useId } from 'react';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { FoodType, ActiveFoodListing } from '../types';
import {
  calculateGrossMargin,
  calculateEffectiveTimeToMinimumMs,
  formatPesos,
  formatDurationHoursMinutes,
  BASE_HOURS_MAP,
} from '../utils/markdown';

interface FoodEntryFormProps {
  onAddListing: (listing: ActiveFoodListing) => void;
  currentSimulatedTime: number;
}

export const FoodEntryForm: React.FC<FoodEntryFormProps> = ({
  onAddListing,
  currentSimulatedTime,
}) => {
  const [name, setName] = useState('');
  const [foodType, setFoodType] = useState<FoodType>('Hot prepared meal');
  const [startingPriceStr, setStartingPriceStr] = useState('');
  const [unitCostStr, setUnitCostStr] = useState('');
  const [minimumPriceStr, setMinimumPriceStr] = useState('');
  const [quantityStr, setQuantityStr] = useState('1');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const nameInputId = useId();
  const typeInputId = useId();
  const startingPriceId = useId();
  const unitCostId = useId();
  const minimumPriceId = useId();
  const quantityInputId = useId();

  const startingPrice = parseFloat(startingPriceStr);
  const unitCost = parseFloat(unitCostStr);
  const minimumPrice = parseFloat(minimumPriceStr);
  const quantity = parseInt(quantityStr, 10);

  const hasValidStartPrice = !isNaN(startingPrice) && startingPrice > 0;
  const hasValidUnitCost = !isNaN(unitCost) && unitCost >= 0;
  const hasValidMinPrice =
    !isNaN(minimumPrice) &&
    minimumPrice >= 0 &&
    (!hasValidStartPrice || minimumPrice <= startingPrice);

  // Real-time calculations for feedback
  const startingMargin =
    hasValidStartPrice && hasValidUnitCost
      ? calculateGrossMargin(startingPrice, unitCost)
      : null;

  const minPriceMargin =
    hasValidMinPrice && hasValidUnitCost && minimumPrice > 0
      ? calculateGrossMargin(minimumPrice, unitCost)
      : hasValidMinPrice && hasValidUnitCost && minimumPrice === 0
      ? unitCost === 0
        ? 0
        : -100
      : null;

  const isMinPriceBelowCost =
    hasValidMinPrice && hasValidUnitCost && minimumPrice < unitCost;

  const effectiveDurationMs =
    hasValidStartPrice && hasValidUnitCost
      ? calculateEffectiveTimeToMinimumMs(foodType, startingPrice, unitCost)
      : BASE_HOURS_MAP[foodType] * 3600 * 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Food name is required.';
    }

    if (isNaN(startingPrice) || startingPrice <= 0) {
      newErrors.startingPrice = 'Starting price must be greater than ₱0.00.';
    }

    if (isNaN(unitCost) || unitCost < 0) {
      newErrors.unitCost = 'Unit cost must be ₱0.00 or greater.';
    }

    if (isNaN(minimumPrice) || minimumPrice < 0) {
      newErrors.minimumPrice = 'Minimum price must be ₱0.00 or greater.';
    } else if (!isNaN(startingPrice) && minimumPrice > startingPrice) {
      newErrors.minimumPrice = 'Minimum price cannot exceed starting price.';
    }

    if (isNaN(quantity) || quantity < 1 || !Number.isInteger(Number(quantityStr))) {
      newErrors.quantity = 'Quantity must be a whole number of at least 1.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const effectiveTime = calculateEffectiveTimeToMinimumMs(
      foodType,
      startingPrice,
      unitCost
    );

    const newListing: ActiveFoodListing = {
      id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: trimmedName,
      foodType,
      startingPrice: Math.round(startingPrice * 100) / 100,
      unitCost: Math.round(unitCost * 100) / 100,
      minimumPrice: Math.round(minimumPrice * 100) / 100,
      addedAtSimulatedTime: currentSimulatedTime,
      effectiveTimeToMinimumMs: effectiveTime,
      initialQuantity: quantity,
      remainingQuantity: quantity,
    };

    onAddListing(newListing);

    // Reset form
    setName('');
    setStartingPriceStr('');
    setUnitCostStr('');
    setMinimumPriceStr('');
    setQuantityStr('1');
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
      <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-emerald-600" />
        Add Food
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={nameInputId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Food Name
            </label>
            <input
              id={nameInputId}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Pork Adobo Rice Bowl"
              className={`w-full px-3 py-2 text-sm rounded-md border ${
                errors.name ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
              } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={typeInputId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Food Type
            </label>
            <select
              id={typeInputId}
              value={foodType}
              onChange={(e) => setFoodType(e.target.value as FoodType)}
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Hot prepared meal">Hot prepared meal (Base: 3h)</option>
              <option value="Bakery or pastry">Bakery or pastry (Base: 6h)</option>
              <option value="Chilled prepared food">Chilled prepared food (Base: 10h)</option>
              <option value="Other">Other (Base: 8h)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor={startingPriceId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Starting Price (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm font-medium">
                ₱
              </span>
              <input
                id={startingPriceId}
                type="number"
                step="0.01"
                min="0.01"
                value={startingPriceStr}
                onChange={(e) => {
                  setStartingPriceStr(e.target.value);
                  if (errors.startingPrice)
                    setErrors((prev) => ({ ...prev, startingPrice: '' }));
                }}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 text-sm rounded-md border ${
                  errors.startingPrice ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
              />
            </div>
            {errors.startingPrice && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.startingPrice}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={unitCostId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Unit Cost (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm font-medium">
                ₱
              </span>
              <input
                id={unitCostId}
                type="number"
                step="0.01"
                min="0"
                value={unitCostStr}
                onChange={(e) => {
                  setUnitCostStr(e.target.value);
                  if (errors.unitCost) setErrors((prev) => ({ ...prev, unitCost: '' }));
                }}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 text-sm rounded-md border ${
                  errors.unitCost ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
              />
            </div>
            {errors.unitCost && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.unitCost}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={minimumPriceId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Minimum Price (₱)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 text-sm font-medium">
                ₱
              </span>
              <input
                id={minimumPriceId}
                type="number"
                step="0.01"
                min="0"
                value={minimumPriceStr}
                onChange={(e) => {
                  setMinimumPriceStr(e.target.value);
                  if (errors.minimumPrice)
                    setErrors((prev) => ({ ...prev, minimumPrice: '' }));
                }}
                placeholder="0.00"
                className={`w-full pl-7 pr-3 py-2 text-sm rounded-md border ${
                  errors.minimumPrice ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
                } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
              />
            </div>
            {errors.minimumPrice && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.minimumPrice}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={quantityInputId}
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Quantity
            </label>
            <input
              id={quantityInputId}
              type="number"
              step="1"
              min="1"
              value={quantityStr}
              onChange={(e) => {
                setQuantityStr(e.target.value);
                if (errors.quantity)
                  setErrors((prev) => ({ ...prev, quantity: '' }));
              }}
              placeholder="1"
              className={`w-full px-3 py-2 text-sm rounded-md border ${
                errors.quantity ? 'border-red-500 bg-red-50/20' : 'border-slate-300'
              } focus:outline-hidden focus:ring-2 focus:ring-emerald-500`}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.quantity}</p>
            )}
          </div>
        </div>

        {/* Calculated metrics and alerts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Starting Gross Margin:</span>
            <span
              className={`font-semibold text-sm ${
                startingMargin !== null
                  ? startingMargin < 0
                    ? 'text-red-600'
                    : 'text-emerald-700'
                  : 'text-slate-400'
              }`}
            >
              {startingMargin !== null ? `${startingMargin.toFixed(2)}%` : '—'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Minimum Price Margin:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`font-semibold text-sm ${
                  minPriceMargin !== null
                    ? isMinPriceBelowCost
                      ? 'text-amber-700'
                      : 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {minPriceMargin !== null ? `${minPriceMargin.toFixed(2)}%` : '—'}
              </span>
              {isMinPriceBelowCost && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Below cost
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-500 block">Effective Time to Minimum:</span>
            <span className="font-semibold text-sm text-slate-800">
              {formatDurationHoursMinutes(effectiveDurationMs)}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Food
          </button>
        </div>
      </form>
    </div>
  );
};
