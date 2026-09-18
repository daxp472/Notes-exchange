import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Star, 
  Users, 
  Search, 
  Upload, 
  Heart,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Share2,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Award,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI } from '../services/api';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileNav, setMobileNav] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Fetch real platform stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await analyticsAPI.getPlatformStats();
        setPlatformStats(stats);
      } catch (error) {
        // Don't show fake stats if API fails
        console.log('Stats not available yet');
      }
    };
    fetchStats();
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const features = [
    {
      icon: <Upload className="w-6 h-6 text-blue-500" />,
      title: 'Easy Upload',
      description: 'Upload your notes in PDF, DOC, or image format with drag-and-drop simplicity.',
    },
    {
      icon: <Search className="w-6 h-6 text-emerald-500" />,
      title: 'Smart Search',
      description: 'Find exactly what you need with filtering by subject, semester, and course.',
    },
    {
      icon: <Star className="w-6 h-6 text-amber-500" />,
      title: 'Rating System',
      description: 'Rate and review notes to help others find the best study materials.',
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      title: 'Favorites',
      description: 'Save your favorite notes for quick access when you need them most.',
    },
    {
      icon: <Share2 className="w-6 h-6 text-violet-500" />,
      title: 'Easy Sharing',
      description: 'Share notes seamlessly with classmates and build a collaborative community.',
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-500" />,
      title: 'Secure Platform',
      description: 'Your notes are protected with enterprise-grade security and access controls.',
    },
  ];

  const benefits = [
    'Access quality notes from fellow students',
    'Save time on note-taking and focus on understanding',
    'Connect with study groups and academic communities',
    'Earn recognition for sharing quality content',
    'Get recommendations based on your courses',
    'Access study materials anywhere, anytime'
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                Notes<span className="text-blue-600">Exchange</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Benefits</a>
              <Link to="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</Link>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {user ? (
                <Link
                  to="/home"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-3 py-2">
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2" onClick={() => setMobileNav(!mobileNav)}>
              {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileNav && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
              <a href="#features" className="block text-sm text-gray-600 py-2" onClick={() => setMobileNav(false)}>Features</a>
              <a href="#benefits" className="block text-sm text-gray-600 py-2" onClick={() => setMobileNav(false)}>Benefits</a>
              <Link to="/about" className="block text-sm text-gray-600 py-2" onClick={() => setMobileNav(false)}>About</Link>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                {user ? (
                  <Link to="/home" className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium" onClick={() => setMobileNav(false)}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="block text-center border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium" onClick={() => setMobileNav(false)}>Sign In</Link>
                    <Link to="/register" className="block text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium" onClick={() => setMobileNav(false)}>Get Started</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/80 via-white to-white overflow-hidden">
        {/* Subtle Background — just a soft gradient, no floating blobs */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Student Notes Platform</span>
              </div>
            </div>
            
            {/* Hero Title — sized for readability, not shock value */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Share Knowledge,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Excel Together
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              The platform for students to upload, share, and discover{' '}
              <span className="font-semibold text-gray-700">quality study notes</span>{' '}
              across all subjects and semesters. Built by students, for students.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
              {user ? (
                <>
                  <Link
                    to="/home"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/upload"
                    className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-200 px-8 py-3.5 rounded-xl font-semibold text-base hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Notes</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto bg-white text-gray-700 border-2 border-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators — Only show real stats if available */}
            {platformStats && (
              <div className="flex flex-wrap justify-center items-center gap-6 text-gray-500">
                {platformStats.totalUsers > 0 && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {platformStats.totalUsers.toLocaleString()} Students
                    </span>
                  </div>
                )}
                {platformStats.totalNotes > 0 && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {platformStats.totalNotes.toLocaleString()} Study Notes
                    </span>
                  </div>
                )}
                {platformStats.averageRating > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-gray-600">
                      {platformStats.averageRating.toFixed(1)}★ Avg Rating
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50/50" data-animate>
        <div id="features-section" data-animate className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${isVisible('features-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Choose NotesExchange?
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to share, discover, and excel with the best study materials from your peers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 ${
                  isVisible('features-section') 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white">
        <div id="benefits-section" data-animate className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${isVisible('benefits-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Transform Your Study Experience
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Join a community of motivated students who believe in the power of sharing knowledge.
              </p>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to={user ? "/home" : "/register"}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md"
                >
                  <span>{user ? "Explore Platform" : "Start Your Journey"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <TrendingUp className="w-7 h-7 text-blue-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Better Grades</h4>
                    <p className="text-xs text-gray-500">Students report improved performance</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <Clock className="w-7 h-7 text-green-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Save Time</h4>
                    <p className="text-xs text-gray-500">Hours saved per week on notes</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <Globe className="w-7 h-7 text-purple-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Any University</h4>
                    <p className="text-xs text-gray-500">Find notes from your college</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <Award className="w-7 h-7 text-orange-500 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Recognition</h4>
                    <p className="text-xs text-gray-500">Earn badges for contributions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join students who are sharing and discovering amazing study materials.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <>
                <Link
                  to="/home"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center space-x-2 text-sm"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/upload"
                  className="border-2 border-white/80 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center space-x-2 text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Notes</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center space-x-2 text-sm"
                >
                  <span>Join NotesExchange</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/notes"
                  className="border-2 border-white/80 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-200 text-sm"
                >
                  Browse Notes
                </Link>
              </>
            )}
          </div>

          <div className="mt-6 text-blue-200 text-xs">
            <p>Free to use • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <span className="font-bold">NotesExchange</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Empowering students through collaborative learning and knowledge sharing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/notes" className="hover:text-white transition-colors">Browse Notes</Link></li>
                <li><Link to="/upload" className="hover:text-white transition-colors">Upload Notes</Link></li>
                <li><Link to="/advanced-search" className="hover:text-white transition-colors">Advanced Search</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {user ? (
                  <>
                    <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
                    <li><Link to="/my-notes" className="hover:text-white transition-colors">My Notes</Link></li>
                    <li><Link to="/favorites" className="hover:text-white transition-colors">Favorites</Link></li>
                    <li><Link to="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                    <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-xs">
            <p>&copy; {currentYear} NotesExchange. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;