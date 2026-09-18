import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Target, 
  Heart, 
  Award,
  BookOpen,
  Globe,
  Lightbulb,
  Shield,
  ArrowRight
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'Dax Patel',
      role: 'Founder & CEO',
      bio: 'Visionary developer and student passionate about revolutionizing higher-education study exchange. Started NotesExchange in May 2025, took a 4-month strategic pause to architect high-yield AI search and karma rewards, and is now supercharging the platform into the ultimate student academic hub.',
      image: '👨‍💻'
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: 'Student-Centric',
      description: 'Everything we build is designed with real student exam pressures, syllabi, and study workflows in mind.'
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-500" />,
      title: 'Open Academic Access',
      description: 'We believe lecture notes, cheat-sheets, and solutions should be freely accessible across all colleges.'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Verified Quality',
      description: 'Community peer-reviews, direct ratings, and scholar karma keep notes accurate and high-yield.'
    },
    {
      icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
      title: 'Rapid Innovation',
      description: 'Constantly shipping features like AI-powered search, direct note QR codes, and campus rewards.'
    }
  ];

  const milestones = [
    {
      year: 'May 2025',
      title: 'Project Inception & Core Architecture',
      description: 'Dax Patel founded NotesExchange with a mission to eliminate fragmented WhatsApp/drive study sharing.'
    },
    {
      year: 'Mid 2025',
      title: 'Iterative Prototyping & Feedback',
      description: 'Tested early prototypes with college peers, identifying the need for NoteCoins karma and quick previews.'
    },
    {
      year: 'Late 2025',
      title: 'Strategic Architecture Pause',
      description: 'A 4-month development hiatus to redesign the database, security model, and next-generation UI UX system.'
    },
    {
      year: '2026',
      title: 'Supercharged Full-Boost Launch',
      description: 'Full platform relaunch with universal search, verified student network, real-time store, and QR direct share.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Empowering Students Through
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Collaborative Learning
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're on a mission to make quality education accessible to every student by building 
              the world's largest community-driven platform for sharing academic resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <span>Join Our Community</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Target className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every student deserves access to quality study materials. We're breaking down barriers 
                by creating a platform where knowledge flows freely between students, fostering a 
                culture of mutual support and academic excellence.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our vision is to become the go-to platform for students worldwide, where sharing 
                knowledge is rewarded, quality content is recognized, and every student has the 
                resources they need to succeed.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Knowledge Sharing</h3>
                  <p className="text-sm text-gray-600">Promoting collaborative learning</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Community Building</h3>
                  <p className="text-sm text-gray-600">Connecting students globally</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
                  <p className="text-sm text-gray-600">Maintaining quality standards</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
                  <p className="text-sm text-gray-600">Education for everyone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and every decision we make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{value.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Founder & Leadership</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Driven by student experience, built with passion for frictionless academic collaboration.
            </p>
          </div>
          
          <div className="max-w-xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-blue-50/40 border border-blue-100 p-8 sm:p-10 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="text-center relative z-10">
                  <div className="w-24 h-24 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-md">
                    <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center text-4xl">
                      {member.image}
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-1">{member.name}</h3>
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-200/60">
                    {member.role}
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From a hackathon idea to a thriving student community
            </p>
          </div>
          
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/4 text-center md:text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto md:ml-auto md:mr-0"></div>
                </div>
                <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Be Part of Our Story
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join us in building the future of education. Every note shared, every student helped, 
            every connection made contributes to our collective success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center space-x-2"
            >
              <span>Join Our Community</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/notes"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Explore Notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;