import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const { width: screenWidth } = Dimensions.get('window');

const categories = [
    { id: '1', title: 'Flights', icon: <MaterialIcons name="flight" size={28} color="#fff" /> },
    { id: '2', title: 'Hotels', icon: <MaterialIcons name="hotel" size={26} color="#fff" /> },
    { id: '3', title: 'Experiences', icon: <MaterialIcons name="attractions" size={30} color="#fff" /> },
    { id: '4', title: 'Restaurants', icon: <Ionicons name="restaurant" size={28} color="#fff" /> },
    { id: '5', title: 'Hikes', icon: <Icon name="hiking" size={30} color="#fff" /> },
    { id: '6', title: 'Deals', icon: <Ionicons name="pricetag" size={28} color="#fff" /> },
  ];


const PopularCategories = ({ onCategoryPress }: { onCategoryPress: (category: string) => void }) => {
    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.card} onPress={() => onCategoryPress(item.title)}>
         <BlurView
         blurType="light"
         blurAmount={20}
         reducedTransparencyFallbackColor="rgba(0,0,0,0.8)"
         style={[styles.blur, { flex: 1, borderRadius: 24 }]}
         >
            <View style={styles.cardContentRow}>
              {item.icon}
              <Text style={styles.label}>{item.title}</Text>
            </View>
          </BlurView>
        </TouchableOpacity>
      );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Categories</Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

// Define a constant for padding to be used consistently
const listPadding = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginLeft: listPadding,
  },
  flatListContent: {
    paddingHorizontal: listPadding,
  },
  card: {
    width: '48%',
    height: 60, // Changed height to 80
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor:'rgba(32, 162, 243, 0.2)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  blur: {
    flex: 1,
    justifyContent: 'center', // Centers its direct child (cardContentRow) horizontally
    alignItems: 'center',    // Centers its direct child (cardContentRow) vertically
    borderRadius: 20,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: '#fff',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});

export default PopularCategories;
