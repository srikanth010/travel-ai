import React from 'react';
import { StyleSheet, SafeAreaView, ImageBackground, Text } from 'react-native';

// NOTE: This code is for a React Native mobile application and will not run directly in this web-based Canvas environment.
// To run this, you need a local React Native development setup.

// BackgroundContainer component to wrap the main content with the background and frosted glass effect
interface BackgroundContainerProps {
  children: React.ReactNode;
  style?: object; // Optional style prop to allow custom styles
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ImageBackground
        source={require('../assets/images/bg.png')} // Replace with the path to your image
        style={StyleSheet.absoluteFillObject} // Ensure the image fills the screen
        resizeMode="cover" // Adjust the image scaling
      >
        {children} {/* Render children directly */}
      </ImageBackground>
    </SafeAreaView>
  );
};

// Styles for BackgroundContainer
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent', // Make SafeAreaView transparent
  },
});

export default BackgroundContainer;

<BackgroundContainer>
  <Text>Hello World</Text> {/* Wrap text in <Text> */}
</BackgroundContainer>
