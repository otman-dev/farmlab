import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import DeviceModel from '@/models/Device';
import cloudConnPromise from '@/lib/mongoose-cloud-conn';
import { getFoodStockModel } from '@/models/FoodStock.cloud';
import { getMedicalStockModel } from '@/models/MedicalStock.cloud';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const user = session?.user as any;
    
    if (!user || !['admin', 'sponsor'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch device data from local MongoDB
    const devices = await DeviceModel.find().limit(50);
    const now = new Date();

    // Calculate device metrics
    const onlineDevices = devices.filter(device => {
      if (!device.last_seen) return false;
      const diffMinutes = (now.getTime() - new Date(device.last_seen).getTime()) / (1000 * 60);
      return diffMinutes < 5;
    });

    const uptimePercentage = devices.length > 0 ? 
      Math.round((onlineDevices.length / devices.length) * 100) : 0;

    const deviceMetrics = {
      totalDevices: devices.length,
      onlineDevices: onlineDevices.length,
      uptimePercentage,
      dataCollectionRate: Math.round(uptimePercentage * 0.95) // Estimate based on uptime
    };

    // Simulate environmental data (in a real system, this would come from sensors)
    const environmentalData = {
      averageTemperature: 22 + Math.round(Math.random() * 6), // 22-28°C
      humidity: 45 + Math.round(Math.random() * 20), // 45-65%
      lightLevels: 70 + Math.round(Math.random() * 25), // 70-95%
      airQuality: 85 + Math.round(Math.random() * 10), // 85-95%
      trends: {
        temperature: Math.round((Math.random() - 0.5) * 4), // ±2°C
        humidity: Math.round((Math.random() - 0.5) * 10) // ±5%
      }
    };

    // Get stock data for animal welfare calculations
    const conn = await cloudConnPromise;
    const FoodStock = getFoodStockModel(conn);
    const MedicalStock = getMedicalStockModel(conn);

    const [foodStocks, medicalStocks] = await Promise.all([
      FoodStock.find(),
      MedicalStock.find()
    ]);

    // Calculate animal welfare metrics (estimates based on available data)
    const totalFoodItems = foodStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    const totalMedicalItems = medicalStocks.reduce((sum, stock) => sum + (stock.quantity || 0), 0);
    
    const animalWelfare = {
      totalAnimals: Math.round(totalFoodItems / 10), // Estimate based on food stock
      healthScore: Math.min(85 + Math.round(totalMedicalItems / 5), 100),
      feedingEfficiency: Math.min(75 + Math.round(totalFoodItems / 20), 95),
      activityLevels: 80 + Math.round(Math.random() * 15) // 80-95%
    };

    // Calculate operational efficiency
    const operationalEfficiency = {
      resourceUtilization: Math.round(uptimePercentage * 0.9),
      costPerAnimal: Math.round(50 + Math.random() * 30), // $50-80 per animal
      productivityIndex: Math.round(70 + uptimePercentage * 0.25),
      automationLevel: Math.round(deviceMetrics.onlineDevices * 10) // Percentage based on online devices
    };

    // Generate sample alerts
    const alerts = [
      {
        id: '1',
        type: 'warning' as const,
        message: 'Temperature sensor in Zone A showing elevated readings',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
        resolved: false
      },
      {
        id: '2',
        type: 'info' as const,
        message: 'Automatic feeding system completed morning cycle',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString(),
        resolved: true
      },
      {
        id: '3',
        type: 'critical' as const,
        message: 'Water level sensor offline in livestock area',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString(),
        resolved: false
      }
    ].filter((_, index) => Math.random() > 0.3); // Randomly show some alerts

    return NextResponse.json({
      deviceMetrics,
      environmentalData,
      animalWelfare,
      operationalEfficiency,
      alerts
    });

  } catch (error) {
    console.error('Error fetching farm insights:', error);
    return NextResponse.json({ error: 'Failed to fetch farm insights' }, { status: 500 });
  }
}