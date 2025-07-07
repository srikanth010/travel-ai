import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface CardItemProps {
  image: ImageSourcePropType;
  title: string;
  onPress?: () => void;
}

const PopularCard: React.FC<CardItemProps> = ({ image, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={image} style={styles.image} resizeMode="cover" />
      <BlurView style={styles.blurOverlay} blurType="light" blurAmount={10} />
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 10,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
  },
  title: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PopularCard;
