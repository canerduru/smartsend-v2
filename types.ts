export interface ShippingOption {
  name: string;
  price: number;
  days: number;
  carrier: string;
}

export interface PackageData {
  length: number;
  width: number;
  height: number;
  weight: number;
  description: string;
  confidence: number;
  shippingOptions: ShippingOption[];
}

export enum AppState {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}