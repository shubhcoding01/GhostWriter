
import * as Clipboard from 'expo-clipboard'; // Run: npx expo install expo-clipboard
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { fixTextWithAI } from '../utils/gemini';
import { getNoteById, NoteVersion, saveNote } from '../utils/storage';

export default function Editor() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  // Data States
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🧠 New AI States
  const [selectedStyle, setSelectedStyle] = useState("Professional");
  const [selectedLang, setSelectedLang] = useState("English");

  // Configuration Lists
  const stylesList = ["Professional", "Viral Tweet", "Poetic", "Witty", "ELI5"];
  const languagesList = ["English", "Hindi", "Hinglish", "Spanish", "French", "German"];

  // Load data on open
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

  // --- ACTIONS ---

  const handleManualSave = async () => {
    if (!id) return;
    await saveNote(id as string, text, title || "Untitled", "Manual Save");
    await loadData(id as string);
    Alert.alert("Saved", "Note saved locally.");
  };

  const handleAIEnhance = async () => {
    if (!text) return;
    setIsLoading(true);
    
    // 🚀 Pass Style AND Language to the Brain
    const polished = await fixTextWithAI(text, selectedStyle, selectedLang);
    
    // Offline Check
    if (polished === null) {
      setIsLoading(false);
      Alert.alert("Offline", "AI needs internet connection.");
      return;
    }
    
    // Save Result
    await saveNote(id as string, polished, title || "Untitled", `✨ ${selectedStyle} (${selectedLang})`);
    await loadData(id as string);
    setIsLoading(false);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.log("Sharing failed", error);
    }
  };

  const restoreVersion = (content: string) => {
    setText(content);
    Alert.alert("Restored", "Viewing older version. Click Save to keep it.");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#000']} style={styles.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* 1. Header Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Text style={styles.navText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleManualSave}>
              <Text style={styles.saveText}>💾 Save</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Title */}
          <TextInput 
            style={styles.titleInput} 
            placeholder="Title..." 
            placeholderTextColor="#666" 
            value={title} 
            onChangeText={setTitle} 
          />

          {/* 3. Main Editor Card */}
          <View style={styles.editorCard}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Write your thoughts here..."
              placeholderTextColor="#555"
              value={text}
              onChangeText={setText}
            />
            
            {/* Action Bar (Copy / Share) */}
            <View style={styles.actionBar}>
              <TouchableOpacity onPress={handleCopy} style={styles.actionBtn}>
                <Text style={styles.actionText}>📋 Copy</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Text style={styles.actionText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. AI Controls Section */}
          <View style={styles.controlsContainer}>
            
            {/* Style Selector */}
            <Text style={styles.sectionLabel}>CHOOSE STYLE:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {stylesList.map((style) => (
                <TouchableOpacity 
                  key={style} 
                  onPress={() => setSelectedStyle(style)}
                  style={[styles.chip, selectedStyle === style && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedStyle === style && styles.chipTextActive]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Language Selector */}
            <Text style={styles.sectionLabel}>OUTPUT LANGUAGE:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {languagesList.map((lang) => (
                <TouchableOpacity 
                  key={lang} 
                  onPress={() => setSelectedLang(lang)}
                  style={[styles.chip, selectedLang === lang && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedLang === lang && styles.chipTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </View>

          {/* 5. Magic AI Button */}
          <TouchableOpacity 
            style={styles.aiBtn} 
            onPress={handleAIEnhance} 
            disabled={isLoading || !text}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.aiText}>✨ Transform Text</Text>
            )}
          </TouchableOpacity>

          {/* 6. History List */}
          {history.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historyHeader}>Version History</Text>
              {history.map((ver, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.historyCard}
                  onPress={() => restoreVersion(ver.content)}
                >
                  <View style={styles.historyTop}>
                    <Text style={[
                      styles.historyLabel, 
                      ver.label.includes("✨") ? { color: '#3b82f6' } : { color: '#10b981' }
                    ]}>
                      {ver.label}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(ver.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.historyContent} numberOfLines={1}>
                    {ver.content}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  scroll: { padding: 20, paddingTop: 50 },
  
  // Navigation
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  navBtn: { padding: 10 },
  navText: { color: '#aaa', fontSize: 16 },
  saveBtn: { backgroundColor: '#10b981', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  saveText: { color: '#000', fontWeight: 'bold', fontSize: 14 },

  titleInput: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  
  // Editor Card
  editorCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  input: { 
    color: '#e2e8f0', 
    fontSize: 17, 
    lineHeight: 26, 
    padding: 15, 
    minHeight: 180, 
    textAlignVertical: 'top' 
  },
  actionBar: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.1)', 
    backgroundColor: 'rgba(0,0,0,0.3)' 
  },
  actionBtn: { flex: 1, padding: 12, alignItems: 'center' },
  actionText: { color: '#aaa', fontSize: 14, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  // AI Controls
  controlsContainer: { marginBottom: 10 },
  sectionLabel: { color: '#666', fontSize: 10, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1, marginLeft: 5 },
  chipScroll: { marginBottom: 15 },
  chip: { 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#333', 
    marginRight: 8, 
    backgroundColor: 'rgba(255,255,255,0.05)' 
  },
  chipActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText: { color: '#888', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // Main Button
  aiBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  aiText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // History
  historySection: { marginTop: 40, marginBottom: 50 },
  historyHeader: { color: '#666', marginBottom: 10, fontWeight: 'bold' },
  historyCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginBottom: 8 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyLabel: { fontSize: 10, fontWeight: 'bold' },
  historyDate: { color: '#555', fontSize: 11 },
  historyContent: { color: '#888', fontSize: 12 },
});