import React, { useEffect, useState } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform,TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [aiQuery, setAiQuery] = useState('');
const [suggestions, setSuggestions] = useState<any[]>([]);
const [aiVisible, setAiVisible] = useState(false);
const handleAIQuery = async () => {
  if (!region || !aiQuery) return;

  const response = await fetch('https://api.serpapi.com/search.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: `${aiQuery} near ${region.latitude},${region.longitude}`,
      location: `${region.latitude},${region.longitude}`,
      api_key: 'YOUR_SERPAPI_KEY',
    }),
  });

  const data = await response.json();
  const localResults = data?.local_results || [];

  const parsed = localResults.map((place: any) => ({
    name: place.title,
    address: place.address,
    latitude: place.coordinates?.latitude,
    longitude: place.coordinates?.longitude,
  }));

  setSuggestions(parsed);
};

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        },
        error => {
          console.warn(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      {region && (
  <>
    <MapView style={styles.map} region={region}>
      <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
      {suggestions.map((place, index) => (
        <Marker
          key={index}
          title={place.name}
          description={place.address}
          coordinate={{
            latitude: place.latitude,
            longitude: place.longitude,
          }}
        />
      ))}
    </MapView>

    <View style={styles.chatContainer}>
      <TextInput
        value={aiQuery}
        onChangeText={setAiQuery}
        placeholder="Ask AI: Best hikes nearby?"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAIQuery} style={styles.button}>
        <Text style={{ color: '#fff' }}>Ask</Text>
      </TouchableOpacity>
    </View>
  </>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  chatContainer: {
    position: 'absolute',
    bottom: 100, // Adjust height above your custom menu bar
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 191, 255, 0.2)',
    borderColor: 'rgba(0, 191, 255, 0.8)',
    shadowColor: 'rgba(0, 191, 255, 1)',
    padding: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },  
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: 10,
    marginLeft: 5,
    backgroundColor: '#00BFFF',
    borderRadius: 20,
  },
  
});
