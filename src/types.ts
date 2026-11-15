export type FoodType =
  | 'Hot prepared meal'
  | 'Bakery or pastry'
  | 'Chilled prepared food'
  | 'Other';

export interface ActiveFoodListing {
  id: string;
  name: string;
  foodType: FoodType;
  startingPrice: number;
  unitCost: number;
  minimumPrice: number;
  addedAtSimulatedTime: number;
  effectiveTimeToMinimumMs: number;
  initialQuantity: number;
  remainingQuantity: number;
}

export interface SoldFoodLogItem {
  id: string;
  name: string;
  foodType: FoodType;
  startingPrice: number;
  unitCost: number;
  minimumPrice: number;
  soldPrice: number;
  soldSimulatedTime: number;
  grossProfit: number;
  grossMargin: number;
  wasBelowCost: boolean;
  quantity: number;
  totalRevenue: number;
  totalGrossProfit: number;
}

export type SimRate = number;

