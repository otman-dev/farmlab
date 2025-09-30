"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FiTarget, FiMail, FiPhone, FiMapPin, FiFileText, FiSend, FiArrowLeft } from "react-icons/fi";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const email = emailRef.current?.value || "";
    const subject = subjectRef.current?.value || "";
    const message = messageRef.current?.value || "";
    const phone = phoneRef.current?.value || "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          subject,
          message,
          phone,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Clear form
        if (emailRef.current) emailRef.current.value = "";
        if (subjectRef.current) subjectRef.current.value = "";
        if (messageRef.current) messageRef.current.value = "";
        if (phoneRef.current) phoneRef.current.value = "";
      } else {
        const data = await response.json();
        setError(data.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
      console.error("Contact form error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Enhanced background with pattern and animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-teal-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            {/* Back to home link - better positioned */}
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-600 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            {/* Mini logo for context */}
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">FarmLab</span>
            </div>
          </div>

          {/* Main Header */}
          <div className="text-center mb-8 lg:mb-12">
            {/* Large Logo and brand identity */}
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900">FarmLab</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Get in Touch
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our smart farming solutions? We&apos;d love to hear from you.
              Send us a message and we&apos;ll respond within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <FiMail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a
                        href="mailto:contact@farmlab.ma"
                        className="text-green-600 hover:text-green-700 transition-colors duration-200"
                      >
                        contact@farmlab.ma
                      </a>
                      <p className="text-sm text-gray-500 mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FiPhone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <a
                        href="tel:+212600000000"
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                      >
                        +212 6 00 00 00 00
                      </a>
                      <p className="text-sm text-gray-500 mt-1">Monday - Friday, 9 AM - 6 PM</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FiMapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                      <p className="text-purple-600">Casablanca, Morocco</p>
                      <p className="text-sm text-gray-500 mt-1">Serving farmers across Morocco</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Business Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="text-gray-900 font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="text-gray-900 font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="text-gray-500">Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-5 h-5 text-green-500 mr-3">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-800 font-medium">Message sent successfully!</p>
                        <p className="text-green-700 text-sm mt-1">We&apos;ll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-5 h-5 text-red-500 mr-3">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email field */}
                  <div>
                    <label htmlFor="email" className="block font-semibold mb-2 text-gray-800">
                      Email Address
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        ref={emailRef}
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone field (optional) */}
                  <div>
                    <label htmlFor="phone" className="block font-semibold mb-2 text-gray-800">
                      Phone Number
                      <span className="text-gray-500 ml-1 text-sm font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        ref={phoneRef}
                        id="phone"
                        name="phone"
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                        placeholder="+212 6 00 00 00 00"
                      />
                    </div>
                  </div>

                  {/* Subject field */}
                  <div>
                    <label htmlFor="subject" className="block font-semibold mb-2 text-gray-800">
                      Subject
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiFileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        ref={subjectRef}
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4"
                        placeholder="What can we help you with?"
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div>
                    <label htmlFor="message" className="block font-semibold mb-2 text-gray-800">
                      Message
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      ref={messageRef}
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg text-gray-900 placeholder:text-gray-400 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 resize-none"
                      placeholder="Tell us more about your farming needs, questions about our IoT solutions, or how we can help improve your agricultural operations..."
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center px-6 py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg text-base sm:text-lg ${
                      loading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FiSend className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}