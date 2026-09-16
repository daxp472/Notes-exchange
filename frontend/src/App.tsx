import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotesPage from './pages/NotesPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import FavoritesPage from './pages/FavoritesPage';
import MyNotesPage from './pages/MyNotesPage';
import SearchResultsPage from './pages/SearchResultsPage';
import UserProfilePage from './pages/UserProfilePage';
import ChatPage from './pages/ChatPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import AdminPanel from './pages/AdminPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import StudySchedulePage from './pages/StudySchedulePage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import SocialHubPage from './pages/SocialHubPage';
import BookmarksPage from './pages/BookmarksPage';
import RecentlyViewedPage from './pages/RecentlyViewedPage';
import BulkToolsPage from './pages/BulkToolsPage';
import TrendingPage from './pages/TrendingPage';
import RewardsStorePage from './pages/RewardsStorePage';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Don't show header on landing page and auth pages
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isPublicInfoPage = ['/about', '/contact', '/help', '/privacy', '/terms'].includes(location.pathname);
  
  // Use layout wrapper for internal app pages
  const useMainLayout = !isLandingPage && !isAuthPage;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading application..." color="primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {!isLandingPage && !isAuthPage && <Header />}
        <main>
          <Routes>
            {/* Public pages without layout */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage />} />
            
            {/* Public info pages with header only */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Internal app pages with sidebar layout */}
            <Route path="/home" element={
              <MainLayout title="Dashboard">
                <HomePage />
              </MainLayout>
            } />
            <Route path="/notes" element={
              <MainLayout title="Study Notes">
                <NotesPage />
              </MainLayout>
            } />
            <Route path="/notes/:noteId" element={
              <MainLayout title="Study Notes">
                <NotesPage />
              </MainLayout>
            } />
            <Route path="/search" element={
              <MainLayout title="Search Results">
                <SearchResultsPage />
              </MainLayout>
            } />
            <Route path="/user/:userId" element={
              <MainLayout title="User Profile">
                <UserProfilePage />
              </MainLayout>
            } />
            <Route path="/upload" element={
              user ? (
                <MainLayout title="Upload Notes">
                  <UploadPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/profile" element={
              user ? (
                <MainLayout title="My Profile">
                  <ProfilePage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/settings" element={
              user ? (
                <MainLayout title="Settings">
                  <SettingsPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/favorites" element={
              user ? (
                <MainLayout title="Favorites">
                  <FavoritesPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/my-notes" element={
              user ? (
                <MainLayout title="My Notes">
                  <MyNotesPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/chat" element={
              user ? (
                <MainLayout title="Messages">
                  <ChatPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/chat/private/:userId" element={
              user ? (
                <MainLayout title="Private Chat">
                  <ChatPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/chat/groups/:groupId" element={
              user ? (
                <MainLayout title="Group Chat">
                  <ChatPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/advanced-search" element={
              <MainLayout title="Advanced Search">
                <AdvancedSearchPage />
              </MainLayout>
            } />
            <Route path="/admin" element={
              user ? (
                <MainLayout title="Admin Panel">
                  <AdminPanel />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/analytics" element={
              user ? (
                <MainLayout title="Analytics Dashboard">
                  <AnalyticsDashboard />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/study-schedule" element={
              user ? (
                <MainLayout title="Study Schedule">
                  <StudySchedulePage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/study-groups" element={
              user ? (
                <MainLayout title="Study Groups">
                  <StudyGroupsPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/social" element={
              user ? (
                <MainLayout title="Social Hub">
                  <SocialHubPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/bookmarks" element={
              user ? (
                <MainLayout title="Bookmarks">
                  <BookmarksPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/recently-viewed" element={
              user ? (
                <MainLayout title="Recently Viewed">
                  <RecentlyViewedPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/bulk-tools" element={
              user ? (
                <MainLayout title="Bulk Tools">
                  <BulkToolsPage />
                </MainLayout>
              ) : <Navigate to="/login" />
            } />
            <Route path="/trending" element={
              <MainLayout title="Trending Notes">
                <TrendingPage />
              </MainLayout>
            } />
            <Route path="/rewards" element={
              <MainLayout title="NoteCoins & Rewards">
                <RewardsStorePage />
              </MainLayout>
            } />
            <Route path="/notecoins" element={
              <MainLayout title="NoteCoins & Rewards">
                <RewardsStorePage />
              </MainLayout>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;