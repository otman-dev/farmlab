"use client";

import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiMessageCircle, FiSend, FiClock } from "react-icons/fi";

export default function VisitorContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email Us",
      content: "hello@farmlab.com",
      description: "Send us an email and we'll respond within 24 hours",
      color: "green"
    },
    {
      icon: FiPhone,
      title: "Call Us",
      content: "+212 XXX XXX XXX",
      description: "Available Monday to Friday, 9 AM to 6 PM (Morocco time)",
      color: "blue"
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      content: "Morocco",
      description: "Our headquarters are located in Morocco",
      color: "purple"
    }
  ];

  const inquiryTypes = [
    { value: "general", label: "General Information" },
    { value: "demo", label: "Request Demo" },
    { value: "partnership", label: "Partnership Opportunities" },
    { value: "support", label: "Technical Support" },
    { value: "investment", label: "Investment Inquiries" }
  ];

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-green-100">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg mb-6">
            <FiSend className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out to FarmLab. We&apos;ve received your message and will get back to you within 24 hours.
          </p>
          <div className="inline-flex items-center text-green-600 font-medium">
            <FiClock className="w-4 h-4 mr-2" />
            Expected response time: 24 hours
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <FiMessageCircle className="w-8 h-8 text-white" />
          </div>
          <span className="ml-3 text-2xl font-bold text-gray-900">Contact FarmLab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Get in
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
            Touch
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Have questions about FarmLab? Want to request a demo or discuss partnership opportunities? 
          We&apos;d love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
          
          {contactInfo.map((info, index) => {
            const colorClasses = {
              green: "from-green-500 to-emerald-600 text-green-600 bg-green-50 border-green-200",
              blue: "from-blue-500 to-blue-600 text-blue-600 bg-blue-50 border-blue-200",
              purple: "from-purple-500 to-purple-600 text-purple-600 bg-purple-50 border-purple-200"
            };
            
            const [gradientClass, textColorClass, , borderClass] = colorClasses[info.color as keyof typeof colorClasses].split(' ');
            
            return (
              <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border ${borderClass} hover:shadow-md transition-shadow`}>
                <div className="flex items-start gap-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${gradientClass} rounded-xl shadow-md flex-shrink-0`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${textColorClass} mb-1`}>{info.title}</h3>
                    <p className="font-medium text-gray-900 mb-2">{info.content}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Office Hours */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center mb-3">
              <FiClock className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-green-900">Office Hours</h3>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
              <p className="text-xs text-green-600 mt-2">All times in Morocco timezone (GMT+1)</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md">
                <FiSend className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">Send us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 transition-all"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Inquiry Type and Subject */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 transition-all"
                  >
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-800">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 transition-all"
                    placeholder="Brief subject of your inquiry"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block font-semibold mb-2 text-gray-800">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-300 focus:outline-none focus:ring-4 transition-all resize-vertical"
                  placeholder="Tell us more about your inquiry, questions, or how we can help you..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
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

      {/* FAQ Section */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Quick answers to common questions about FarmLab</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              question: "How quickly can I get started with FarmLab?",
              answer: "Most farms can be set up within 2-3 hours for basic monitoring. We provide full installation support."
            },
            {
              question: "What kind of support do you offer?",
              answer: "We offer 24/7 technical support, on-site installation, training, and ongoing maintenance services."
            },
            {
              question: "Is FarmLab suitable for small farms?",
              answer: "Yes! FarmLab scales from small urban farms (0.1 hectares) to large commercial operations (2000+ hectares)."
            },
            {
              question: "Do you offer custom solutions?",
              answer: "Absolutely. We work with farms to create custom IoT solutions tailored to their specific needs and crops."
            }
          ].map((faq, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}