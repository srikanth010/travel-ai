// AppNavigator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

// Import your theme variables
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/styles';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import HotelsScreen from '../screens/HotelsScreen';
import MapScreen from '../screens/MapScreen';
import CarsScreen from '../screens/CarScreen';
import VideoFeedScreen from '../screens/VideoScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            let iconName: string = ''; // Initialize iconName
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Videos') iconName = 'videocam';
            else if (route.name === 'map') iconName = 'map';
            else if (route.name === 'Favorite') iconName = 'heart';
            else if (route.name === 'Hotels') iconName = 'bed';
            else if (route.name === 'Cars') iconName = 'car';

            return (
              <View style={styles.tabIconContainer}> {/* New style for centering */} {/* <--- THIS IS THE CULPRIT */}
                {/* Correct way to comment inside JSX: */}
                {/* New style for centering */}
                {focused ? (
                  <View style={styles.focusedCircle}>
                    <Ionicons name={iconName} size={22} color={Colors.buttonText} />
                  </View>
                ) : (
                  <Ionicons name={iconName} size={24} color={Colors.text} />
                )}
              </View>
            );
          },
          tabBarStyle: {
            position: 'absolute',
            height: 60,
            margin: Spacing.xl, // Using Spacing
            paddingBottom: 0,
            paddingTop: Spacing.md, // Using Spacing
            backgroundColor: Colors.aiBubble, // Using Colors for consistency
            borderRadius: BorderRadius.xl, // Using BorderRadius
            borderTopWidth: 0,
            ...Shadows.default, // Using pre-defined shadow
          },
          tabBarBackground: () => (
            <BlurView
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
              style={{ flex: 1, borderRadius: BorderRadius.xl }} // Using BorderRadius
            />
          ),
          tabBarInactiveTintColor: Colors.text, // Using Colors
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Videos" component={VideoFeedScreen} />
        <Tab.Screen name="map" component={MapScreen} />
        <Tab.Screen name="Favorite" component={FavoriteScreen} />
        <Tab.Screen name="Hotels" component={HotelsScreen} />
        <Tab.Screen name="Cars" component={CarsScreen} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabIconContainer: { // Added for consistent icon centering
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedCircle: {
    width: 44, // Consider making this a variable too if reused
    height: 44, // Consider making this a variable too if reused
    borderRadius: BorderRadius.circle, // Using BorderRadius
    backgroundColor: Colors.primary, // Using Colors
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;