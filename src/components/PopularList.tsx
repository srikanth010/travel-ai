import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import PopularCard from './PopularCards'; // Ensure correct import path

const PopularList = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Popular Destinations</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <PopularCard image={require('../assets/images/popular-cards/paris.png')} title="Paris" />
        <PopularCard image={require('../assets/images/popular-cards/Tokyo.png')} title="Tokyo" />
        <PopularCard image={require('../assets/images/popular-cards/paris.png')} title="Bali" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    paddingTop: 16,
    paddingHorizontal: 16,
    textAlign: 'left',
  },
});

export default PopularList;
