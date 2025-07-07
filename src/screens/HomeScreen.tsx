import React from 'react';
import { View, Text, StyleSheet,FlatList } from 'react-native';
import GlassSearchBox from '../components/GlassSearchBar';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types'; // Update this path if needed
import PopularList from '../components/PopularList'; // Import your popular cards component
import PopularCategories from '../components/PopularCategories';
import UserProfileAvatar from '../components/UserProfileAvatar'; // Import your user profile avatar component


const HomeScreen: React.FC = () => {
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const data = [{ key: 'content' }]; // dummy data to use FlatList

return (
  <View style={styles.container}>
    <BlurView
      style={styles.glassEffect}
      blurType="light"
      blurAmount={20}
      reducedTransparencyFallbackColor="white"
    />
    <FlatList
      data={data}
      keyExtractor={(item) => item.key}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
      renderItem={() => (
        <>
        <UserProfileAvatar
        isFirstTimeUser={false}
        isLoggedIn={false}
        onSignInPress={() => {
          // trigger login flow
          console.log('Navigate to Sign In');
        }}
        userName="GUEST USER"
        avatarUrl="https://i.pravatar.cc/150?img=12"
        />

          <GlassSearchBox
            placeholder="Ask AI to Plan Your Trip ..."
            onPress={() => navigation.navigate('Chat')}
            style={{ marginBottom: 24 }}
          />
          <PopularCategories
            onCategoryPress={(category) => {
              console.log('User tapped:', category);
            }}
          />
          <PopularList />
        </>
      )}
    />
  </View>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 60, // or StatusBar.currentHeight if dynamic
    paddingHorizontal: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;