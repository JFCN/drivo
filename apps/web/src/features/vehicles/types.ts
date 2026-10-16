export const FUELS = ['GASOLINE', 'ETHANOL', 'FLEX', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG'] as const;

export const VEHICLE_TYPES = ['CAR', 'MOTORCYCLE', 'PICKUP', 'TRUCK', 'VAN'] as const;

export type Fuel = (typeof FUELS)[number];

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type Vehicle = {
  id: string;
  plate: string;
  renavam: string;
  chassis: string;
  brand: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  fuel: Fuel;
  type: VehicleType;
  nickname: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VehicleList = {
  data: Vehicle[];
  total: number;
};

export type VehicleInput = Omit<Vehicle, 'id' | 'photoUrl' | 'createdAt' | 'updatedAt'>;

export type CrlvExtraction = {
  [Key in keyof Omit<VehicleInput, 'nickname'>]: VehicleInput[Key] | null;
};
