import React from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  Book, 
  Upload, 
  Search, 
  Star, 
  Users, 
  Settings,
  MessageCircle,
  Shield,
  Download,
  ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';

const HelpPage: React.FC = () => {
  const categories = [
    {
      icon: <Book className="w-8 h-8 text-blue-500" />,
      title: 'Getting Started',
      description: 'Learn the basics of using NotesExchange',
      articles: [
        'How to create an account',
        'Setting up your profile',
        'Understanding the interface',
        'Finding your first notes'
      ]
    },
    {
      icon: <Upload className="w-8 h-8 text-green-500" />,
      title: 'Uploading Notes',
      description: 'Everything about sharing your study materials',
      articles: [
        'How to upload notes',
        'Supported file formats',
        'Adding descriptions and tags',
        'Setting visibility preferences'
      ]
    },
    {
      icon: <Search className="w-8 h-8 text-purple-500" />,
      title: 'Finding Notes',
      description: 'Tips for discovering the best study materials',
      articles: [
        'Using search filters',
        'Advanced search techniques',
        'Understanding search results',
        'Saving favorite searches'
      ]
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'Rating & Reviews',
      description: 'How our quality system works',
      articles: [
        'How to rate notes',
        'Writing helpful reviews',
        'Understanding quality scores',
        'Reporting inappropriate content'
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-red-500" />,
      title: 'Community',
      description: 'Connect with other students',
      articles: [
        'Building your network',
        'Following other users',
        'Joining study groups',
        'Community guidelines'
      ]
    },
    {
      icon: <Settings className="w-8 h-8 text-gray-500" />,
      title: 'Account Settings',
      description: 'Manage your account and preferences',
      articles: [
        'Privacy settings',
        'Notification preferences',
        'Changing your password',
        'Deleting your account'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Is NotesExchange free to use?',
      answer: 'Yes! NotesExchange is completely free for students. You can upload, download, and share notes without any cost. We believe education should be accessible to everyone.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We support PDF, DOC, DOCX, PPT, PPTX, and common image formats (JPG, PNG, GIF). Files should be under 50MB for optimal performance.'
    },
    {
      question: 'How do I ensure my notes are high quality?',
      answer: 'Make sure your notes are clear, well-organized, and properly tagged. Include helpful descriptions, use good lighting for photos, and check that text is readable.'
    },
    {
      question: 'Can I edit my notes after uploading?',
      answer: 'Yes, you can edit the title, description, and tags of your uploaded notes. However, you cannot replace the actual file - you\'ll need to upload a new version.'
    },
    {
      question: 'How does the rating system work?',
      answer: 'Users can rate notes from 1-5 stars based on quality, accuracy, and usefulness. Higher-rated notes appear more prominently in search results and help other students find the best materials.'
    },
    {
      question: 'What should I do if I find inappropriate content?',
      answer: 'Please report any inappropriate content using the report button on the note. Our moderation team reviews all reports and takes appropriate action within 24 hours.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of NotesExchange. 
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link to="/contact" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent group-hover:border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get help from our team</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </Card>
          </Link>

          <Link to="/chat" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent group-hover:border-green-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Community Chat</h3>
                  <p className="text-sm text-gray-600">Ask other students</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </Card>
          </Link>

          <a href="mailto:support@notesexchange.com" className="group">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-transparent group-hover:border-purple-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Email Us</h3>
                  <p className="text-sm text-gray-600">Direct email support</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </Card>
          </a>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse Help Topics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mb-4 mx-auto">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{category.title}</h3>
                <p className="text-gray-600 mb-4 text-center">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                      • {article}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Whether you have a technical issue, 
              need guidance on best practices, or want to suggest a new feature, we're listening.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Support</span>
              </Link>
              <a
                href="mailto:support@notesexchange.com"
                className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Email Us Directly</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;