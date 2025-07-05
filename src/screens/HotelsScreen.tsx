import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HotelsScreen: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log('HotelsScreen mounted');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HotelsScreen Screen</Text>
      <Text style={styles.description}>
        This is the HotelsScreen screen where you can view hotel details.
      </Text>
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
    color: '#fff',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
});

export default HotelsScreen;