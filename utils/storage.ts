// import AsyncStorage from '@react-native-async-storage/async-storage';

// export interface NoteVersion {
//   timestamp: number;
//   content: string;
//   label: string; // e.g., "Original", "AI Polish", "Manual Edit"
// }

// export interface Note {
//   id: string;
//   title: string;
//   currentContent: string;
//   history: NoteVersion[];
//   updatedAt: number;
// }

// const STORAGE_KEY = 'GHOSTWRITER_NOTES';

// // Get all notes
// export async function getNotes(): Promise<Note[]> {
//   const data = await AsyncStorage.getItem(STORAGE_KEY);
//   return data ? JSON.parse(data) : [];
// }

// // Get single note
// export async function getNoteById(id: string): Promise<Note | undefined> {
//   const notes = await getNotes();
//   return notes.find((n) => n.id === id);
// }

// // Save or Update a note (Magic Versioning Logic)
// export async function saveNote(id: string, content: string, title: string, label: string = "Edit") {
//   const notes = await getNotes();
//   const existingIndex = notes.findIndex((n) => n.id === id);
//   const timestamp = Date.now();

//   if (existingIndex >= 0) {
//     // UPDATE: Move current content to history, set new content as current
//     const oldNote = notes[existingIndex];
    
//     // Only save to history if content actually changed
//     if (oldNote.currentContent !== content) {
//       const newVersion: NoteVersion = {
//         timestamp: oldNote.updatedAt,
//         content: oldNote.currentContent,
//         label: "Previous Version"
//       };

//       notes[existingIndex] = {
//         ...oldNote,
//         title,
//         currentContent: content,
//         history: [newVersion, ...oldNote.history], // Add old version to top of history
//         updatedAt: timestamp,
//       };
//     }
//   } else {
//     // CREATE NEW
//     const newNote: Note = {
//       id,
//       title: title || "Untitled Note",
//       currentContent: content,
//       history: [],
//       updatedAt: timestamp,
//     };
//     notes.unshift(newNote);
//   }

//   await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
// }

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NoteVersion {
  timestamp: number;
  content: string;
  label: string; // e.g., "Original", "AI Polish", "Manual Edit"
}

export interface Note {
  id: string;
  title: string;
  currentContent: string;
  lastLabel?: string; // 🧠 New: Remembers the label of the current text
  history: NoteVersion[];
  updatedAt: number;
}

const STORAGE_KEY = 'GHOSTWRITER_NOTES';

// Get all notes
export async function getNotes(): Promise<Note[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

// Get single note
export async function getNoteById(id: string): Promise<Note | undefined> {
  const notes = await getNotes();
  return notes.find((n) => n.id === id);
}

// Save or Update a note
export async function saveNote(id: string, content: string, title: string, label: string = "Edit") {
  const notes = await getNotes();
  const existingIndex = notes.findIndex((n) => n.id === id);
  const timestamp = Date.now();

  if (existingIndex >= 0) {
    // UPDATE EXISTING NOTE
    const oldNote = notes[existingIndex];
    
    // Only save to history if content actually changed
    if (oldNote.currentContent !== content) {
      
      // 1. Create a history entry for the OLD content
      // We use 'lastLabel' if it exists, otherwise default to "Previous Version"
      const historyEntry: NoteVersion = {
        timestamp: oldNote.updatedAt,
        content: oldNote.currentContent,
        label: oldNote.lastLabel || "Previous Version" 
      };

      // 2. Update the note with NEW content and NEW label
      notes[existingIndex] = {
        ...oldNote,
        title,
        currentContent: content,
        lastLabel: label, // Store the new label (e.g., "✨ Viral Tweet")
        history: [historyEntry, ...oldNote.history], // Add old version to top of history
        updatedAt: timestamp,
      };
    } else {
      // Content didn't change, just update title/label if needed
      notes[existingIndex] = {
        ...oldNote,
        title,
        lastLabel: label,
        updatedAt: timestamp,
      };
    }
  } else {
    // CREATE NEW NOTE
    const newNote: Note = {
      id,
      title: title || "Untitled Note",
      currentContent: content,
      lastLabel: label, // Initial label (e.g., "Manual Save")
      history: [],
      updatedAt: timestamp,
    };
    notes.unshift(newNote);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}