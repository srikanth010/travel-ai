import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { BlurView } from '@react-native-community/blur';
import FlightFiltersPanel from '././FlightFiltersPanel'; // replace with your real component

interface FlightCard {
  airline: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  returnDateTime?: string;
  price: number;
  segments: number;
  durationMinutes: number;
}

interface FilterOptions {
  airlines?: string[];
  bagsIncluded?: boolean;
  cabins?: string[];
  duration?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  stops?: number[];
}

interface Props {
  cards: FlightCard[];
  onClose?: () => void;
  availableFilters: FilterOptions;
  initialFilters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const FlightResultsSheet = forwardRef(
  ({ cards, onClose, availableFilters, initialFilters, onApplyFilters }: Props, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const toggleView = () => setShowFilters((prev) => !prev);

    useImperativeHandle(ref, () => ({
      expand: () => {
        setIsVisible(true);
        sheetRef.current?.expand();
      },
      close: () => {
        setIsVisible(false);
        sheetRef.current?.close();
        onClose?.();
      },
      minimize: () => {
        sheetRef.current?.snapToIndex(0);
      },
      showFilters: () => {
        setShowFilters(true);
        setIsVisible(true);
        sheetRef.current?.expand();
      },
    }));

    const snapPoints = ['10%', '40%', '80%'];

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index <= 0) {
          setIsVisible(false);
          onClose?.();
        }
      },
      [onClose]
    );

    if (!isVisible) return null;

    return (
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        onChange={handleSheetChanges}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={1}
            disappearsOnIndex={0}
          />
        )}
        backgroundStyle={{ backgroundColor: '#1e1e1e' }}
        handleIndicatorStyle={{ backgroundColor: 'gray' }}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {showFilters ? 'Filters' : 'Flight Results'}
          </Text>
          <TouchableOpacity onPress={toggleView}>
            <Text style={styles.toggleButton}>
              {showFilters ? 'Back to Results' : 'Show Filters'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sheetRef.current?.close()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {showFilters ? (
  <FlightFiltersPanel
    availableFilters={availableFilters}
    initialFilters={initialFilters}
    onApplyFilters={(filters) => {
      onApplyFilters(filters);
    }}
    onBackToResults={() => setShowFilters(false)} // ✅ this closes filter view
  />
) : (
          <BottomSheetFlatList
            data={cards}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>✈️ {item.airline}</Text>
                <Text style={styles.cardDateTitle}>
                  {item.origin} → {item.destination}
                </Text>
                <Text style={styles.cardDateTitle}>
                  Depart: {new Date(item.departureDateTime).toLocaleString()}
                </Text>
                <Text style={styles.cardDateTitle}>
                  {item.returnDateTime
                    ? `Return: ${new Date(item.returnDateTime).toLocaleString()}`
                    : 'One-way flight'}
                </Text>
                <Text style={styles.cardDateTitle}>Stops: {item.segments - 1}</Text>
                <Text style={styles.cardDateTitle}>Duration: {item.durationMinutes} mins</Text>
                <Text style={styles.cardDateTitle}>
                  Price: ${item.price.toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/flights?q=flights+from+${item.origin}+to+${item.destination}`
                    )
                  }
                >
                  <Text style={styles.cardButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    color: '#00bfff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  closeButton: {
    color: '#00bfff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'rgba(32, 162, 243, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00bfff',
    marginVertical: 6,
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#00bfff',
    fontSize: 16,
    marginBottom: 4,
  },
  cardDateTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  cardButton: {
    marginTop: 8,
    backgroundColor: '#00bfff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FlightResultsSheet;
