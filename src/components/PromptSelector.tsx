import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';

interface PromptSelectorProps {
    onPromptSend: (prompt: string) => void;
    lastAISuggestion?: string;
    dynamicPromptsMap?: { [key: string]: string[] };
    overridePrompts?: string[]; // NEW
  }

const initialPrompts = [
  'Find the cheapest flight',
  'Hotel deals & recommendations',
  'Top places to visit',
  'Visa or entry requirements',
  'Create a full-day itinerary',
];

const followUpPromptsMap: { [key: string]: string[] } = {
  'Find the cheapest flight': [
    'From NYC to Tokyo',
    'Flexible dates',
    'Direct flights only',
  ],
  'Hotel deals & recommendations': [
    'In New York',
    'In Tokyo',
    'Near the Eiffel Tower',
  ],
  'Top places to visit': [
    'In Paris',
    'In Bali',
    'In Tokyo',
  ],
  'Visa or entry requirements': [
    'For US citizens to Japan',
    'For India to Schengen area',
  ],
  'Create a full-day itinerary': [
    'In Rome',
    'In Kyoto',
    'In NYC with kids',
  ],
};

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;

const PromptSelector: React.FC<PromptSelectorProps> = ({
    onPromptSend,
    lastAISuggestion,
    dynamicPromptsMap,
    overridePrompts, // ✅ Add this here
  }) => {
  const [promptsToShow, setPromptsToShow] = useState<string[]>(initialPrompts);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handlePromptPress = (prompt: string) => {
    onPromptSend(prompt);
    const map = dynamicPromptsMap || followUpPromptsMap;
    if (map[prompt]) {
      setPromptsToShow(map[prompt]);
      setActiveKey(prompt);
    } else {
      setPromptsToShow([]);
      setActiveKey(null);
    }
  };

  useEffect(() => {
    if (overridePrompts && overridePrompts.length > 0) {
      setPromptsToShow(overridePrompts);
      return;
    }
  
    if (lastAISuggestion && dynamicPromptsMap) {
      const key = Object.keys(dynamicPromptsMap).find((k) =>
        lastAISuggestion.toLowerCase().includes(k.toLowerCase())
      );
      if (key) {
        setPromptsToShow(dynamicPromptsMap[key]);
        setActiveKey(key);
      }
    }
  }, [lastAISuggestion, dynamicPromptsMap, overridePrompts]);
  

  if (promptsToShow.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={promptsToShow}
        numColumns={numColumns}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePromptPress(item)} style={styles.promptButton}>
            <Text style={styles.promptText}>{item}</Text>
          </TouchableOpacity>
        )}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  promptButton: {
    backgroundColor:'rgba(32, 162, 243, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00bfff',
    marginVertical: 6,
    width: (screenWidth - 40) / 2 - 10,
  },
  promptText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PromptSelector;