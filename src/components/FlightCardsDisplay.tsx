// components/FlightCardsDisplay.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Linking } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '../theme/styles'; // Adjust path if necessary
import Icon from 'react-native-vector-icons/Ionicons';

interface FlightSegment {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  arrivalDateTime: string;
  durationMinutes: number;
  aircraft?: string | null; // Added null explicitly
  amenities?: string[];
  emissions?: {
    value: number;
    unit: string;
    description?: string;
  };
}

interface FlightCard {
  airline: string;
  origin: string;
  destination: string;
  departureDateTime: string;
  returnDateTime?: string | null; // Added null explicitly
  price: number;
  segments: number;
  durationMinutes: number;
  outboundSegments: FlightSegment[];
  returnSegments?: FlightSegment[];
}

interface Props {
  cards: FlightCard[];
}

const FlightCardsDisplay: React.FC<Props> = ({ cards }) => {
  console.log("FlightCardsDisplay: Component rendered."); // Debug 1
  console.log("FlightCardsDisplay: Initial cards prop received:", cards); // Debug 2
  console.log("FlightCardsDisplay: Type of cards prop:", typeof cards); // Debug 3
  console.log("FlightCardsDisplay: Is cards an array?", Array.isArray(cards)); // Debug 4
  console.log("FlightCardsDisplay: Number of cards received:", cards ? cards.length : 0); // Debug 5


  const [showAll, setShowAll] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);

  // If cards is null/undefined or not an array, ensure it's treated as an empty array for slicing
  const actualCards = Array.isArray(cards) ? cards : [];
  const displayedCards = showAll ? actualCards : actualCards.slice(0, 3);
  console.log("FlightCardsDisplay: Number of displayedCards:", displayedCards.length); // Debug 6

  useEffect(() => {
    console.log("FlightCardsDisplay: useEffect triggered due to cards change."); // Debug 7
    setShowAll(false);
    setExpandedCardIndex(null);
  }, [cards]);

  // Check if there are no cards to display after initial checks
  if (!actualCards || actualCards.length === 0) {
    console.log("FlightCardsDisplay: No actual cards to display, returning null."); // Debug 8
    return null;
  }

  // Helper to format duration into hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}` : '';
    return `${hours} hrs ${minutesPart}`.trim();
  };

  // Helper to format date for expanded view
  const formatDateForExpandedView = (dateTime: string) => {
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) { // Check for invalid date
        return "Invalid Date";
      }
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) {
      console.error("Error formatting date:", e, "DateTime string:", dateTime);
      return "Error Date";
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayedCards}
        keyExtractor={(_, i) => i.toString()}
        scrollEnabled={true}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item, index }) => {
          console.log(`FlightCardsDisplay: Rendering FlatList item ${index}:`, item.airline, item.origin, item.destination); // Debug 9
          console.log(`FlightCardsDisplay: Item ${index} outboundSegments type:`, typeof item.outboundSegments); // Debug 10
          console.log(`FlightCardsDisplay: Item ${index} outboundSegments is array:`, Array.isArray(item.outboundSegments)); // Debug 11
          console.log(`FlightCardsDisplay: Item ${index} outboundSegments length:`, item.outboundSegments ? item.outboundSegments.length : 'N/A'); // Debug 12

          // Defensive checks for segments before mapping
          const outboundSegments = item.outboundSegments && Array.isArray(item.outboundSegments) ? item.outboundSegments : [];
          const returnSegments = item.returnSegments && Array.isArray(item.returnSegments) ? item.returnSegments : [];


          return (
            <View style={styles.card}>
              {/* Top Row: Airline Logo, Times, Price, Dropdown */}
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
                      {/* Use item.returnDateTime if available, otherwise just departure time */}
                      {item.returnDateTime ? new Date(item.returnDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : new Date(item.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </Text>
                  </View>
                  {/* Airport Codes Row - Aligned under times */}
                  <View style={styles.airportRow}>
                    <Text style={styles.airportCode}>{item.origin}</Text>
                    <Text style={styles.airportCode}>{item.destination}</Text>
                  </View>
                </View>

                <View style={styles.priceDropdownContainer}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceText}>US${item.price.toFixed(0)}</Text>
                    <Text style={styles.roundTripText}>{item.returnDateTime ? 'round trip' : 'one way'}</Text>
                  </View>
                  {/* Dropdown to expand/collapse details */}
                  <TouchableOpacity
  style={styles.dropdownIcon}
  onPress={() => setExpandedCardIndex(expandedCardIndex === index ? null : index)}
>
  <Icon
    name={expandedCardIndex === index ? 'chevron-up' : 'chevron-down'}
    size={16}
    color="#fff" // or use your theme color
    style={{ marginLeft: 4 }}
  />
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

              {/* Expanded Details Section */}
              {expandedCardIndex === index && (
                <View style={styles.expandedDetailsContainer}>
                  {/* Outbound Flight Details */}
                  <View style={styles.expandedSectionHeader}>
                    <Text style={styles.expandedSectionTitle}>Departing flight - {formatDateForExpandedView(item.departureDateTime)}</Text>
                  </View>
                  {outboundSegments.map((segment, segIndex) => (
                    <View key={`out-seg-${segIndex}`} style={styles.segmentDetail}>
                      <View style={styles.segmentTimeLine}>
                        <View style={styles.segmentDot} />
                        <View style={styles.segmentLine} />
                      </View>
                      <View style={styles.segmentTextContent}>
                        <Text style={styles.segmentTime}>{new Date(segment.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                        <Text style={styles.segmentAirportName}>{segment.origin} - {segment.airline}</Text>
                        <Text style={styles.segmentAirportCode}>({segment.origin})</Text>
                        <Text style={styles.segmentDetailText}>Travel time: {formatDuration(segment.durationMinutes)}</Text>

                        <Text style={styles.segmentTime}>{new Date(segment.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                        <Text style={styles.segmentAirportName}>{segment.destination} - {segment.airline}</Text>
                        <Text style={styles.segmentAirportCode}>({segment.destination})</Text>

                        <View style={styles.segmentFlightInfo}>
                            <Text style={styles.segmentFlightInfoText}>{segment.airline} {segment.flightNumber} - Economy {segment.aircraft && `- ${segment.aircraft}`}</Text>
                            {/* Render amenities if available */}
                            {segment.amenities?.map((amenity, amIndex) => (
                              <Text key={`amenity-${amIndex}`} style={styles.segmentAmenityText}>{amenity}</Text>
                            ))}
                            {/* Emissions info */}
                            {segment.emissions && (
                              <Text style={styles.segmentAmenityText}>Emissions estimate: {segment.emissions.value} {segment.emissions.unit} {segment.emissions.description && `(${segment.emissions.description})`}</Text>
                            )}
                        </View>
                      </View>
                    </View>
                  ))}
                  {/* Avg emissions if applicable */}
                  <View style={styles.avgEmissionsContainer}>
                      <Text style={styles.avgEmissionsText}>Avg emissions</Text>
                  </View>

                  {/* Return Flight Details (if round trip) */}
                  {returnSegments.length > 0 && ( // Use returnSegments here
                    <>
                      <View style={styles.expandedSectionHeader}>
                        <Text style={styles.expandedSectionTitle}>Returning flight - {formatDateForExpandedView(returnSegments[0].departureDateTime)}</Text>
                      </View>
                      {returnSegments.map((segment, segIndex) => (
                         <View key={`ret-seg-${segIndex}`} style={styles.segmentDetail}>
                           <View style={styles.segmentTimeLine}>
                             <View style={styles.segmentDot} />
                             <View style={styles.segmentLine} />
                           </View>
                           <View style={styles.segmentTextContent}>
                             <Text style={styles.segmentTime}>{new Date(segment.departureDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                             <Text style={styles.segmentAirportName}>{segment.origin} - {segment.airline}</Text>
                             <Text style={styles.segmentAirportCode}>({segment.origin})</Text>
                             <Text style={styles.segmentDetailText}>Travel time: {formatDuration(segment.durationMinutes)}</Text>

                             <Text style={styles.segmentTime}>{new Date(segment.arrivalDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>
                             <Text style={styles.segmentAirportName}>{segment.destination} - {segment.airline}</Text>
                             <Text style={styles.segmentAirportCode}>({segment.destination})</Text>

                             <View style={styles.segmentFlightInfo}>
                                 <Text style={styles.segmentFlightInfoText}>{segment.airline} {segment.flightNumber} - Economy {segment.aircraft && `- ${segment.aircraft}`}</Text>
                                 {segment.amenities?.map((amenity, amIndex) => (
                                   <Text key={`amenity-ret-${amIndex}`} style={styles.segmentAmenityText}>{amenity}</Text>
                                 ))}
                                 {segment.emissions && (
                                   <Text style={styles.segmentAmenityText}>Emissions estimate: {segment.emissions.value} {segment.emissions.unit} {segment.emissions.description && `(${segment.emissions.description})`}</Text>
                                 )}
                             </View>
                           </View>
                         </View>
                      ))}
                      <View style={styles.avgEmissionsContainer}>
                          <Text style={styles.avgEmissionsText}>Avg emissions</Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {/* Book Now Button */}
              <TouchableOpacity
                  style={styles.bookNowButton}
                  onPress={() => Linking.openURL(`https://www.google.com/flights?q=flights+from+${item.origin}+to+${item.destination}`)}
              >
                  <Text style={styles.bookNowButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
      {/* Use actualCards.length here for the button logic */}
      {actualCards.length > 3 && (
        <TouchableOpacity style={styles.showAllButton} onPress={() => setShowAll(!showAll)}>
          <Text style={styles.showAllButtonText}>
            {showAll ? 'Show Less' : `Show All ${actualCards.length} Flights`}
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
    borderColor: '#00bfff', // Keeping the blue border
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    width: '95%',
    alignSelf: 'center',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    flexGrow: 1,
    textAlign: 'left',
  },
  arrow: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.textMuted,
    marginHorizontal: Spacing.xs,
    flexShrink: 0,
  },
  priceDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
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
    marginTop: Spacing.xs / 2,
  },
  airportCode: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    flexGrow: 1,
    textAlign: 'left',
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
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
  // --- New Styles for Expanded Details ---
  expandedDetailsContainer: {
    marginTop: Spacing.md,
    borderTopWidth: 1, // Separator line
    borderTopColor: Colors.borderColor,
    paddingTop: Spacing.md,
  },
  expandedSectionHeader: {
    marginBottom: Spacing.sm,
  },
  expandedSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  segmentDetail: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  segmentTimeLine: {
    width: 20, // Width for the dot and line column
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  segmentDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.circle,
    backgroundColor: Colors.textMuted, // A muted dot color
    marginBottom: 2, // Small gap between dot and line
  },
  segmentLine: {
    flex: 1, // Make the line fill vertical space
    width: 2, // Thickness of the line
    backgroundColor: Colors.textMuted, // Color of the line
  },
  segmentTextContent: {
    flex: 1, // Take remaining horizontal space
  },
  segmentTime: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs / 2,
  },
  segmentAirportName: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  segmentAirportCode: {
    fontSize: FontSize.xs, // Smaller for the code in parentheses
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  segmentDetailText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  segmentFlightInfo: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  segmentFlightInfoText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    marginBottom: Spacing.xs / 2,
  },
  segmentAmenityText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs / 2,
  },
  avgEmissionsContainer: {
    backgroundColor: Colors.borderColor, // Light background for the box
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    alignSelf: 'flex-start', // Align left
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  avgEmissionsText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});

export default FlightCardsDisplay;