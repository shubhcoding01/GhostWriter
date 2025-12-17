// import { LinearGradient } from 'expo-linear-gradient'; // The 3D color tool
// import { useState } from 'react';
// import {
//   ActivityIndicator,
//   Dimensions,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { fixTextWithAI } from '../utils/gemini';

// const { width } = Dimensions.get('window');

// export default function HomeScreen() {
//   const [text, setText] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleMagic = async () => {
//     if (!text.trim()) return;
//     setIsLoading(true);
//     const polishedText = await fixTextWithAI(text);
//     setText(polishedText);
//     setIsLoading(false);
//   };

//   return (
//     // 1. 3D Background Gradient (Deep Blue to Black)
//     <LinearGradient
//       colors={['#0f172a', '#020617', '#000000']}
//       style={styles.container}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <StatusBar barStyle="light-content" />
        
//         <KeyboardAvoidingView 
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={{ flex: 1 }}
//         >
//           <ScrollView contentContainerStyle={styles.scrollContainer}>
            
//             {/* Header with Glow Effect */}
//             <View style={styles.header}>
//               <View style={styles.glowContainer}>
//                 <Text style={styles.emoji}>👻</Text>
//               </View>
//               <Text style={styles.title}>GhostWriter</Text>
//               <Text style={styles.subtitle}>AI-Powered Refinement</Text>
//             </View>

//             {/* 2. The "3D Glass" Input Card */}
//             <View style={styles.glassCard}>
//               {/* Thin white border at top for 3D light reflection */}
//               <View style={styles.shineBorder} /> 
              
//               <TextInput
//                 style={styles.input}
//                 multiline
//                 placeholder="Type your rough ideas here..."
//                 placeholderTextColor="#64748b"
//                 value={text}
//                 onChangeText={setText}
//               />
//             </View>

//             {/* 3. The 3D Floating Button */}
//             <TouchableOpacity 
//               activeOpacity={0.8}
//               onPress={handleMagic}
//               disabled={isLoading || !text}
//             >
//               <LinearGradient
//                 // 3D Lighting: Light Blue -> Dark Purple
//                 colors={['#3b82f6', '#2563eb', '#1d4ed8']} 
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={styles.button3D}
//               >
//                 {isLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.buttonText}>✨ CRYSTALLIZE TEXT</Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>

//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContainer: {
//     padding: 24,
//     paddingTop: 60,
//     flexGrow: 1,
//   },
//   header: {
//     marginBottom: 40,
//     alignItems: 'center',
//   },
//   glowContainer: {
//     marginBottom: 15,
//     shadowColor: "#3b82f6", // Blue glow
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 20,
//     elevation: 20,
//   },
//   emoji: {
//     fontSize: 50,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: '900',
//     color: '#fff',
//     letterSpacing: 1,
//     textShadowColor: 'rgba(59, 130, 246, 0.5)', // Neon text shadow
//     textShadowOffset: { width: 0, height: 0 },
//     textShadowRadius: 10,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#94a3b8',
//     marginTop: 5,
//     letterSpacing: 2,
//     textTransform: 'uppercase',
//   },
//   glassCard: {
//     height: 320,
//     backgroundColor: 'rgba(30, 41, 59, 0.7)', // Semi-transparent
//     borderRadius: 30,
//     padding: 25,
//     marginBottom: 30,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.1)',
//     // Heavy Shadow for floating effect
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 15 },
//     shadowOpacity: 0.5,
//     shadowRadius: 30,
//     elevation: 10,
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   shineBorder: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 1,
//     backgroundColor: 'rgba(255, 255, 255, 0.3)', // Top reflection
//   },
//   input: {
//     flex: 1,
//     color: '#f8fafc',
//     fontSize: 18,
//     lineHeight: 28,
//     textAlignVertical: 'top',
//     fontWeight: '500',
//   },
//   button3D: {
//     paddingVertical: 20,
//     borderRadius: 25,
//     alignItems: 'center',
//     // Button Shadow
//     shadowColor: "#3b82f6",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     elevation: 12,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(255, 255, 255, 0.2)', // Top light edge
//     borderBottomWidth: 4, // Thicker bottom for 3D feel
//     borderBottomColor: '#1e40af', // Darker blue shadow
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '900',
//     color: '#fff',
//     letterSpacing: 1.5,
//   }
// }); 

import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getNotes, Note } from '../utils/storage';

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);

  // Reload notes every time we come back to this screen
  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

  const loadNotes = async () => {
    const saved = await getNotes();
    setNotes(saved);
  };

  const createNew = () => {
    const newId = Date.now().toString(); // Simple ID generation
    router.push({ pathname: "/editor", params: { id: newId, isNew: "true" } });
  };

  const openNote = (id: string) => {
    router.push({ pathname: "/editor", params: { id } });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#000']} style={styles.background} />
      
      <View style={styles.content}>
        <Text style={styles.header}>My Projects 📂</Text>
        
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notes yet. Start writing!</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openNote(item.id)}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardPreview} numberOfLines={2}>
                {item.currentContent}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={createNew}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  content: { flex: 1, padding: 20, paddingTop: 60 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50, fontSize: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardPreview: { color: '#aaa', fontSize: 14 },
  cardDate: { color: '#555', fontSize: 12, marginTop: 10, textAlign: 'right' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  fabText: { fontSize: 30, color: '#fff', marginTop: -2 },
});