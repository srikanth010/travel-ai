import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { BlurView } from '@react-native-community/blur';

const CarScreen = () => {
  return (
    <ImageBackground
      source={{ uri: 'https://picsum.photos/id/237/800/600' }} // Replace with your background image
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <BlurView
          style={styles.blurView}
          blurType="light" // "dark", "light", "xlight", "prominent", "regular"
          blurAmount={10} // Adjust blur intensity
          reducedTransparencyFallbackColor="white"
        />
        <View style={styles.content}>
          <Text style={styles.title}>Glassmorphism Effect</Text>
          <Text style={styles.description}>
            This is an example of a glassmorphism effect in React Native,
            combining blur, transparency, and subtle styling.
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 300,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden', // Crucial for blur to respect border-radius
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent background
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5, // For Android shadow
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default CarScreen;