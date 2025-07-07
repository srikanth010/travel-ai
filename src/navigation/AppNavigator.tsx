import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

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
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Videos') iconName = 'videocam';
            else if (route.name === 'map') iconName = 'map';
            else if (route.name === 'Favorite') iconName = 'heart';
            else if (route.name === 'Hotels') iconName = 'bed';
            else if (route.name === 'Cars') iconName = 'car';

            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                {focused ? (
                  <View style={styles.focusedCircle}>
                    <Ionicons name={iconName} size={22} color="#ffffff" />
                  </View>
                ) : (
                  <Ionicons name={iconName} size={24} color="#ffffff" />
                )}
              </View>
            );
          },
          tabBarStyle: {
            position: 'absolute',
            height: 60,
            margin: 20,
            paddingBottom: 0,
            paddingTop: 10,
            backgroundColor: 'rgba(32, 162, 243, 0.2)',
            borderRadius: 24,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarBackground: () => (
            <BlurView
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
              style={{ flex: 1, borderRadius: 24 }}
            />
          ),
          tabBarInactiveTintColor: 'white',
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
  focusedCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00BFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
