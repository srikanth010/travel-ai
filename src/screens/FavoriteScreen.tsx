import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FavoriteScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FlightScreen Screen</Text>
      <Text style={styles.description}>This is the FlightScreen screen where you can view car details.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FavoriteScreen;