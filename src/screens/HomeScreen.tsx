import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HomeStackProps, RootTabParamList } from '../navigation/AppNavigator';

// Define the type for the HomeScreen navigation props
// It uses the RootStackParamList because it is part of the main stack, 
// but we need the navigation object to potentially go back to tabs.
type HomeScreenProps = HomeStackProps<'Home'>;

/**
 * A simple landing screen accessible from the top-right Home icon.
 * It provides a welcome message and quick navigation shortcuts to the main tabs.
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  /**
   * Helper function to navigate directly to a specific tab screen.
   * We navigate to 'MainTabs' first, and then specify the target screen name
   * within the RootTabParamList as parameters.
   */
  const goToTab = (screenName: keyof RootTabParamList) => {
    navigation.navigate('MainTabs', {
      screen: screenName,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, Farmer!</Text>
      <Text style={styles.subText}>
        Your AI-powered farm management assistant.
      </Text>

      {/* Quick link button to the Scanner Tab */}
      <TouchableOpacity
        style={[styles.button, styles.scannerButton]}
        onPress={() => goToTab('Scanner')}
      >
        <Text style={styles.buttonText}>Start Farm Scan</Text>
      </TouchableOpacity>

      {/* Quick link button to the Dashboard Tab */}
      <TouchableOpacity
        style={[styles.button, styles.dashboardButton]}
        onPress={() => goToTab('Dashboard')}
      >
        <Text style={styles.buttonText}>View Farm Dashboard</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        Navigate using the tabs below or the links above.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50, // Added padding for better visual spacing
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#006400', // Dark Green
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '90%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scannerButton: {
    backgroundColor: '#32CD32', // Lime Green
  },
  dashboardButton: {
    backgroundColor: '#FF8C00', // Dark Orange
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  footerText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#999',
  }
});

export default HomeScreen;