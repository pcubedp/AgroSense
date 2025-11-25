// Use fetch for standard HTTP requests in React Native/TypeScript environment.

// --- 1. TYPE DEFINITIONS FOR DATA STRUCTURES ---

// Data collected from the user form in ScannerScreen
export interface FarmDetails {
  farmArea: string; // E.g., "50 acres"
  farmAddress: string;
  fertilizersUsed: string;
  otherDetails: string;
}

// Initial analysis results from the AI based on the image
export interface InitialAiAnalysis {
  cropType: string;
  soilTexture: string;
  confidenceScore: number;
}

// Payload structure for the final comprehensive report generation
export interface FinalReportPayload {
  imageData: string; // Base64 representation of the image
  farmDetails: FarmDetails;
  initialAiAnalysis: InitialAiAnalysis;
}

// Structure for a single farm activity entry in the timeline
export interface Activity {
  activity: string;
  week: number;
  description: string;
}

// The final, comprehensive report data displayed on the Dashboard
export interface FarmReport {
  reportId: string;
  uploadedImageUri: string;
  aiInsights: {
    cropIdentified: string;
    suggestedCrop: string;
    soilTexture: string;
    recommendedFertilizers: string;
  };
  farmDetails: {
    farmArea: number; // in acres
    costPerAcre: number;
    revenuePerAcre: number;
    currentFertilizerUsed: string;
  };
  timeline: Activity[];
}


// --- 2. MOCK API ENDPOINTS & BASE CONFIG ---

// In a real app, define your base URL here
const BASE_URL = 'https://api.farmintel.com/v1';

// Simulate network delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- 3. SERVICE FUNCTIONS ---

/**
 * 1. Mocks the API call to get initial AI insights from an image.
 * This is called immediately after the user selects a picture.
 * @param base64Image The base64 string of the uploaded image.
 * @returns Initial crop and soil analysis.
 */
export const fetchInitialImageAnalysis = async (base64Image: string): Promise<InitialAiAnalysis> => {
  console.log(`[API] Sending image for initial analysis to ${BASE_URL}/analyze-image`);
  await delay(1500); // Simulate network latency

  // Mock successful response
  return {
    cropType: 'Wheat (Winter Variety)',
    soilTexture: 'Silty Clay Loam',
    confidenceScore: 0.92,
  };
};

/**
 * 2. Mocks the API call to generate the final, comprehensive farm report.
 * This combines image insights and user inputs.
 * @param payload The complete data payload for report generation.
 * @returns A promise that resolves with the unique ID of the generated report.
 */
export const generateComprehensiveReport = async (payload: FinalReportPayload): Promise<string> => {
  console.log(`[API] Sending final report data to ${BASE_URL}/generate-report`);
  // console.log('Payload sent:', payload); // Log for debugging
  await delay(2500); // Simulate heavy computation delay

  // Mock successful response with a unique report ID
  const newReportId = `RPT-${Date.now()}`;
  return newReportId;
};

/**
 * 3. Mocks the API call to fetch a specific, previously generated report.
 * This would be used by the DashboardScreen to load results.
 * @param reportId The ID of the report to fetch.
 * @returns The comprehensive FarmReport data.
 */
export const fetchFarmReport = async (reportId: string): Promise<FarmReport> => {
  console.log(`[API] Fetching report ${reportId} from ${BASE_URL}/reports/${reportId}`);
  await delay(1000); // Simulate network latency

  if (!reportId) {
    throw new Error('Report ID is required to fetch the report.');
  }

  // Mock comprehensive report data for the Dashboard
  return {
    reportId: reportId,
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
      { activity: 'Pest Scouting', week: 6, description: 'Monitor for aphids and rust.' },
      { activity: 'Harvest Prep', week: 18, description: 'Check grain moisture levels.' },
      { activity: 'Harvest', week: 20, description: 'Initiate mechanical harvest.' },
    ],
  };
};

/**
 * 4. Mocks a utility function to fetch the current location address.
 * (In a real app, this would use a Geocoding service API.)
 * @returns The formatted address string.
 */
export const fetchAddressFromLocation = async (): Promise<string> => {
    console.log('[Service] Attempting to fetch geocoded address.');
    await delay(800);
    return '123 Farm Rd, Rural Town, State 99999';
};