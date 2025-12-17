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
  history: NoteVersion[];
  updatedAt: number;
}

const STORAGE_KEY = 'GHOSTWRITER_NOTES';

// Get all notes
export async function getNotes(): Promise<Note[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get single note
export async function getNoteById(id: string): Promise<Note | undefined> {
  const notes = await getNotes();
  return notes.find((n) => n.id === id);
}

// Save or Update a note (Magic Versioning Logic)
export async function saveNote(id: string, content: string, title: string, label: string = "Edit") {
  const notes = await getNotes();
  const existingIndex = notes.findIndex((n) => n.id === id);
  const timestamp = Date.now();

  if (existingIndex >= 0) {
    // UPDATE: Move current content to history, set new content as current
    const oldNote = notes[existingIndex];
    
    // Only save to history if content actually changed
    if (oldNote.currentContent !== content) {
      const newVersion: NoteVersion = {
        timestamp: oldNote.updatedAt,
        content: oldNote.currentContent,
        label: "Previous Version"
      };

      notes[existingIndex] = {
        ...oldNote,
        title,
        currentContent: content,
        history: [newVersion, ...oldNote.history], // Add old version to top of history
        updatedAt: timestamp,
      };
    }
  } else {
    // CREATE NEW
    const newNote: Note = {
      id,
      title: title || "Untitled Note",
      currentContent: content,
      history: [],
      updatedAt: timestamp,
    };
    notes.unshift(newNote);
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}