
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    'Medical Emergency',
    'Road Accident',
    'Fire Emergency',
    'Harassment',
    'Other Emergency',
  ];

  const submitEmergency = () => {
    if (!category || !description.trim() || !location.trim()) {
      Alert.alert('Missing Information', 'Please complete all fields.');
      return;
    }

    Alert.alert(
      'Emergency Report Created',
      'Your demo emergency report has been submitted successfully.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowForm(false);
            setCategory('');
            setDescription('');
            setLocation('');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>EMERGIX AI</Text>
          <Text style={styles.tagline}>
            Emergency Response System
          </Text>
        </View>

        {!showForm ? (
          <>
            <View style={styles.welcome}>
              <Text style={styles.heading}>Welcome!</Text>
              <Text style={styles.description}>
                Your safety matters. Get help when you need it.
              </Text>
            </View>

            <Pressable
              style={styles.sosButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.sosText}>SOS</Text>
              <Text style={styles.sosDescription}>
                Report an Emergency
              </Text>
            </Pressable>

            <Text style={styles.sectionTitle}>
              Emergency Categories
            </Text>

            {categories.map((item) => (
              <Pressable
                key={item}
                style={styles.category}
                onPress={() => {
                  setCategory(item);
                  setShowForm(true);
                }}
              >
                <Text style={styles.categoryText}>{item}</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.heading}>Report Emergency</Text>

            <Text style={styles.label}>
              Emergency Category
            </Text>

            {categories.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.category,
                  category === item && styles.selectedCategory,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text style={styles.categoryText}>{item}</Text>
              </Pressable>
            ))}

            <Text style={styles.label}>
              Emergency Description
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Describe what happened"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.label}>Your Location</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your location"
              value={location}
              onChangeText={setLocation}
            />

            <Pressable
              style={styles.submitButton}
              onPress={submitEmergency}
            >
              <Text style={styles.submitText}>
                Submit Emergency Report
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.footer}>
          EMERGIX AI | Helping People, Saving Lives
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#263F32',
    padding: 25,
    paddingTop: 55,
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#DCE8DF',
    fontSize: 14,
    marginTop: 5,
  },
  welcome: {
    padding: 22,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#263F32',
  },
  description: {
    fontSize: 15,
    color: '#555555',
    marginTop: 8,
  },
  sosButton: {
    backgroundColor: '#D93636',
    marginHorizontal: 22,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: 'bold',
  },
  sosDescription: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#263F32',
    margin: 22,
  },
  category: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 22,
    marginBottom: 12,
    padding: 18,
    borderRadius: 10,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#263F32',
  },
  categoryText: {
    fontSize: 15,
    color: '#263F32',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 22,
    color: '#263F32',
  },
  form: {
    padding: 22,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263F32',
    marginTop: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    minHeight: 50,
  },
  submitButton: {
    backgroundColor: '#D93636',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#263F32',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#777777',
    margin: 25,
    fontSize: 12,
  },
});
