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
  } from 'react-native';
  import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetFlatList,
  } from '@gorhom/bottom-sheet';
  import { BlurView } from '@react-native-community/blur';
  interface FlightCard {
    airline: string;
    origin: string;
    destination: string;
    departureDateTime: string;
    returnDateTime?: string;
    price: string;
  }
  
  interface Props {
    cards: FlightCard[];
    onClose?: () => void; // Add this prop
  }
  
  const FlightResultsSheet = forwardRef(({ cards, onClose }: Props, ref) => {
    const sheetRef = useRef<BottomSheet>(null);
    const [isVisible, setIsVisible] = useState(false);
  
    // Expose methods to parent (ChatScreen)
    useImperativeHandle(ref, () => ({
      expand: () => {
        setIsVisible(true);
        sheetRef.current?.expand();
      },
      close: () => {
        setIsVisible(false);
        sheetRef.current?.close();
        onClose?.(); // Notify parent
      },
      minimize: () => {
        sheetRef.current?.snapToIndex(0);
      },
    }));
  
    const snapPoints = ['10%', '40%', '80%'];
  
    const handleSheetChanges = useCallback((index: number) => {
        if (index <= 0) { // If the sheet is fully hidden or at its lowest snap point (index 0 or less)
            setIsVisible(false); // This state within FlightResultsSheet itself is good
            onClose?.(); // <-- Call the parent's onClose callback here
        }
    }, [onClose]); // Add onClose to useCallback dependencies
  
    if (!isVisible) return null;
  
    return (
      <BottomSheet
        ref={sheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false} // prevent swipe to close
        onChange={handleSheetChanges}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} disappearsOnIndex={0} />}
        backgroundStyle={{ backgroundColor: '#1e1e1e' }}
        handleIndicatorStyle={{ backgroundColor: 'gray' }}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Flight Results</Text>
          <TouchableOpacity onPress={() => {
            sheetRef.current?.close();
          }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
  
        <BottomSheetFlatList
          data={cards}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✈️ {item.airline}</Text>
              <Text style={styles.cardDateTitle}>{item.origin} → {item.destination}</Text>
              <Text style={styles.cardDateTitle}>Depart: {new Date(item.departureDateTime).toLocaleString()}</Text>
              <Text style={styles.cardDateTitle}>
                {item.returnDateTime
                  ? `Return: ${new Date(item.returnDateTime).toLocaleString()}`
                  : 'One-way flight'}
              </Text>
              <Text style={styles.cardDateTitle}>Price: ${item.price}</Text>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </BottomSheet>
    );
  });
  
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
    closeButton: {
      color: '#00bfff',
      fontSize: 20,
      fontWeight: 'bold',
    },
    card: {
        backgroundColor:'rgba(32, 162, 243, 0.2)',
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
  