import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 bg-white border border-slate-100 rounded-3xl shadow-sm mt-6">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Updated: July 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 leading-relaxed font-semibold">
        <p>
          Welcome to StadiumGenie. We are dedicated to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
        </p>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when registering on the platform, purchasing entry passes, or interacting with our AI Assistant (including preferences, search logs, and text input). This may include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
            <li>Name and contact details (email address, phone number).</li>
            <li>Security credentials (passwords).</li>
            <li>Billing and transaction details (such as ticket quantities, amounts paid, and payment methods).</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">2. How We Use Your Information</h2>
          <p>
            We use personal information collected via our platform for a variety of business purposes, including:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 font-medium">
            <li>Facilitating account creation, user authentication, and profile updates.</li>
            <li>Processing ticket reservations, payment confirmations, and digital QR ticket generation.</li>
            <li>Personalizing recommendations via our Gemini AI Assistant.</li>
            <li>Improving system performance, security, and gate check-in workflows.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">3. QR Code & Check-in Data</h2>
          <p>
            Our ticket verification system embeds a secure reference URL into each attendee's QR code. When scanned at stadium gates, check-in statuses (VALID, USED, EXPIRED, CANCELLED) are checked and updated in real-time. We keep records of admission times and dates for safety and audit logs.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">4. Sharing Your Information</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services (such as stadium entry clearances), to protect your rights, or to fulfill business obligations.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-800">5. Contact Us</h2>
          <p>
            If you have questions or comments about this policy, you can reach our data compliance team at:
            <br />
            <span className="text-blue-600 font-bold">compliance@stadiumgenie-ai.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
