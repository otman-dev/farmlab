export interface MicroclimateMetrics {
  // Thermal Metrics
  deltaT: number; // °C
  thermalStability: number; // stability indicator (0-1)
  thermalLag: number | null; // placeholder for future
  heatingDegreeHours: number; // °C·h
  coolingDegreeHours: number; // °C·h

  // Hygrometric Metrics
  dewPointInside: number; // °C
  dewPointOutside: number; // °C
  absoluteHumidityInside: number; // g/m³
  absoluteHumidityOutside: number; // g/m³
  vaporPressureInside: number; // kPa
  vaporPressureOutside: number; // kPa
  vaporPressureDeficit: number; // kPa
  humidityGradient: number; // %
  condensationRisk: boolean;

  // Comfort and Agronomic Indices
  temperatureHumidityIndex: number; // THI
  cropVPDStatus: 'too low' | 'optimal' | 'too high';

  // Derived Qualitative Indicators
  insulationPerformance: 'good' | 'moderate' | 'poor';
  ventilationEfficiency: 'good' | 'moderate' | 'poor';
}

export interface SensorData {
  Ti: number; // inside temperature (°C)
  Hi: number; // inside relative humidity (%)
  To: number; // outside temperature (°C)
  Ho: number; // outside relative humidity (%)
}

// Helper functions for psychrometric calculations
function calculateDewPoint(temperature: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
}

function calculateSaturationVaporPressure(temperature: number): number {
  return 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
}

function calculateActualVaporPressure(temperature: number, humidity: number): number {
  const svp = calculateSaturationVaporPressure(temperature);
  return (humidity / 100) * svp;
}

function calculateAbsoluteHumidity(vaporPressure: number, temperature: number): number {
  return 216.7 * (vaporPressure * 10) / (temperature + 273.15);
}

function calculateVaporPressureDeficit(temperature: number, humidity: number): number {
  const svp = calculateSaturationVaporPressure(temperature);
  const avp = calculateActualVaporPressure(temperature, humidity);
  return svp - avp;
}

function calculateTemperatureHumidityIndex(temperature: number, humidity: number): number {
  return temperature - (0.55 - 0.0055 * humidity) * (temperature - 14.5);
}

function evaluateCropVPDStatus(vpd: number): 'too low' | 'optimal' | 'too high' {
  if (vpd < 0.4) return 'too low';
  if (vpd > 1.5) return 'too high';
  if (vpd >= 0.8 && vpd <= 1.2) return 'optimal';
  return 'optimal'; // Default to optimal for values between 0.4-0.8 and 1.2-1.5
}

function evaluateInsulationPerformance(deltaT: number): 'good' | 'moderate' | 'poor' {
  const absDeltaT = Math.abs(deltaT);
  if (absDeltaT >= 5) return 'good';
  if (absDeltaT >= 2) return 'moderate';
  return 'poor';
}

function evaluateVentilationEfficiency(deltaHumidity: number, deltaTemp: number): 'good' | 'moderate' | 'poor' {
  const absDeltaHumidity = Math.abs(deltaHumidity);
  const absDeltaTemp = Math.abs(deltaTemp);

  // Good ventilation: significant humidity difference with moderate temperature difference
  if (absDeltaHumidity >= 15 && absDeltaTemp <= 5) return 'good';
  // Moderate ventilation: some humidity difference
  if (absDeltaHumidity >= 10) return 'moderate';
  // Poor ventilation: minimal humidity exchange
  return 'poor';
}

export function computeMicroclimateMetrics(data: SensorData): MicroclimateMetrics {
  const { Ti, Hi, To, Ho } = data;

  // Thermal Metrics
  const deltaT = Ti - To;
  const thermalStability = 0.8; // Placeholder - would need historical data for real calculation
  const thermalLag = null; // Placeholder for future implementation
  const heatingDegreeHours = Ti < 18 ? 18 - Ti : 0;
  const coolingDegreeHours = Ti > 24 ? Ti - 24 : 0;

  // Hygrometric Metrics
  const dewPointInside = calculateDewPoint(Ti, Hi);
  const dewPointOutside = calculateDewPoint(To, Ho);

  const vaporPressureInside = calculateActualVaporPressure(Ti, Hi);
  const vaporPressureOutside = calculateActualVaporPressure(To, Ho);

  const absoluteHumidityInside = calculateAbsoluteHumidity(vaporPressureInside, Ti);
  const absoluteHumidityOutside = calculateAbsoluteHumidity(vaporPressureOutside, To);

  const vaporPressureDeficit = calculateVaporPressureDeficit(Ti, Hi);
  const humidityGradient = Hi - Ho;
  const condensationRisk = Ti <= dewPointInside;

  // Comfort and Agronomic Indices
  const temperatureHumidityIndex = calculateTemperatureHumidityIndex(Ti, Hi);
  const cropVPDStatus = evaluateCropVPDStatus(vaporPressureDeficit);

  // Derived Qualitative Indicators
  const insulationPerformance = evaluateInsulationPerformance(deltaT);
  const ventilationEfficiency = evaluateVentilationEfficiency(humidityGradient, deltaT);

  return {
    // Thermal Metrics
    deltaT: Math.round(deltaT * 100) / 100,
    thermalStability,
    thermalLag,
    heatingDegreeHours: Math.round(heatingDegreeHours * 100) / 100,
    coolingDegreeHours: Math.round(coolingDegreeHours * 100) / 100,

    // Hygrometric Metrics
    dewPointInside: Math.round(dewPointInside * 100) / 100,
    dewPointOutside: Math.round(dewPointOutside * 100) / 100,
    absoluteHumidityInside: Math.round(absoluteHumidityInside * 100) / 100,
    absoluteHumidityOutside: Math.round(absoluteHumidityOutside * 100) / 100,
    vaporPressureInside: Math.round(vaporPressureInside * 1000) / 1000,
    vaporPressureOutside: Math.round(vaporPressureOutside * 1000) / 1000,
    vaporPressureDeficit: Math.round(vaporPressureDeficit * 1000) / 1000,
    humidityGradient: Math.round(humidityGradient * 100) / 100,
    condensationRisk,

    // Comfort and Agronomic Indices
    temperatureHumidityIndex: Math.round(temperatureHumidityIndex * 100) / 100,
    cropVPDStatus,

    // Derived Qualitative Indicators
    insulationPerformance,
    ventilationEfficiency
  };
}