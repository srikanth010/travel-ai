// src/components/PromptSelector.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';

import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles';

interface PromptSelectorProps {
    // Keep onPromptSend for scenarios where you might still want direct send (e.g., internal prompts)
    onPromptSend: (prompt: string) => void;
    // NEW PROP: Called when a user wants to select a prompt to put in the input box
    onPromptSelectForInput: (prompt: string) => void; // <--- ADD THIS NEW PROP
    lastAISuggestion?: string;
    dynamicPromptsMap?: { [key: string]: string[] };
    overridePrompts?: string[];
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
    onPromptSend, // Keep this, might be useful for internal logic or direct sending later
    onPromptSelectForInput, // <--- Destructure the new prop
    lastAISuggestion,
    dynamicPromptsMap,
    overridePrompts,
  }) => {
  const [promptsToShow, setPromptsToShow] = useState<string[]>(initialPrompts);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handlePromptPress = (prompt: string) => {
    // *** KEY CHANGE HERE ***
    // Instead of calling onPromptSend directly, call the new prop
    onPromptSelectForInput(prompt);

    // After selecting a prompt, you probably want to clear these prompts
    // or reset to initial ones, as the user has now "acted" on them.
    // Assuming once an AI-suggested prompt is clicked, they go away.
    if (overridePrompts && overridePrompts.length > 0) {
      setPromptsToShow([]);
      setActiveKey(null);
    } else {
      // This part handles navigation *within* the hardcoded prompt sets
      const map = dynamicPromptsMap || followUpPromptsMap;
      if (map[prompt]) {
        setPromptsToShow(map[prompt]);
        setActiveKey(prompt);
      } else {
        setPromptsToShow(initialPrompts); // Reset to initial prompts if no follow-up
        setActiveKey(null);
      }
    }
  };

  useEffect(() => {
    if (overridePrompts && overridePrompts.length > 0) {
      setPromptsToShow(overridePrompts);
      setActiveKey(null);
      return;
    }
  
    if (lastAISuggestion && dynamicPromptsMap) {
      const key = Object.keys(dynamicPromptsMap).find((k) =>
        lastAISuggestion.toLowerCase().includes(k.toLowerCase())
      );
      if (key) {
        setPromptsToShow(dynamicPromptsMap[key]);
        setActiveKey(key);
        return;
      }
    }

    setPromptsToShow(initialPrompts);
    setActiveKey(null);

  }, [lastAISuggestion, dynamicPromptsMap, overridePrompts]);
  

  if (promptsToShow.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={promptsToShow}
        numColumns={numColumns}
        keyExtractor={(item, idx) => `prompt-${item}-${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePromptPress(item)} style={styles.promptButton}>
            <Text style={styles.promptText}>{item}</Text>
          </TouchableOpacity>
        )}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  promptButton: {
    backgroundColor: Colors.userBubble,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    flex: 1,
    marginHorizontal: Spacing.xs,
    width: (screenWidth - (Spacing.md * 2) - (Spacing.xs * (numColumns * 2))) / numColumns,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PromptSelector;