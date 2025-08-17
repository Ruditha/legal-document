import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './components/HomeScreen';
import AnalysisScreen from './components/AnalysisScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [imageUri, setImageUri] = useState(null);

  const navigation = {
    navigate: (screen, params = {}) => {
      setCurrentScreen(screen);
      if (params.imageUri) {
        setImageUri(params.imageUri);
      }
    },
    goBack: () => {
      setCurrentScreen('Home');
      setImageUri(null);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Analysis':
        return (
          <AnalysisScreen 
            route={{ params: { imageUri } }} 
            navigation={navigation} 
          />
        );
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#007bff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentScreen === 'Analysis' ? 'Document Analysis' : 'Legal Awareness App'}
        </Text>
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
});
