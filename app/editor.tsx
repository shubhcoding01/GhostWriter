import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fixTextWithAI } from '../utils/gemini';
import { getNoteById, NoteVersion, saveNote } from '../utils/storage';

export default function Editor() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the ID passed from Home
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data when screen opens
  useEffect(() => {
    if (id) loadData(id as string);
  }, [id]);

  const loadData = async (noteId: string) => {
    const note = await getNoteById(noteId);
    if (note) {
      setTitle(note.title);
      setText(note.currentContent);
      setHistory(note.history);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    await saveNote(id as string, text, title || "Untitled", "Manual Edit");
    await loadData(id as string); // Reload to update history list
    Alert.alert("Saved", "Your changes are now current. Old text moved to history.");
  };

  const handleAI = async () => {
    if (!text) return;
    setIsLoading(true);
    const polished = await fixTextWithAI(text);
    
    // Save the AI version
    await saveNote(id as string, polished, title || "Untitled", "AI Polish");
    await loadData(id as string); // Reload UI
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#000']} style={styles.background} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Manual Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <TextInput 
          style={styles.titleInput} 
          placeholder="Project Title..." 
          placeholderTextColor="#555"
          value={title}
          onChangeText={setTitle}
        />

        {/* Main Editor */}
        <View style={styles.editorCard}>
          <Text style={styles.label}>Current Version</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Start writing..."
            placeholderTextColor="#444"
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* AI Button */}
        <TouchableOpacity style={styles.aiBtn} onPress={handleAI} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.aiText}>✨ GhostWrite (AI Fix)</Text>}
        </TouchableOpacity>

        {/* History Section */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyHeader}>⏳ Version History</Text>
            {history.map((ver, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyLabel}>{ver.label}</Text>
                  <Text style={styles.historyDate}>{new Date(ver.timestamp).toLocaleTimeString()}</Text>
                </View>
                <Text style={styles.historyContent}>{ver.content}</Text>
                <TouchableOpacity onPress={() => setText(ver.content)}>
                  <Text style={styles.restoreBtn}>Restore this version</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scroll: { padding: 20, paddingTop: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { color: '#aaa', fontSize: 16 },
  saveBtn: { backgroundColor: '#333', padding: 8, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 12 },
  titleInput: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  
  editorCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  label: { color: '#3b82f6', fontSize: 12, marginBottom: 10, textTransform: 'uppercase' },
  input: { color: '#fff', fontSize: 16, lineHeight: 24 },
  
  aiBtn: {
    marginTop: 20,
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  aiText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  historySection: { marginTop: 40, marginBottom: 40 },
  historyHeader: { color: '#888', fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  historyCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  historyLabel: { color: '#aaa', fontWeight: 'bold', fontSize: 12 },
  historyDate: { color: '#555', fontSize: 10 },
  historyContent: { color: '#666', fontSize: 14, marginBottom: 10 },
  restoreBtn: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
});