// components/FlightCardsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Linking } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles';

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

interface Props {
  cards: FlightCard[];
}

const FlightCardsDisplay: React.FC<Props> = ({ cards }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedCards = showAll ? cards : cards.slice(0, 3);

  useEffect(() => {
    setShowAll(false);
  }, [cards]);


  if (!cards || cards.length === 0) {
    return null;
  }

  // Helper to format duration into hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : '';
    return `${hours} hrs ${minutesPart}`.trim();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedCards}
        keyExtractor={(_, i) => i.toString()}
        scrollEnabled={true}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Row 1: Airline Logo, Times, Price, Dropdown */}
            <View style={styles.row1}>
              <View style={styles.airlineLogoContainer}>
                <Text style={styles.airlineLogoText}>{item.airline.charAt(0)}</Text>
              </View>

              {/* Central Content (Times and Airports) */}
              <View style={styles.centralContent}>
                {/* Times Row */}
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>
                    {new Date(item.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.timeText}>
                    {new Date(item.returnDateTime || item.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                </View>
                {/* Airport Codes Row - Aligned under times */}
                <View style={styles.airportRow}>
                  <Text style={styles.airportCode}>{item.origin}</Text>
                  {/* The actual width of the origin text will push the destination */}
                  <Text style={styles.airportCode}>{item.destination}</Text>
                </View>
              </View>

              <View style={styles.priceDropdownContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>US${item.price.toFixed(0)}</Text>
                  <Text style={styles.roundTripText}>{item.returnDateTime ? 'round trip' : 'one way'}</Text>
                </View>
                <TouchableOpacity style={styles.dropdownIcon}>
                    <Text style={styles.dropdownIconText}>⌄</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 3: Stops, Duration, Airline Name, Emissions (Optional) */}
            <View style={styles.row3}>
              <Text style={styles.detailText}>
                {item.segments - 1 === 0 ? 'Non-stop' : `${item.segments - 1} stop${item.segments - 1 > 1 ? 's' : ''}`}
              </Text>
              <Text style={styles.detailText}> • </Text>
              <Text style={styles.detailText}>{formatDuration(item.durationMinutes)}</Text>
              <Text style={styles.detailText}> • </Text>
              <Text style={styles.detailText}>{item.airline}</Text>
            </View>

            {/* Book Now Button */}
            <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => Linking.openURL(`https://www.google.com/flights?q=flights+from+${item.origin}+to+${item.destination}`)}
            >
                <Text style={styles.bookNowButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      {cards.length > 3 && (
        <TouchableOpacity style={styles.showAllButton} onPress={() => setShowAll(!showAll)}>
          <Text style={styles.showAllButtonText}>
            {showAll ? 'Show Less' : `Show All ${cards.length} Flights`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  flatListContent: {
    paddingBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.aiBubble,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#00bfff',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    width: '95%',
    alignSelf: 'center',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to start for top-level alignment
    marginBottom: Spacing.xs,
  },
  airlineLogoContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#002060',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  airlineLogoText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: 'bold',
  },
  centralContent: {
    flex: 1, // This section will take up remaining space before the price
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // We remove justifyContent: 'space-between' here and let flex on timeText handle it
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    // Add flexGrow to allow times to take equal space.
    // This is crucial for alignment.
    flexGrow: 1,
    textAlign: 'left', // Ensure text starts from left of its flex space
    // To match the screenshot, the gap between JFK and LHR looks consistent.
    // We can make the departure time slightly flex-grow more or use minWidth
  },
  arrow: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginHorizontal: Spacing.xs,
    flexShrink: 0, // Don't shrink the arrow
  },
  priceDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm, // Keep a clear margin
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: '#28a745',
  },
  roundTripText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  dropdownIcon: {
    marginLeft: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs / 2,
  },
  dropdownIconText: {
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  airportRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs / 2, // Small vertical space between times and airports
    // Remove paddingLeft here, alignment is handled by centralContent flex
  },
  airportCode: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    flexGrow: 1, // Allow airport codes to grow similar to times
    textAlign: 'left', // Align text to the left
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm, // Increased margin for better spacing from airport codes
    marginBottom: Spacing.md,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginRight: Spacing.xs,
  },
  bookNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    alignSelf: 'center',
    marginTop: 0,
    width: '100%',
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: FontSize.md,
  },
  showAllButton: {
    marginTop: Spacing.md,
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(0, 191, 255, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#00bfff',
  },
  showAllButtonText: {
    color: '#00bfff',
    fontWeight: 'bold',
  },
});

export default FlightCardsDisplay;