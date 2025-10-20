export interface User {
  id: string;
  email: string;
  name: string;
  college: string;
  studentId?: string;
  department?: string;
  programCode?: string;
  discipline?: string;
  semester: number;
  profileImage?: string;
  avatarUrl?: string;
  avatar_url?: string;
  bio?: string;
  createdAt: string;
  contributionScore: number;
  badges: string[];
}

export interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: number;
  course: string;
  discipline?: string;
  category?: string;
  summary?: string;
  tags: string[];
  fileName?: string;
  file_name?: string;
  filePath?: string;
  file_path?: string;
  fileUrl?: string;
  videoUrl?: string; // Embedded YouTube or educational video link
  fileSize?: number;
  file_size?: number;
  fileType?: string;
  file_type?: string;
  thumbnailPath?: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderCollege: string;
  uploaderStudentId?: string;
  downloads: number;
  views?: number;
  rating: number;
  ratingsCount: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
  isFavorited?: boolean;
}

export interface Rating {
  id: string;
  noteId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  userName: string;
}

export interface Comment {
  id: string;
  noteId: string;
  userId: string;
  comment: string;
  createdAt: string;
  userName: string;
  userCollege: string;
}

export interface SearchFilters {
  subject?: string;
  semester?: number;
  course?: string;
  discipline?: string;
  university?: string;
  college?: string;
  studentId?: string;
  tags?: string[];
  rating?: number;
  sortBy?: 'recent' | 'rating' | 'downloads' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  college: string;
  studentId?: string;
  department?: string;
  programCode?: string;
  semester: number;
}

export interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  favorites: string[];
  searchFilters: SearchFilters;
  fetchNotes: (filters?: SearchFilters, page?: number) => Promise<void>;
  fetchNoteById: (noteId: string) => Promise<Note | null>;
  uploadNote: (noteData: any) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  rateNote: (noteId: string, rating: number, comment?: string) => Promise<void>;
  toggleFavorite: (noteId: string) => Promise<void>;
  updateSearchFilters: (filters: SearchFilters) => void;
  resetFilters: () => void;
}

// Chat Types
export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  senderName: string;
  senderCollege: string;
  receiverName: string;
  receiverCollege: string;
}

export interface ChatContact {
  id: string;
  name: string;
  college: string;
  studentId?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  createdBy: string;
  createdAt: string;
  joinedAt?: string;
  creatorName?: string;
  creatorCollege?: string;
  memberCount: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  senderName: string;
  senderCollege?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  college: string;
  joinedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}