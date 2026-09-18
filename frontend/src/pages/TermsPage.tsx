import React from 'react';
import Card from '../components/ui/Card';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using NotesExchange, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily access NotesExchange for personal, non-commercial transitory viewing only. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Creation</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must be at least 13 years old to create an account</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>We reserve the right to suspend or terminate accounts</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Guidelines</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceptable Content</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Educational materials and study notes</li>
                  <li>Original content or properly attributed materials</li>
                  <li>Content that complies with copyright laws</li>
                  <li>Constructive reviews and ratings</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Prohibited Content</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Copyrighted material without permission</li>
                  <li>Inappropriate, offensive, or harmful content</li>
                  <li>Spam, advertisements, or promotional materials</li>
                  <li>False or misleading information</li>
                  <li>Content that violates any law or regulation</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By uploading content to NotesExchange, you retain ownership of your intellectual property rights. 
              However, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute 
              your content on the platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We respect the intellectual property rights of others and expect users to do the same. 
              If you believe your copyrighted work has been copied without permission, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy and Data</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
              of the platform, to understand our practices regarding the collection and use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on NotesExchange are provided on an 'as is' basis. NotesExchange makes no warranties, 
              expressed or implied, and hereby disclaims and negates all other warranties including without limitation, 
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall NotesExchange or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
              to use NotesExchange, even if NotesExchange or a NotesExchange authorized representative has been notified 
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accuracy of Materials</h2>
            <p className="text-gray-700 leading-relaxed">
              The materials appearing on NotesExchange could include technical, typographical, or photographic errors. 
              NotesExchange does not warrant that any of the materials on its platform are accurate, complete, or current. 
              NotesExchange may make changes to the materials contained on its platform at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              NotesExchange may revise these terms of service at any time without notice. By using this platform, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of India 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@notesexchange.com<br />
                <strong>Address:</strong> Student Innovation Hub, Tech Campus, India
              </p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default TermsPage;