// File: frontend/App.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Alert, Platform, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
// Audio and Picker imports removed as per HOD's instruction
// import { Audio } from 'expo-av';
// import { Picker } from '@react-native-picker/picker';

// --- Main App Component ---
export default function App() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]); // This will be a list of strings
  const [imageUri, setImageUri] = useState(null); // To display selected image
  const [isDemoMode, setIsDemoMode] = useState(false); // Track if we're in demo mode

  // Backend URL configuration for different platforms
  const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

  // Check backend connectivity (commented out for demo mode)
  /*
  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  */
  // Request camera and media library permissions
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert('Permission required', 'Camera and media library permissions are needed to upload documents.');
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Clear previous results when a new image is selected
      setSummary('');
      setKeyPoints([]);
      setIsDemoMode(false); // Reset demo mode
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // Clear previous results when a new image is selected
      setSummary('');
      setKeyPoints([]);
      setIsDemoMode(false); // Reset demo mode
    }
  };

  // Process the document (send to backend)
  const processDocument = async () => {
    if (!imageUri) {
      Alert.alert('No Document', 'Please select or take a photo of a document first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setKeyPoints([]);
    setIsDemoMode(false); // Reset demo mode before processing

    // Create FormData for file upload
    const formData = new FormData();

    // Handle different platforms for file upload
    if (Platform.OS === 'web') {
      // For web, convert the image URI to a blob
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
      // For mobile platforms
      formData.append('file', {
        uri: imageUri,
        name: `document.${imageUri.split('.').pop() || 'jpg'}`,
        type: `image/${imageUri.split('.').pop() || 'jpeg'}`,
      });
    }

    // PRODUCTION CODE - Using your BART + BERT backend
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

    /*
    // Backend API code commented out since no backend is running
    // Uncomment this section when backend server is available:

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: `document.${imageUri.split('.').pop()}`,
      type: `image/${imageUri.split('.').pop()}`,
    });

    try {
      // Call the backend API
      const response = await fetch(`${backendUrl}/process_document`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 5000,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process document.');
      }

      const data = await response.json();
      setSummary(data.summary);
      setKeyPoints(data.key_points);

      Alert.alert(
        '✅ Analysis Complete',
        `Document analyzed successfully using ${data.metadata?.processing_method || 'AI'}. Review the summary and key points below.`,
        [{ text: 'Review Results', style: 'default' }]
      );

    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert('Processing Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
    */

    /*
    // Uncomment this section when backend is available:
    try {
      const response = await fetch(`${backendUrl}/process_document`, {
        method: 'POST',
        body: formData,
        headers: {
          // 'Authorization': 'Basic ' + btoa('user:password'), // Uncomment for basic auth if enabled in main.py
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process document.');
      }

      const data = await response.json();
      setSummary(data.summary);
      setKeyPoints(data.key_points); // This expects a list of strings

    } catch (error) {
      console.error('Error processing document:', error);
      Alert.alert('Processing Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
    */
  };

  // Audio playback function removed as per HOD's instruction
  // const playAudio = async () => { ... }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Consent Before Signing</Text>
      <Text style={styles.subtitle}>Legal Awareness App - LLM Powered</Text>

      {isDemoMode && (
        <View style={styles.demoIndicator}>
          <Text style={styles.demoText}>⚠️ Demo Mode - Backend Offline</Text>
        </View>
      )}

      {!isDemoMode && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📄 Upload a legal document for AI-powered analysis</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.label}>Selected Document:</Text>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </View>
      )}

      {/* Language picker removed as per HOD's instruction */}
      {/* <Text style={styles.label}>Select Output Language:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="English" value="en" />
          <Picker.Item label="Tamil (தமிழ்)" value="ta" />
          <Picker.Item label="Kannada (ಕನ್ನಡ)" value="kn" />
          <Picker.Item label="Hindi (हिन्दी)" value="hi" />
          <Picker.Item label="Telugu (తెలుగు)" value="te" />
          <Picker.Item label="Malayalam (മലയാളം)" value="ml" />
        </Picker>
      </View> */}

      <TouchableOpacity
        style={[styles.processButton, (loading || !imageUri) && styles.processButtonDisabled]}
        onPress={processDocument}
        disabled={loading || !imageUri}
      >
        <Text style={styles.processButtonText}>{loading ? "Processing..." : "Process Document"}</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      )}

      {!loading && (summary || keyPoints.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Summary (English)</Text>
          <Text style={styles.resultText}>{summary || 'No summary available.'}</Text>

          <Text style={styles.sectionTitle}>Crucial Points (English)</Text>
          {keyPoints.length > 0 ? (
            keyPoints.map((point, index) => (
              <Text key={index} style={styles.resultText}>• {point}</Text>
            ))
          ) : (
            <Text style={styles.resultText}>No crucial points identified.</Text>
          )}
          
          {/* Translated output and audio button removed */}
          {/* {selectedLanguage !== 'en' && (
            <>
              <Text style={styles.sectionTitle}>Translated Output ({selectedLanguage})</Text>
              <Text style={styles.resultText}>{translatedOutput || 'Translation not available.'}</Text>
            </>
          )}
          
          {audioUrl && (
            <TouchableOpacity style={styles.playAudioButton} onPress={playAudio}>
              <Text style={styles.playAudioButtonText}>Play Audio Summary</Text>
            </TouchableOpacity>
          )} */}
        </View>
      )}
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F7F4',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: { // This style is now unused but kept for reference
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: { // This style is now unused but kept for reference
    height: 50,
    width: '100%',
  },
  processButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  processButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  resultsContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
    color: '#555',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 10,
  },
  playAudioButton: { // This style is now unused but kept for reference
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playAudioButtonText: { // This style is now unused but kept for reference
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  demoIndicator: {
    backgroundColor: '#ff9800',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  demoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  permanentDemoIndicator: {
    backgroundColor: '#4caf50',
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  permanentDemoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
