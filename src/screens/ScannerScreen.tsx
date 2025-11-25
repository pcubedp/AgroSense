import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Image, ActivityIndicator, Alert, Platform, TouchableOpacity } from 'react-native';
import { MainTabsProps } from '../navigation/AppNavigator';
import Icon from 'react-native-vector-icons/Ionicons';
// Note: We are mocking the image picker and location functionality since
// actual implementation requires installing external libraries (like react-native-image-picker or expo-image-picker)
// and proper native configuration.

// Mock utility functions for demonstration purposes
const mockImagePicker = {
  launchCamera: async () => ({ uri: 'https://placehold.co/600x400/006400/ffffff?text=Camera+Image', base64: 'mock-base64-camera-data' }),
  launchGallery: async () => ({ uri: 'https://placehold.co/600x400/32CD32/ffffff?text=Gallery+Image', base64: 'mock-base64-gallery-data' }),
};

const mockLocationService = {
  fetchAddress: async () => {
    // Simulate asking for location permission and fetching an address
    await new Promise(resolve => setTimeout(resolve, 800));
    return '123 Farm Rd, Rural Town, State 99999';
  },
};

// --- TYPE DEFINITIONS ---

// Define the structure for the user's farm details form
interface FarmDetails {
  farmArea: string; // Stored as string for TextInput
  farmAddress: string;
  fertilizersUsed: string;
  otherDetails: string;
}

// Define the structure for the AI's initial image analysis (mocked)
interface InitialAiAnalysis {
  cropType: string;
  soilTexture: string;
  confidenceScore: number;
}

// Define the combined data structure sent for the final report generation
interface FinalReportPayload {
  imageData: string; // Base64 representation of the image
  farmDetails: FarmDetails;
  initialAiAnalysis: InitialAiAnalysis;
}

// --- MOCK API SERVICE ---

/**
 * Mocks the initial AI call to analyze the image content.
 * @param base64Image The base64 string of the uploaded image.
 * @returns A promise resolving to the InitialAiAnalysis results.
 */
const analyzeImageApi = async (base64Image: string): Promise<InitialAiAnalysis> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock result based on image content (in a real app, this would be a real API call)
  console.log(`Mock AI analysis for image: ${base64Image.substring(0, 30)}...`);
  return {
    cropType: 'Wheat (Winter Variety)',
    soilTexture: 'Silty Clay Loam',
    confidenceScore: 0.92,
  };
};

/**
 * Mocks the final API call to generate a complete farm report.
 * @param payload The combined image and form data.
 * @returns A promise that resolves when the report is ready.
 */
const generateReportApi = async (payload: FinalReportPayload): Promise<void> => {
  // Simulate network delay for complex report generation
  await new Promise(resolve => setTimeout(resolve, 2500));
  console.log('Final Report Payload Sent:', JSON.stringify(payload));
};

// --- SCREEN COMPONENT ---

const ScannerScreen: React.FC<MainTabsProps<'Scanner'>> = ({ navigation }) => {
  // State for image handling
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);

  // State for AI analysis results
  const [initialAnalysis, setInitialAnalysis] = useState<InitialAiAnalysis | null>(null);

  // State for form data
  const [farmDetails, setFarmDetails] = useState<FarmDetails>({
    farmArea: '',
    farmAddress: 'Fetching location...',
    fertilizersUsed: '',
    otherDetails: '',
  });

  // State for loading indicators
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  /**
   * Handles updating the form state based on input field changes.
   */
  const handleInputChange = (field: keyof FarmDetails, value: string) => {
    setFarmDetails(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Prompts the user to pick an image either from the camera or gallery.
   */
  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      // Reset states upon new image selection
      setSelectedImageUri(null);
      setSelectedImageBase64(null);
      setInitialAnalysis(null);
      setIsAnalyzing(true);

      let imageResult;
      if (source === 'camera') {
        imageResult = await mockImagePicker.launchCamera();
      } else {
        imageResult = await mockImagePicker.launchGallery();
      }

      if (imageResult) {
        setSelectedImageUri(imageResult.uri);
        setSelectedImageBase64(imageResult.base64);

        // Immediately send the image for initial AI analysis
        const analysis = await analyzeImageApi(imageResult.base64);
        setInitialAnalysis(analysis);

        // Simultaneously fetch location
        await fetchLocation();
      }
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Mocks the process of fetching the farm address using device location.
   */
  const fetchLocation = async () => {
    try {
      setIsLocationLoading(true);
      const address = await mockLocationService.fetchAddress();
      setFarmDetails(prev => ({ ...prev, farmAddress: address }));
    } catch (error) {
      console.error('Location fetching error:', error);
      setFarmDetails(prev => ({ ...prev, farmAddress: 'Location Unavailable' }));
    } finally {
      setIsLocationLoading(false);
    }
  };

  /**
   * Handles the submission of the combined data for the final report.
   */
  const handleSubmit = async () => {
    // 1. Basic validation
    if (!selectedImageBase64 || !initialAnalysis) {
      Alert.alert('Missing Data', 'Please select and analyze an image before submitting.');
      return;
    }
    if (!farmDetails.farmArea || farmDetails.farmAddress === 'Fetching location...') {
      Alert.alert('Missing Details', 'Please enter the farm area and ensure the address is available.');
      return;
    }

    setIsReporting(true);

    const finalPayload: FinalReportPayload = {
      imageData: selectedImageBase64,
      farmDetails: farmDetails,
      initialAiAnalysis: initialAnalysis,
    };

    try {
      // 2. Send the combined data to the report generation API
      await generateReportApi(finalPayload);

      // 3. Navigate to Dashboard upon successful report generation
      // In a real app, the report data would be passed or saved globally before navigating.
      Alert.alert('Success', 'Farm data submitted and report generation initiated.');
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Report submission error:', error);
      Alert.alert('Error', 'Failed to generate farm report. Please try again.');
    } finally {
      setIsReporting(false);
      // Optional: Reset state after successful submission
      // setSelectedImageUri(null);
      // setInitialAnalysis(null);
      // setFarmDetails({ farmArea: '', farmAddress: 'Fetching location...', fertilizersUsed: '', otherDetails: '' });
    }
  };

  // Determine if the form can be submitted
  const isSubmitDisabled = isAnalyzing || isReporting || !initialAnalysis || isLocationLoading;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Farm Scanner</Text>
        <Text style={styles.subHeader}>Upload a picture of your crop or soil for AI analysis.</Text>

        {/* --- Image Selection Buttons --- */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#32CD32' }]} // Lime Green
            onPress={() => pickImage('camera')}
            disabled={isAnalyzing}
          >
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#006400' }]} // Dark Green
            onPress={() => pickImage('gallery')}
            disabled={isAnalyzing}
          >
            <Text style={styles.buttonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* --- Image Preview and Initial Analysis --- */}
        {selectedImageUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />

            {isAnalyzing ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#006400" />
                <Text style={styles.loadingText}>Analyzing Image...</Text>
              </View>
            ) : initialAnalysis ? (
              <View style={styles.analysisBox}>
                <Text style={styles.analysisTitle}>AI Image Analysis Complete</Text>
                <Text style={styles.analysisText}>Crop Type: <Text style={styles.analysisResult}>{initialAnalysis.cropType}</Text></Text>
                <Text style={styles.analysisText}>Soil Texture: <Text style={styles.analysisResult}>{initialAnalysis.soilTexture}</Text></Text>
                <Text style={styles.analysisText}>Confidence: <Text style={styles.analysisResult}>{(initialAnalysis.confidenceScore * 100).toFixed(1)}%</Text></Text>
              </View>
            ) : null}
          </View>
        )}

        {/* --- Farm Details Form --- */}
        <Text style={styles.formTitle}>Farm Details (Required for Report)</Text>

        <TextInput
          style={styles.input}
          placeholder="Farm Area (e.g., 50 acres)"
          keyboardType="numeric"
          value={farmDetails.farmArea}
          onChangeText={(text) => handleInputChange('farmArea', text)}
        />

        {/* Address Field */}
        <View style={styles.addressContainer}>
          <TextInput
            style={[styles.input, styles.addressInput]}
            placeholder="Farm Address"
            value={farmDetails.farmAddress}
            onChangeText={(text) => handleInputChange('farmAddress', text)}
            editable={!isLocationLoading}
          />
          <TouchableOpacity
            style={styles.locationButton}
            onPress={fetchLocation}
            disabled={isLocationLoading}
          >
            {isLocationLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="locate-sharp" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Current Fertilizers Used (e.g., NPK 10-10-10, Urea)"
          value={farmDetails.fertilizersUsed}
          onChangeText={(text) => handleInputChange('fertilizersUsed', text)}
        />

        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Other Farm-Related Details (e.g., last harvest date, irrigation method)"
          value={farmDetails.otherDetails}
          onChangeText={(text) => handleInputChange('otherDetails', text)}
          multiline
          numberOfLines={4}
        />

        {/* --- Submit Button --- */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
        >
          {isReporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Generate Comprehensive Report</Text>
          )}
        </TouchableOpacity>

        {isReporting && <Text style={styles.reportingText}>Generating report and calculating profits...</Text>}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

// --- STYLING ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  previewContainer: {
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  loadingBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#006400',
    fontWeight: '500',
  },
  analysisBox: {
    padding: 15,
    backgroundColor: '#e6ffe6', // Lightest green background for results
    borderTopWidth: 1,
    borderTopColor: '#00640020',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  analysisResult: {
    fontWeight: '600',
    color: '#004d00',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  addressContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  addressInput: {
    flex: 1,
    marginBottom: 0, // Override default margin
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  locationButton: {
    backgroundColor: '#1E90FF', // Dodger Blue for location action
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: -1, // Overlap border for clean look
  },
  submitButton: {
    backgroundColor: '#FF8C00', // Dark Orange
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  reportingText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#FF8C00',
    fontWeight: '500',
  }
});

export default ScannerScreen;