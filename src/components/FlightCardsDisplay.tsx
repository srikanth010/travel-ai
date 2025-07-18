// components/FlightCardsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Linking } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles'; // Import your theme variables

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

  // Determine which cards to display based on showAll state
  const displayedCards = showAll ? cards : cards.slice(0, 3);

  // Reset showAll to false if cards change (new search results)
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
    // Ensure "0 min" is not displayed if minutes are 0
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : '';
    return `${hours} hrs ${minutesPart}`.trim();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedCards}
        keyExtractor={(_, i) => i.toString()}
        // Remove horizontal prop for vertical scrolling
        // showsHorizontalScrollIndicator={false} // Remove this too
        scrollEnabled={true} // Explicitly enable vertical scrolling if the list is longer than view
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Row 1: Airline Logo, Times, Price, Dropdown */}
            <View style={styles.row1}>
              <View style={styles.airlineLogoContainer}>
                {/* For JetBlue, if you have a custom logo or 'JB' */}
                <Text style={styles.airlineLogoText}>{item.airline.charAt(0)}</Text>
                {/* <Image source={{ uri: item.airlineLogoUrl }} style={styles.airlineLogoImage} /> */}
              </View>
              <View style={styles.timesContainer}>
                <Text style={styles.timeText}>
                  {new Date(item.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.timeText}>
                  {new Date(item.returnDateTime || item.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </Text>
              </View>
              <View style={styles.priceDropdownContainer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>US${item.price.toFixed(0)}</Text>
                  <Text style={styles.roundTripText}>{item.returnDateTime ? 'round trip' : 'one way'}</Text>
                </View>
                {/* The dropdown arrow icon (using text for now) */}
                <TouchableOpacity style={styles.dropdownIcon}>
                    <Text style={styles.dropdownIconText}>⌄</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Row 2: Origin and Destination */}
            <View style={styles.row2}>
              <Text style={styles.airportCode}>{item.origin}</Text>
              {/* This empty view pushes the destination to the right */}
              <View style={{flex: 1}}></View>
              <Text style={styles.airportCode}>{item.destination}</Text>
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
              {/* Optional: "+38% emissions" */}
              {/* <TouchableOpacity style={styles.emissionsTag}>
                <Text style={styles.emissionsText}>+38% emissions</Text>
                <Text style={styles.infoIcon}>ⓘ</Text>
              </TouchableOpacity> */}
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
      {cards.length > 3 && ( // Only show "Show All/Show Less" if there are more than 3 cards
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
    // No specific height needed, will expand with content
    marginVertical: Spacing.sm,
  },
  flatListContent: {
    paddingBottom: Spacing.sm, // Add some padding at the bottom of the list
  },
  card: {
    backgroundColor: Colors.aiBubble,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#00bfff', // Based on your screenshot, it's still blue
    paddingVertical: Spacing.md, // Adjusted padding
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md, // Space between cards
    width: '95%', // Take up most of the chat bubble width
    alignSelf: 'center', // Center the card within the bubble
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs, // Reduced margin
  },
  airlineLogoContainer: {
    width: 28, // Slightly larger logo area
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#002060', // JetBlue dark blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm, // Space after logo
  },
  airlineLogoText: {
    color: Colors.text,
    fontSize: FontSize.md, // Slightly larger font for logo letter
    fontWeight: 'bold',
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // We want this to take up space but not push price too far
    // Will rely on the priceDropdownContainer pushing itself to the end
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  arrow: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginHorizontal: Spacing.xs,
  },
  priceDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push to the right
  },
  priceContainer: {
    alignItems: 'flex-end', // Align price and "round trip" text to the right
  },
  priceText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: '#28a745', // Green for price
  },
  roundTripText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  dropdownIcon: {
    marginLeft: Spacing.xs, // Space between price and icon
    paddingHorizontal: Spacing.xs, // Make touchable area larger
    paddingVertical: Spacing.xs / 2,
  },
  dropdownIconText: {
    fontSize: FontSize.lg, // Adjust size to match screenshot
    color: Colors.text,
  },
  row2: {
    flexDirection: 'row',
    // This padding aligns the airport codes under the times
    paddingLeft: 28 + Spacing.sm, // Width of airlineLogoContainer + its marginRight
    marginBottom: Spacing.sm, // Space between airports and details
  },
  airportCode: { // Unified style for both airport codes
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md, // Space between details and "Book Now"
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginRight: Spacing.xs, // Small space between details
  },
  emissionsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', // Light background for the tag
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    marginLeft: Spacing.md, // Space from other details
  },
  emissionsText: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  infoIcon: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginLeft: Spacing.xs / 2,
  },
  bookNowButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm, // Increased vertical padding for button
    paddingHorizontal: Spacing.lg, // Increased horizontal padding
    alignSelf: 'center', // Center the button horizontally
    marginTop: 0, // No extra margin-top
    width: '100%', // Make button full width of card content area
    alignItems: 'center', // Center text inside button
  },
  bookNowButtonText: {
    color: Colors.buttonText,
    fontWeight: 'bold',
    fontSize: FontSize.md, // Slightly larger font for button
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