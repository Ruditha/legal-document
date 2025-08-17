import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, Image, TouchableOpacity } from 'react-native';

export default function AnalysisScreen({ route, navigation }) {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Backend URL configuration for different platforms
  const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  useEffect(() => {
    if (imageUri) {
      processDocument();
    }
  }, [imageUri]);

  // Process the document (send to backend)
  const processDocument = async () => {
    if (!imageUri) {
      Alert.alert('No Document', 'Please select or take a photo of a document first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setKeyPoints([]);
    setIsDemoMode(false);

    // Create FormData for file upload
    const formData = new FormData();

    // Handle different platforms for file upload
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, `document.${imageUri.split('.').pop() || 'jpg'}`);
      } catch (error) {
        console.error('Error converting image for upload:', error);
        Alert.alert('Upload Error', 'Failed to prepare image for upload. Please try again.');
        setLoading(false);
        return;
      }
    } else {
      formData.append('file', {
        uri: imageUri,
        name: `document.${imageUri.split('.').pop() || 'jpg'}`,
        type: `image/${imageUri.split('.').pop() || 'jpeg'}`,
      });
    }

    try {
      console.log('Connecting to BART + BERT backend at:', backendUrl);

      const response = await fetch(`${backendUrl}/process_document`, {
        method: 'POST',
        body: formData,
        headers: Platform.OS === 'web' ? {} : {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process document.');
      }

      const data = await response.json();
      setSummary(data.summary || 'No summary available.');
      setKeyPoints(data.key_points || ['No key points extracted.']);

      Alert.alert(
        '✅ Analysis Complete',
        `Document analyzed successfully using ${data.metadata?.processing_method || 'Local BART + BERT'}. Review the summary and key points below.`,
        [{ text: 'Review Results', style: 'default' }]
      );

    } catch (error) {
      console.error('Error processing document:', error);

      // Fallback to demo mode if backend connection fails
      console.log('Backend connection failed, showing demo mode');
      setIsDemoMode(true);

      setTimeout(() => {
        setSummary('⚠️ BACKEND CONNECTION FAILED: This is demo content. Your BART + BERT backend at localhost:8000 is not reachable. Please ensure: 1) Backend server is running 2) No firewall blocking the connection 3) Correct API URL configuration.');
        setKeyPoints([
          '🔧 Check backend server: python main.py in backend folder',
          '🌐 Verify backend URL: http://localhost:8000/health should work',
          '🔥 Check firewall: Allow localhost:8000 connections',
          '📱 For mobile: Use your computer\'s IP address instead of localhost',
          '⚠️ This is demo mode - connect backend for real BART + BERT analysis'
        ]);

        Alert.alert(
          '⚠️ Backend Connection Failed',
          'Could not connect to your BART + BERT backend. Showing demo content instead. Check console for details.',
          [{ text: 'OK', style: 'default' }]
        );
        setLoading(false);
      }, 1000);

      return;
    }
    setLoading(false);
  };

  const analyzeAnother = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>

      {isDemoMode && (
        <View style={styles.demoIndicator}>
          <Text style={styles.demoText}>⚠️ Demo Mode - Backend Offline</Text>
        </View>
      )}

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.label}>Analyzed Document:</Text>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Analyzing document...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      )}

      {!loading && (summary || keyPoints.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>📄 Document Summary</Text>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{summary || 'No summary available.'}</Text>
          </View>

          <Text style={styles.sectionTitle}>🔍 Key Points</Text>
          {keyPoints.length > 0 ? (
            keyPoints.map((point, index) => (
              <View key={index} style={styles.keyPointItem}>
                <Text style={styles.keyPointBullet}>•</Text>
                <Text style={styles.keyPointText}>{point}</Text>
              </View>
            ))
          ) : (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>No crucial points identified.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.analyzeButton} onPress={analyzeAnother}>
            <Text style={styles.analyzeButtonText}>Analyze Another Document</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
  backButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F7F4',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  demoIndicator: {
    backgroundColor: '#ff9800',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  imagePreview: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  resultsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#333',
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  keyPointItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyPointBullet: {
    fontSize: 18,
    color: '#007bff',
    marginRight: 10,
    fontWeight: 'bold',
  },
  keyPointText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
