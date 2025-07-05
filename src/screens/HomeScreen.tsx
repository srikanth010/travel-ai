import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassSearchBox from '../components/GlassSearchBar';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; // Update this path if needed
import PopularList from '../components/PopularList'; // Import your popular cards component


const HomeScreen: React.FC = () => {
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={styles.container}>
      <BlurView
          style={styles.glassEffect}
          blurType="light"
          blurAmount={20}
          reducedTransparencyFallbackColor="white"
        />

      <GlassSearchBox
        placeholder="Ask AI to Plan Your Trip ..."
        onPress={() => navigation.navigate('Chat')}
        style={{ marginTop: 20, width: '90%' }}
      />
      <PopularList/> {/* Your glassmorphism card component */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Transparent to allow BlurView to show
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;