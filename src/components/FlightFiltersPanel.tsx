import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface FilterOptions {
  airlines?: string[];
  bagsIncluded?: boolean;
  cabins?: string[];
  duration?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  stops?: number[];
}

interface Props {
  availableFilters: FilterOptions;
  initialFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  onBackToResults: () => void; // 👈 ADD THIS
}

const FlightFiltersPanel = ({ availableFilters, initialFilters, onApplyFilters,onBackToResults}: Props) => {
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(initialFilters.airlines || []);
  const [selectedStops, setSelectedStops] = useState<number[]>(initialFilters.stops || []);
  const [minPrice, setMinPrice] = useState<string>(initialFilters.price?.min?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters.price?.max?.toString() || '');

  useEffect(() => {
    setSelectedAirlines(initialFilters.airlines || []);
    setSelectedStops(initialFilters.stops || []);
    setMinPrice(initialFilters.price?.min?.toString() || '');
    setMaxPrice(initialFilters.price?.max?.toString() || '');
  }, [initialFilters]);

  const toggleAirline = useCallback((airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]
    );
  }, []);

  const toggleStop = useCallback((stop: number) => {
    setSelectedStops((prev) =>
      prev.includes(stop) ? prev.filter((s) => s !== stop) : [...prev, stop]
    );
  }, []);

  const handleApply = () => {
    const newFilters: FilterOptions = {
      airlines: selectedAirlines.length > 0 ? selectedAirlines : undefined,
      stops: selectedStops.length > 0 ? selectedStops : undefined,
      price: {
        min: minPrice ? parseFloat(minPrice) : undefined,
        max: maxPrice ? parseFloat(maxPrice) : undefined,
      },
    };
    if (newFilters.price?.min === undefined && newFilters.price?.max === undefined) {
      delete newFilters.price;
    }
    onApplyFilters(newFilters);
    onBackToResults(); // ✅ switch back to results
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {availableFilters.airlines && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Airlines</Text>
          <View style={styles.optionsContainer}>
            {availableFilters.airlines.map((airline) => (
              <TouchableOpacity
                key={airline}
                style={[
                  styles.optionButton,
                  selectedAirlines.includes(airline) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleAirline(airline)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAirlines.includes(airline) && styles.optionTextSelected,
                  ]}
                >
                  {airline}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {availableFilters.stops && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stops</Text>
          <View style={styles.optionsContainer}>
            {[...availableFilters.stops].sort().map((stop) => (
              <TouchableOpacity
                key={stop}
                style={[
                  styles.optionButton,
                  selectedStops.includes(stop) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleStop(stop)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedStops.includes(stop) && styles.optionTextSelected,
                  ]}
                >
                  {stop === 0 ? 'Direct' : `${stop} Stop${stop > 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Range ($)</Text>
        <View style={styles.priceInputs}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={minPrice}
            onChangeText={setMinPrice}
          />
          <Text style={styles.separator}>-</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  section: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00bfff',
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#00bfff',
  },
  optionText: {
    color: '#00bfff',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#fff',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  separator: {
    color: '#fff',
    fontSize: 20,
    marginHorizontal: 10,
  },
  applyButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FlightFiltersPanel;