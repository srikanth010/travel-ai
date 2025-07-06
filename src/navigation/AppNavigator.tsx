import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';
import HomeScreen from '../screens/HomeScreen';
import FlightScreen from '../screens/FlightScreen';
import HotelsScreen from '../screens/HotelsScreen';
import AirbnbScreen from '../screens/AirbnbScreen';
import CarsScreen from '../screens/CarScreen';
import VideoFeedScreen from '../screens/VideoScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="light" // "dark", "light", "xlight", "prominent", "regular"
        blurAmount={10} // Adjust blur intensity
        reducedTransparencyFallbackColor="white"
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Flight') {
              iconName = 'airplane';
            } else if (route.name === 'Hotels') {
              iconName = 'bed';
            } else if (route.name === 'Airbnb') {
              iconName = 'home-outline';
            } else if (route.name === 'Cars') {
              iconName = 'car';
            } else if (route.name === 'Videos') {
              iconName = 'videocam';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00BFFF', // Active tab color
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent inactive tab color
          tabBarStyle: {
            overflow: 'hidden', // Crucial for blur to respect border-radius
            borderWidth: 1, // Add subtle border
            borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle border color
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Ensure no solid background
            position: 'absolute', // Floating tab bar
            elevation: 5, // Add shadow for Android
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2, // Subtle shadow for iOS
            shadowRadius: 6,
          },
          tabBarBackground: () => (
            <BlurView
              blurType="light" // Options: 'light', 'dark', 'extraLight'
              blurAmount={20} // Adjust blur intensity for Glassmorphism
              reducedTransparencyFallbackColor="transparent" // Ensure no fallback color
              style={{ flex: 1 }}
            />
          ),
          headerShown: false, // Remove header for all screens
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Videos" component={VideoFeedScreen} />
        <Tab.Screen name="Flight" component={FlightScreen} />
        <Tab.Screen name="Hotels" component={HotelsScreen} />
        <Tab.Screen name="Airbnb" component={AirbnbScreen} />
        <Tab.Screen name="Cars" component={CarsScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = {
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flex: 1, // Make the container fill the screen
    borderRadius: 20,
    overflow: 'hidden', // Crucial for blur to respect border-radius
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
    borderWidth: 0, // Remove border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  blurView: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
};

export default AppNavigator;
