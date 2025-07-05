import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

interface GlassSearchBoxProps {
  placeholder: string;
  onSearch?: (query: string) => void;
  style?: object;
}

const GlassSearchBox: React.FC<GlassSearchBoxProps> = ({ placeholder, onSearch, style }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (onSearch) onSearch('');
    navigation.navigate('Chat');
  };

  return (
    <View style={[styles.searchContainer, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"
      />
      <Image
        source={require('../assets/images/ai-stars/icons8-ai-36.png')}
        style={[styles.icon, { tintColor: '#00BFFF' }]}
      />
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel="Ask AI to help plan your trip"
      >
        <Text style={styles.searchButtonText}>{placeholder}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 191, 255, 0.8)',
    shadowColor: 'rgba(0, 191, 255, 1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  searchButton: {
    flex: 1,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
});

export default GlassSearchBox;
