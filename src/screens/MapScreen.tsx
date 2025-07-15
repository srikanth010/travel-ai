import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);

  const handleAIQuery = async () => {
    if (!region || !aiQuery.trim()) return;

    const userMessage = aiQuery.trim();
    setAiQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);

    let aiMessage = 'Here are some results.';
    let placeQuery = '';
    let prompts = [];

    try {
      const aiRes = await axios.post('https://local.trvlora.com/ai-map', {
        message: userMessage,
        latitude: region.latitude,
        longitude: region.longitude,
      });

      aiMessage = aiRes.data?.reply || aiMessage;
      placeQuery = aiRes.data?.place_query || userMessage;
      prompts = aiRes.data?.prompts || [];
    } catch {
      aiMessage = "AI error. Try again.";
    }

    setAiPrompts(prompts);

    try {
      const params = new URLSearchParams({
        engine: "google_maps",
        q: placeQuery,
        ll: `@${region.latitude},${region.longitude},14z`,
        api_key: '8c38fdbed6d2a8c0418c496fae96798cf2424f4e4d02e31deab026d718604f31',
      });

      const serpRes = await fetch(`https://serpapi.com/search.json?${params}`);
      const data = await serpRes.json();
      const localResults = data?.local_results || [];

      const parsed = localResults.slice(0, 5).map((place: any, i: number) => ({
        name: place.title,
        address: place.address,
        latitude: place.gps_coordinates?.latitude ?? region.latitude + i * 0.001,
        longitude: place.gps_coordinates?.longitude ?? region.longitude + i * 0.001,
      }));

      setSuggestions(parsed);

      setChatHistory(prev => [...prev, { role: 'ai', text: aiMessage, places: parsed }]);
    } catch (err) {
      console.error('SerpAPI failed:', err);
    }
  };

  const handleFollowUp = async (prompt: string) => {
    setAiQuery(prompt);
    await handleAIQuery();
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
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                description={place.address}
              />
            ))}
          </MapView>

          <ScrollView style={styles.chatHistoryContainer}>
            {chatHistory.map((msg, index) => (
              <View
                key={index}
                style={[styles.chatBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <Text style={styles.chatText}>{msg.text}</Text>
                {msg.role === 'ai' && msg.places && msg.places.map((place: any, i: number) => (
                  <View key={i} style={styles.resultCard}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeAddress}>{place.address}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={styles.followupContainer}>
            {aiPrompts.map((p, i) => (
              <TouchableOpacity key={i} onPress={() => handleFollowUp(p)} style={styles.promptButton}>
                <Text>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

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
    bottom: 100,
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
  chatHistoryContainer: {
    position: 'absolute',
    bottom: 200,
    left: 10,
    right: 10,
    maxHeight: 200,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    zIndex: 10,
  },
  chatBubble: {
    marginBottom: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: '100%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6f7ff',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#d6f5d6',
  },
  chatText: {
    fontSize: 14,
    color: '#333',
  },
  followupContainer: {
    position: 'absolute',
    bottom: 180,
    left: 10,
    right: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 9,
  },
  promptButton: {
    backgroundColor: '#d0f0ff',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  placeName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeAddress: {
    fontSize: 14,
    color: '#555',
  },
});