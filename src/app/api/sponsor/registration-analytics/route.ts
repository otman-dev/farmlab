import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]';
import { getCloudConnection } from '@/lib/mongodb-cloud';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    
    if (!user || !['admin', 'sponsor'].includes(user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await getCloudConnection();
    
    // Fetch all registration responses
    const registrationResponses = await conn.db.collection('registrationresponses').find({}).toArray();
    
    // Calculate analytics
    const analytics = calculateRegistrationAnalytics(registrationResponses);
    
    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching registration analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch registration analytics' }, { status: 500 });
  }
}

function calculateRegistrationAnalytics(responses: any[]) {
  const totalResponses = responses.length;
  
  if (totalResponses === 0) {
    return {
      totalResponses: 0,
      demographics: {},
      interests: {},
      trends: {},
      insights: []
    };
  }

  // Role Distribution
  const roleDistribution = calculateRoleDistribution(responses);
  
  // Geographic Distribution
  const geographicDistribution = calculateGeographicDistribution(responses);
  
  // Farm Size Distribution (for farmers)
  const farmSizeDistribution = calculateFarmSizeDistribution(responses);
  
  // Technology Experience
  const techExperienceDistribution = calculateTechExperience(responses);
  
  // Interest Categories
  const interestAnalysis = calculateInterestAnalysis(responses);
  
  // Challenges Analysis
  const challengesAnalysis = calculateChallengesAnalysis(responses);
  
  // Priorities Analysis
  const prioritiesAnalysis = calculatePrioritiesAnalysis(responses);
  
  // Investment Focus (for investors)
  const investmentFocusAnalysis = calculateInvestmentFocus(responses);
  
  // Participation Mode Preferences
  const participationAnalysis = calculateParticipationMode(responses);
  
  // Pricing Model Preferences
  const pricingModelAnalysis = calculatePricingModelPreferences(responses);
  
  // Time-based trends
  const timeBasedTrends = calculateTimeBasedTrends(responses);
  
  // Market insights
  const marketInsights = generateMarketInsights(responses);

  return {
    totalResponses,
    summary: {
      primaryRoles: roleDistribution,
      topCountries: geographicDistribution.slice(0, 5),
      avgTechExperience: calculateAverageTechExperience(responses),
      mostCommonFarmSize: farmSizeDistribution[0]?.category || 'N/A'
    },
    demographics: {
      roles: roleDistribution,
      geography: geographicDistribution,
      farmSizes: farmSizeDistribution,
      techExperience: techExperienceDistribution
    },
    interests: {
      categories: interestAnalysis,
      challenges: challengesAnalysis,
      priorities: prioritiesAnalysis,
      investmentFocus: investmentFocusAnalysis
    },
    preferences: {
      participationMode: participationAnalysis,
      pricingModel: pricingModelAnalysis
    },
    trends: timeBasedTrends,
    insights: marketInsights
  };
}

function calculateRoleDistribution(responses: any[]) {
  const roleCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const roles = response.roles || [];
    if (Array.isArray(roles)) {
      roles.forEach((role: string) => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
    }
  });
  
  return Object.entries(roleCounts)
    .map(([role, count]) => ({
      category: role,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateGeographicDistribution(responses: any[]) {
  const countryCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const country = response.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });
  
  return Object.entries(countryCounts)
    .map(([country, count]) => ({
      category: country,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateFarmSizeDistribution(responses: any[]) {
  const farmSizeCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    if (response.farm_size) {
      farmSizeCounts[response.farm_size] = (farmSizeCounts[response.farm_size] || 0) + 1;
    }
  });
  
  return Object.entries(farmSizeCounts)
    .map(([size, count]) => ({
      category: size,
      count,
      percentage: Math.round((count / Object.values(farmSizeCounts).reduce((a: number, b: number) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateTechExperience(responses: any[]) {
  const techLevelCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    if (response.experience_level) {
      techLevelCounts[response.experience_level] = (techLevelCounts[response.experience_level] || 0) + 1;
    }
  });
  
  return Object.entries(techLevelCounts)
    .map(([level, count]) => ({
      category: level,
      count,
      percentage: Math.round((count / Object.values(techLevelCounts).reduce((a: number, b: number) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateInterestAnalysis(responses: any[]) {
  const interestCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    // Analyze various interest fields
    const interestFields = [
      'collaboration_interest',
      'data_interest',
      'industry_interest',
      'interest_area',
      'follow_topics'
    ];
    
    interestFields.forEach(field => {
      const interests = response[field];
      if (Array.isArray(interests)) {
        interests.forEach((interest: string) => {
          interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        });
      }
    });
  });
  
  return Object.entries(interestCounts)
    .map(([interest, count]) => ({
      category: interest,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 interests
}

function calculateChallengesAnalysis(responses: any[]) {
  const challengeCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const challenges = response.challenges;
    if (Array.isArray(challenges)) {
      challenges.forEach((challenge: string) => {
        challengeCounts[challenge] = (challengeCounts[challenge] || 0) + 1;
      });
    }
  });
  
  return Object.entries(challengeCounts)
    .map(([challenge, count]) => ({
      category: challenge,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculatePrioritiesAnalysis(responses: any[]) {
  const priorityCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const priorities = response.priorities;
    if (Array.isArray(priorities)) {
      priorities.forEach((priority: string) => {
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });
    }
  });
  
  return Object.entries(priorityCounts)
    .map(([priority, count]) => ({
      category: priority,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateInvestmentFocus(responses: any[]) {
  const investmentCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    if (response.investment_focus) {
      investmentCounts[response.investment_focus] = (investmentCounts[response.investment_focus] || 0) + 1;
    }
  });
  
  return Object.entries(investmentCounts)
    .map(([focus, count]) => ({
      category: focus,
      count,
      percentage: Math.round((count / Object.values(investmentCounts).reduce((a: number, b: number) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateParticipationMode(responses: any[]) {
  const participationCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const modes = response.participation_mode;
    if (Array.isArray(modes)) {
      modes.forEach((mode: string) => {
        participationCounts[mode] = (participationCounts[mode] || 0) + 1;
      });
    }
  });
  
  return Object.entries(participationCounts)
    .map(([mode, count]) => ({
      category: mode,
      count,
      percentage: Math.round((count / responses.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculatePricingModelPreferences(responses: any[]) {
  const pricingCounts: { [key: string]: number } = {};
  
  responses.forEach(response => {
    if (response.pricing_model) {
      pricingCounts[response.pricing_model] = (pricingCounts[response.pricing_model] || 0) + 1;
    }
  });
  
  return Object.entries(pricingCounts)
    .map(([model, count]) => ({
      category: model,
      count,
      percentage: Math.round((count / Object.values(pricingCounts).reduce((a: number, b: number) => a + b, 0)) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateTimeBasedTrends(responses: any[]) {
  const monthlySignups: { [key: string]: number } = {};
  const weeklySignups: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const date = new Date(response.submitted_at || response.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const weekKey = getWeekKey(date);
    
    monthlySignups[monthKey] = (monthlySignups[monthKey] || 0) + 1;
    weeklySignups[weekKey] = (weeklySignups[weekKey] || 0) + 1;
  });
  
  return {
    monthly: Object.entries(monthlySignups)
      .map(([month, count]) => ({ period: month, count }))
      .sort((a, b) => a.period.localeCompare(b.period)),
    weekly: Object.entries(weeklySignups)
      .map(([week, count]) => ({ period: week, count }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12) // Last 12 weeks
  };
}

function calculateAverageTechExperience(responses: any[]) {
  const experienceLevels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
  let totalScore = 0;
  let count = 0;
  
  responses.forEach(response => {
    if (response.experience_level && experienceLevels[response.experience_level as keyof typeof experienceLevels]) {
      totalScore += experienceLevels[response.experience_level as keyof typeof experienceLevels];
      count++;
    }
  });
  
  return count > 0 ? Math.round((totalScore / count) * 100) / 100 : 0;
}

function generateMarketInsights(responses: any[]) {
  const insights = [];
  
  // Analyze top role combinations
  const roleCombiations = analyzeRoleCombinations(responses);
  insights.push({
    type: 'market_segment',
    title: 'Primary Market Segments',
    description: `Top user segments: ${roleCombiations.slice(0, 3).map(r => r.combination).join(', ')}`,
    impact: 'high'
  });
  
  // Analyze technology adoption readiness
  const techReadiness = analyzeTechReadiness(responses);
  insights.push({
    type: 'technology_adoption',
    title: 'Technology Adoption Readiness',
    description: `${techReadiness.advanced}% of users have advanced/expert tech experience`,
    impact: 'medium'
  });
  
  // Analyze investment opportunities
  const investmentOpportunities = analyzeInvestmentOpportunities(responses);
  insights.push({
    type: 'investment_opportunity',
    title: 'Investment Focus Areas',
    description: investmentOpportunities.description,
    impact: 'high'
  });
  
  return insights;
}

function analyzeRoleCombinations(responses: any[]) {
  const combinations: { [key: string]: number } = {};
  
  responses.forEach(response => {
    const roles = response.roles || [];
    if (Array.isArray(roles) && roles.length > 0) {
      const sortedRoles = roles.sort().join(' + ');
      combinations[sortedRoles] = (combinations[sortedRoles] || 0) + 1;
    }
  });
  
  return Object.entries(combinations)
    .map(([combination, count]) => ({ combination, count }))
    .sort((a, b) => b.count - a.count);
}

function analyzeTechReadiness(responses: any[]) {
  let advanced = 0;
  let total = 0;
  
  responses.forEach(response => {
    if (response.experience_level) {
      total++;
      if (['advanced', 'expert'].includes(response.experience_level)) {
        advanced++;
      }
    }
  });
  
  return {
    advanced: total > 0 ? Math.round((advanced / total) * 100) : 0,
    total
  };
}

function analyzeInvestmentOpportunities(responses: any[]) {
  const investmentInterests = responses.filter(r => 
    r.roles?.includes('Investor / Business Developer') || 
    r.industry_interest?.includes('Sponsorship or investment')
  );
  
  const focusAreas: { [key: string]: number } = {};
  investmentInterests.forEach(response => {
    if (response.investment_focus) {
      focusAreas[response.investment_focus] = (focusAreas[response.investment_focus] || 0) + 1;
    }
  });
  
  const topFocus = Object.entries(focusAreas)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    count: investmentInterests.length,
    description: topFocus 
      ? `${investmentInterests.length} potential investors, primarily interested in ${topFocus[0]}`
      : `${investmentInterests.length} potential investors identified`
  };
}

function getWeekKey(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}