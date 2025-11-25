import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- 1. TYPE DEFINITIONS ---

// Define the parameter list for the Bottom Tab Navigator
export type RootTabParamList = {
  Scanner: undefined;
  Dashboard: undefined;
};

// Define the parameter list for the Main Stack Navigator
export type RootStackParamList = {
  Home: undefined;
  // This allows passing an object with a 'screen' key (of the tab type) OR passing nothing (undefined)
  MainTabs: { screen: keyof RootTabParamList } | undefined; 
};

// Typed hooks for convenience
export type MainTabsProps<RouteName extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, RouteName>;
export type HomeStackProps<RouteName extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, RouteName>;

// --- 2. SCREEN IMPORTS (Mocked based on structure) ---
// These screens will be created in the next steps
import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import DashboardScreen from '../screens/DashboardScreen';

// --- 3. NAVIGATOR INSTANCES ---

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Renders the Home icon button in the header.
 */
const HomeIconRight: React.FC = () => {
  const navigation = useNavigation<NativeStackScreenProps<RootStackParamList>['navigation']>();

  const goToHome = () => {
    // Navigate to the 'Home' screen defined in the RootStack
    navigation.navigate('Home');
  };

  return (
    <TouchableOpacity onPress={goToHome} style={styles.headerButton}>
      {/* Home icon using Ionicons */}
      <Icon name="home-outline" size={24} color="#006400" />
    </TouchableOpacity>
  );
};

/**
 * Bottom Tab Navigator containing Scanner and Dashboard screens.
 */
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Scanner"
      screenOptions={{
        tabBarActiveTintColor: '#006400', // Dark Green
        tabBarInactiveTintColor: '#808080', // Grey
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          headerShown: false, // We'll manage the header in the Stack Navigator
          tabBarIcon: ({ color, size }) => (
            <Icon name="camera-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerShown: false, // We'll manage the header in the Stack Navigator
          tabBarIcon: ({ color, size }) => (
            <Icon name="bar-chart-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main application navigator using a Native Stack.
 * This handles the main navigation flow including the Home screen and the tabs.
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      {/* 1. HomeScreen: A simple screen for the 'Home' functionality. 
        It's outside the tabs structure.
      */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Welcome Farmer',
          headerStyle: styles.header,
          headerTintColor: '#006400',
        }}
      />

      {/* 2. MainTabs: This is where the BottomTabNavigator is rendered. 
        The header here will apply to all tab screens.
      */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={({ route }) => ({
          // Set the title dynamically based on the currently focused tab
          headerTitle: getHeaderTitle(route),
          headerStyle: styles.header,
          headerTintColor: '#006400',
          // Show the Home icon on the right side of the header
          headerRight: () => <HomeIconRight />,
        })}
      />
    </Stack.Navigator>
  );
};

/**
 * Helper function to set the header title based on the focused route in the tabs.
 */
const getHeaderTitle = (route: any) => {
  // Get the name of the focused route in the tab navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Scanner';

  switch (routeName) {
    case 'Scanner':
      return 'Farm Scanner';
    case 'Dashboard':
      return 'Farm Dashboard';
    default:
      return 'Farm App';
  }
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f0f0f0',
  },
  tabBar: {
    paddingVertical: 5,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  headerButton: {
    paddingHorizontal: 10,
  }
});

export default AppNavigator;