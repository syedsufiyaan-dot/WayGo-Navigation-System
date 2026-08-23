export interface User {
  id: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface TransitLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  areaType: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO' | 'WALK';
  fromStop: string;
  toStop: string;
  distanceKm: number;
  durationMins: number;
  lineName?: string;
}

export interface RouteOption {
  id: string;
  mode: 'BUS' | 'TRAIN' | 'METRO' | 'AUTO' | 'MULTIMODAL';
  modeLabel: string;
  source: string;
  destination: string;
  totalTimeMins: number;
  totalDistanceKm: number;
  totalFareInr: number;
  routeName: string;
  boardingLocation: string;
  destinationStop: string;
  frequency: string;
  interchanges: number;
  trafficLevel: 'Low' | 'Moderate' | 'Heavy';
  steps: RouteStep[];
  pathCoordinates: [number, number][];
  isFastest?: boolean;
  isCheapest?: boolean;
  isShortest?: boolean;
  estimatedTrafficNote: string;
}

export interface ComparisonChartItem {
  mode: string;
  timeMins: number;
  fareInr: number;
  distanceKm: number;
}

export interface RouteCalculationResponse {
  source: TransitLocation;
  destination: TransitLocation;
  summary: {
    fastest: RouteOption;
    cheapest: RouteOption;
    shortest: RouteOption;
  };
  routes: RouteOption[];
  totalRoutesCount: number;
  comparisonChart: ComparisonChartItem[];
}

export interface FavoriteRoute {
  id: string;
  userId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  preferredMode: string;
  createdAt: string;
  sourceLocation: TransitLocation;
  destinationLocation: TransitLocation;
}

export interface RouteHistoryItem {
  id: string;
  userId: string;
  sourceLocationId: string;
  destinationLocationId: string;
  selectedMode: string;
  selectedPreference: string;
  searchedAt: string;
  sourceLocation: TransitLocation;
  destinationLocation: TransitLocation;
}
