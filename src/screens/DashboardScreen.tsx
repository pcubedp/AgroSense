import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { MainTabsProps } from '../navigation/AppNavigator';

// Get screen width for responsive charting
const { width } = Dimensions.get('window');

// --- 1. TYPE DEFINITIONS ---

// Define the structure for a single farm activity
interface Activity {
  activity: string;
  week: number;
  description: string;
}

// Define the full report structure received after AI processing
interface ReportData {
  uploadedImageUri: string;
  aiInsights: {
    cropIdentified: string;
    suggestedCrop: string;
    soilTexture: string;
    recommendedFertilizers: string;
  };
  farmDetails: {
    farmArea: number; // in acres
    costPerAcre: number; // e.g., 800 USD
    revenuePerAcre: number; // e.g., 1500 USD
    currentFertilizerUsed: string;
  };
  timeline: Activity[];
}

// --- MOCK DATA ---
// This mock data simulates the output after the submission in ScannerScreen
const MOCK_REPORT_DATA: ReportData = {
  uploadedImageUri: 'https://placehold.co/600x400/006400/ffffff?text=Analyzed+Farm+Field',
  aiInsights: {
    cropIdentified: 'Wheat (Soft Red Winter)',
    suggestedCrop: 'Wheat (High Yield Hybrid)',
    soilTexture: 'Silty Clay Loam - Needs aeration',
    recommendedFertilizers: 'NPK 15-5-10, with supplementary Zinc and Sulfur',
  },
  farmDetails: {
    farmArea: 50, // acres
    costPerAcre: 850, // USD
    revenuePerAcre: 1800, // USD
    currentFertilizerUsed: 'NPK 10-10-10',
  },
  timeline: [
    { activity: 'Soil Amendment', week: 1, description: 'Apply recommended fertilizer blend and till the soil lightly.' },
    { activity: 'Planting', week: 2, description: 'Seed the suggested hybrid wheat variety.' },
    { activity: 'Pest Scouting', week: 6, description: 'Monitor for aphids and rust. Apply pesticide if needed.' },
    { activity: 'Mid-season Fertilization', week: 10, description: 'Apply secondary nitrogen top-dress.' },
    { activity: 'Harvest Prep', week: 18, description: 'Check grain moisture levels.' },
    { activity: 'Harvest', week: 20, description: 'Initiate mechanical harvest.' },
  ],
};

// --- 2. HELPER COMPONENTS ---

/**
 * Renders a mock bar chart for visualizing cost and profit.
 */
const FinancialChartMock: React.FC<{ cost: number; profit: number }> = ({ cost, profit }) => {
  const maxValue = Math.max(cost, profit) * 1.1; // 10% buffer
  
  // Calculate bar heights as a percentage of the max value (for visual scaling)
  const costHeight = (cost / maxValue) * 100;
  const profitHeight = (profit / maxValue) * 100;

  return (
    <View style={chartStyles.chartContainer}>
      <Text style={chartStyles.chartTitle}>Profit Visualization (per Acre)</Text>
      <View style={chartStyles.barWrapper}>
        {/* Cost Bar */}
        <View style={chartStyles.barItem}>
          <Text style={chartStyles.barLabel}>${cost.toFixed(0)}</Text>
          <View style={[chartStyles.bar, { height: `${costHeight}%`, backgroundColor: '#FF8C00' }]} />
          <Text style={chartStyles.barTitle}>Cost</Text>
        </View>

        {/* Profit Bar */}
        <View style={chartStyles.barItem}>
          <Text style={chartStyles.barLabel}>${profit.toFixed(0)}</Text>
          <View style={[chartStyles.bar, { height: `${profitHeight}%`, backgroundColor: '#006400' }]} />
          <Text style={chartStyles.barTitle}>Profit</Text>
        </View>
      </View>
    </View>
  );
};

// --- 3. MAIN SCREEN COMPONENT ---

const DashboardScreen: React.FC<MainTabsProps<'Dashboard'>> = () => {
  // In a real app, this data would be fetched from state/API storage based on the latest report ID
  const reportData = MOCK_REPORT_DATA; 

  // Memoize financial calculations
  const { totalCost, totalRevenue, estimatedProfit } = useMemo(() => {
    const area = reportData.farmDetails.farmArea;
    const cost = area * reportData.farmDetails.costPerAcre;
    const revenue = area * reportData.farmDetails.revenuePerAcre;
    const profit = revenue - cost;
    
    return {
      totalCost: cost,
      totalRevenue: revenue,
      estimatedProfit: profit,
    };
  }, [reportData]);

  // Format currency for display
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Farm Report Dashboard</Text>
      <Text style={styles.subHeader}>Insights for {reportData.farmDetails.farmArea} acres of land</Text>

      {/* --- Section 1: Image & Crop/Soil Insights --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Image Analysis</Text>
        <Image source={{ uri: reportData.uploadedImageUri }} style={styles.imagePreview} />
        
        <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Identified Crop:</Text>
            <Text style={styles.insightValue}>{reportData.aiInsights.cropIdentified}</Text>
        </View>
        <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Soil Texture:</Text>
            <Text style={styles.insightValue}>{reportData.aiInsights.soilTexture}</Text>
        </View>
        <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Suggested Crop:</Text>
            <Text style={[styles.insightValue, {color: '#FF8C00', fontWeight: 'bold'}]}>{reportData.aiInsights.suggestedCrop}</Text>
        </View>
      </View>

      {/* --- Section 2: Financial Summary (Mock Chart) --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial Projections</Text>
        
        {/* Mock Chart Visualization */}
        <FinancialChartMock 
            cost={reportData.farmDetails.costPerAcre} 
            profit={reportData.farmDetails.revenuePerAcre - reportData.farmDetails.costPerAcre} 
        />
        
        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Estimated Cost:</Text>
            <Text style={[styles.summaryValue, styles.cost]}>{formatCurrency(totalCost)}</Text>
        </View>
        <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Estimated Revenue:</Text>
            <Text style={[styles.summaryValue, styles.revenue]}>{formatCurrency(totalRevenue)}</Text>
        </View>
        <View style={[styles.summaryBox, styles.profitBox]}>
            <Text style={styles.summaryLabel}>Estimated Profit:</Text>
            <Text style={[styles.summaryValue, styles.profit]}>{formatCurrency(estimatedProfit)}</Text>
        </View>
      </View>
      
      {/* --- Section 3: Recommendations (Fertilizers & Timeline) --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actionable Recommendations</Text>
        
        {/* Fertilizer Recommendation */}
        <View style={styles.recommendationBox}>
            <Text style={styles.recLabel}>Recommended Fertilizer Program:</Text>
            <Text style={styles.recText}>{reportData.aiInsights.recommendedFertilizers}</Text>
        </View>

        {/* Current Fertilizer */}
        <View style={styles.recommendationBox}>
            <Text style={styles.recLabel}>Current Fertilizer Usage:</Text>
            <Text style={styles.recText}>{reportData.farmDetails.currentFertilizerUsed}</Text>
        </View>
      </View>

      {/* --- Section 4: Farm Activity Timeline --- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Farming Activity Timeline</Text>
        <View style={styles.timelineContainer}>
            {reportData.timeline.map((item, index) => (
                <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineWeek}>
                        <Text style={styles.weekText}>Wk {item.week}</Text>
                    </View>
                    <View style={styles.timelineContent}>
                        <Text style={styles.activityTitle}>{item.activity}</Text>
                        <Text style={styles.activityDescription}>{item.description}</Text>
                    </View>
                </View>
            ))}
        </View>
      </View>
      
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

// --- STYLING ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006400', // Dark Green
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 15,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  insightValue: {
    fontSize: 15,
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  
  // Financial Summary Styles
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  profitBox: {
    borderTopWidth: 2,
    borderTopColor: '#006400',
    paddingTop: 12,
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cost: {
    color: '#DC143C', // Crimson Red
  },
  revenue: {
    color: '#4682B4', // Steel Blue
  },
  profit: {
    color: '#006400', // Dark Green
  },

  // Recommendation Styles
  recommendationBox: {
    paddingVertical: 10,
  },
  recLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  recText: {
    fontSize: 14,
    color: '#000',
    backgroundColor: '#e6ffe6', // Light green background
    padding: 10,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#006400',
  },
  
  // Timeline Styles
  timelineContainer: {
    paddingHorizontal: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  timelineWeek: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#006400', // Dark Green marker
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  weekText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timelineContent: {
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
    paddingVertical: 5,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 3,
  }
});

// Chart specific styles for FinancialChartMock
const chartStyles = StyleSheet.create({
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 15,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 15,
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150, // Fixed height for the chart area
        width: '80%',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    barItem: {
        alignItems: 'center',
        width: '30%',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
        marginVertical: 5,
    },
    barLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    barTitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    }
});

export default DashboardScreen;