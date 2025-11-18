import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Tag, 
  Video, 
  GraduationCap, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useToast } from '../components/ui/Toast';
import FileUpload from '../components/ui/FileUpload';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NoteScanner from '../components/upload/NoteScanner';
import { 
  ACADEMIC_DISCIPLINES, 
  ACADEMIC_PROGRAMS, 
  getProgramByCode 
} from '../utils/academicPrograms';

const UploadPage: React.FC = () => {
  const { uploadNote } = useNotes();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<{ isValid: boolean; message: string } | undefined>(undefined);
  
  const [discipline, setDiscipline] = useState<string>('Computer Applications');
  const [programCode, setProgramCode] = useState<string>('BCA');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: '1',
    course: 'Bachelor of Computer Applications',
    category: 'lecture',
    tags: '',
    videoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get active program config
  const activeProgram = getProgramByCode(programCode);
  const availablePrograms = ACADEMIC_PROGRAMS.filter(p => p.discipline === discipline);

  // Dynamic subjects based on selected discipline
  const suggestedSubjects = activeProgram.defaultSubjects || [];

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_NAME || 'dk16ymotz';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'my_unsigned_preset';

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', uploadPreset);
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        uploadFormData
      );
      return response.data.secure_url;
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      return URL.createObjectURL(file);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setShowScanner(true);
    }
  };

  const handleScanComplete = (isValid: boolean, message: string) => {
    setShowScanner(false);
    setScanResult({ isValid, message });
    
    if (!isValid) {
      setSelectedFile(null);
      setError(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a note file (PDF, Image, or DOCX)');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.subject.trim() || !formData.semester || !formData.course.trim()) {
      setError('Please fill in all required fields (Title, Description, Subject, Semester, Course)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedFileUrl = await uploadToCloudinary(selectedFile);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        semester: parseInt(formData.semester, 10),
        course: formData.course.trim(),
        category: formData.category,
        discipline,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        file_path: uploadedFileUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        video_url: formData.videoUrl.trim() || undefined,
      };

      await uploadNote(payload);
      addToast({
        type: 'success',
        title: 'Note Published!',
        message: 'Your notes have been shared successfully with fellow students.'
      });
      navigate('/notes');
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.message || 'Upload failed. Please try again.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
      {showScanner && selectedFile && (
        <NoteScanner 
          file={selectedFile} 
          onScanComplete={handleScanComplete} 
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Academic Publishing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload & Share Study Materials
          </h1>
          <p className="mt-1 text-gray-500 text-sm sm:text-base">
            Share your lecture notes, lab manuals, summary sheets, or video walkthroughs with students across universities.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: File Upload */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Document File (PDF, Image, DOCX)</span>
            </h2>
            <FileUpload 
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
              maxSize={50}
            />
            {scanResult && scanResult.isValid && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Document verified & ready for upload</span>
              </div>
            )}
          </div>

          {/* Section 2: Discipline & Academic Degree Program */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>Academic Discipline & Program</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Academic Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => {
                    const newDisc = e.target.value;
                    setDiscipline(newDisc);
                    const matching = ACADEMIC_PROGRAMS.filter(p => p.discipline === newDisc);
                    if (matching.length > 0) {
                      setProgramCode(matching[0].code);
                      setFormData(prev => ({ ...prev, course: matching[0].name }));
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ACADEMIC_DISCIPLINES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Degree Program ({activeProgram.durationYears} Years / {activeProgram.totalSemesters} Semesters)
                </label>
                <select
                  value={programCode}
                  onChange={(e) => {
                    setProgramCode(e.target.value);
                    const prog = getProgramByCode(e.target.value);
                    setFormData(prev => ({ ...prev, course: prog.name }));
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {availablePrograms.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.code} — {p.name} ({p.durationYears} yrs)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Note Metadata */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Note Details & Content</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Note Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Unit 3 - Data Structures Trees & Binary Search Algorithms"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  name="subject"
                  list="suggested-subjects"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g. Algorithms / Anatomy"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <datalist id="suggested-subjects">
                  {suggestedSubjects.map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Semester (1 to {activeProgram.totalSemesters}) *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {Array.from({ length: activeProgram.totalSemesters }, (_, i) => i + 1).map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Material Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="lecture">Lecture Notes & Handouts</option>
                  <option value="exam">Past Exam Papers & Solutions</option>
                  <option value="lab">Lab Manuals & Practical Records</option>
                  <option value="summary">Summary & Formula Quick Sheet</option>
                  <option value="assignment">Solved Assignments / Projects</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description & Highlights *
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what this note covers, important topics, key formulas, or reference books..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                required
              />
            </div>

            {/* Video Lecture Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500" />
                <span>YouTube / Video Lecture Walkthrough (Optional)</span>
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Students can play the video walkthrough directly alongside your notes.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Tags (Comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. midterm, binary-trees, bca, semester-3, formula-sheet"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm shadow-md transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Uploading Note...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;