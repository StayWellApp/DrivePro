export type VehicleHealthStatus = 'ok' | 'warning' | 'overdue';

export function getVehicleHealthStatus(vehicle: {
  current_mileage: number;
  nextServiceMileage: number | null;
  nextServiceDate: Date | null;
  stk_expiry: Date | null;
}): VehicleHealthStatus {
  const today = new Date();
  const alertThresholdKm = 500;
  const alertThresholdDays = 30;

  // Check mileage
  if (vehicle.nextServiceMileage) {
    const diff = vehicle.nextServiceMileage - vehicle.current_mileage;
    if (diff <= 0) return 'overdue';
    if (diff <= alertThresholdKm) return 'warning';
  }

  // Check service date
  if (vehicle.nextServiceDate) {
    const diffDays = (new Date(vehicle.nextServiceDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= alertThresholdDays) return 'warning';
  }

  // Check STK
  if (vehicle.stk_expiry) {
    const diffDays = (new Date(vehicle.stk_expiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= alertThresholdDays) return 'warning';
  }

  return 'ok';
}
