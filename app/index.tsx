import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { fixTextWithAI } from '../utils/gemini';

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagic = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    const polishedText = await fixTextWithAI(text);
    setText(polishedText);
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>GhostWriter 👻</Text>
            <Text style={styles.subtitle}>Turn mess into masterpiece.</Text>
          </View>

          {/* Input Area */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Type messy notes here... (e.g. 'meeting with raj was good he agreed for 10% discount')"
              placeholderTextColor="#555"
              value={text}
              onChangeText={setText}
            />
          </View>

          {/* Magic Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleMagic}
            disabled={isLoading || !text}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>✨ Rewrite It</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f', // Deep Black Background
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 40,
    flexGrow: 1,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  inputCard: {
    backgroundColor: '#1a1a1a', // Slightly lighter black for card
    borderRadius: 20,
    padding: 20,
    height: 300,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 25,
  },
  input: {
    flex: 1,
    color: '#E0E0E0',
    fontSize: 18,
    lineHeight: 28,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  }
});