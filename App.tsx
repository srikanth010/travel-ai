import React from 'react';
import { AppRegistry, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './src/navigation/AppNavigator'; // Your bottom tabs
import ChatScreen from './src/screens/ChatScreen'; // Import your hidden screen
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Text strings must be rendered']); // Temporarily suppress

const RootStack = createNativeStackNavigator();

const App = () => {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={AppNavigator} />
          <RootStack.Screen name="Chat" component={ChatScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;

AppRegistry.registerComponent('main', () => App);
