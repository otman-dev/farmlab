// Test the microclimate metrics computation
import { computeMicroclimateMetrics } from '../lib/microclimateMetrics';

const testData = {
  Ti: 28.4, // inside temperature (°C)
  Hi: 62,   // inside relative humidity (%)
  To: 21.1, // outside temperature (°C)
  Ho: 44    // outside relative humidity (%)
};

const metrics = computeMicroclimateMetrics(testData);

console.log('Microclimate Metrics Test Results:');
console.log('=====================================');
console.log('Input Data:', testData);
console.log('Computed Metrics:', JSON.stringify(metrics, null, 2));

// Expected approximate values for verification
console.log('\nExpected Ranges:');
console.log('- deltaT: ~7.3°C');
console.log('- dewPointInside: ~20.2°C');
console.log('- dewPointOutside: ~9.8°C');
console.log('- vaporPressureDeficit: ~1.01 kPa');
console.log('- temperatureHumidityIndex: ~76.5');
console.log('- cropVPDStatus: optimal');
console.log('- condensationRisk: false');
console.log('- insulationPerformance: good');