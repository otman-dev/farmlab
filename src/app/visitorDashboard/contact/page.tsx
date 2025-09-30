"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiMessageCircle, FiSend, FiClock, FiCheck, FiHelpCircle } from "react-icons/fi";

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
      description: "Send us an email and we'll respond within 24 hours"
    },
    {
      icon: FiPhone,
      title: "Call Us", 
      content: "+212 XXX XXX XXX",
      description: "Available Monday to Friday, 9 AM to 6 PM (Morocco time)"
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      content: "Morocco",
      description: "Our headquarters are located in Morocco"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-green-100 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className="absolute w-2 h-2 bg-green-200 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '100%',
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-2xl mb-8"
              >
                <FiCheck className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold text-gray-900 mb-6"
              >
                Message Sent Successfully!
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl text-gray-600 mb-8 leading-relaxed"
              >
                Thank you for reaching out to FarmLab. We&apos;ve received your message and will get back to you within 24 hours.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="inline-flex items-center text-green-600 font-semibold text-lg bg-green-50 px-6 py-3 rounded-full"
              >
                <FiClock className="w-5 h-5 mr-3" />
                Expected response time: 24 hours
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="flex items-center justify-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-3xl shadow-xl">
              <FiMessageCircle className="w-10 h-10 text-white" />
            </div>
            <span className="ml-4 text-3xl font-bold text-gray-900">Contact FarmLab</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6"
          >
            Get in
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-green-700 to-green-800 mt-2">
              Touch
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Have questions about FarmLab? Want to request a demo or discuss partnership opportunities? 
            We&apos;d love to hear from you!
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-6"
            >
              Contact Information
            </motion.h2>
            
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="w-full h-full bg-green-500 rounded-full transform rotate-45 scale-150" />
                </div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg flex-shrink-0"
                  >
                    <info.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-green-600 transition-colors">
                      {info.title}
                    </h3>
                    <p className="font-semibold text-green-600 mb-3 text-lg">{info.content}</p>
                    <p className="text-gray-600 leading-relaxed">{info.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Office Hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-8 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600" />
              
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4"
                >
                  <FiClock className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="font-bold text-gray-900 text-xl">Office Hours</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
                  { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
                  { day: "Sunday", hours: "Closed" }
                ].map((schedule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex justify-between items-center py-2 border-b border-green-100 last:border-0"
                  >
                    <span className="font-medium text-gray-700">{schedule.day}:</span>
                    <span className="font-semibold text-green-600">{schedule.hours}</span>
                  </motion.div>
                ))}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-sm text-green-600 mt-4 font-medium"
                >
                  All times in Morocco timezone (GMT+1)
                </motion.p>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-green-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600" />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center mb-8"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg"
                >
                  <FiSend className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-900 ml-4">Send us a Message</h2>
              </motion.div>

              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <label className="block font-bold mb-3 text-gray-800 text-lg">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-green-300 focus:outline-none focus:ring-4 transition-all duration-300 text-lg"
                      placeholder="Enter your full name"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block font-bold mb-3 text-gray-800 text-lg">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-green-300 focus:outline-none focus:ring-4 transition-all duration-300 text-lg"
                      placeholder="Enter your email address"
                    />
                  </motion.div>
                </div>

                {/* Inquiry Type and Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <label className="block font-bold mb-3 text-gray-800 text-lg">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-green-300 focus:outline-none focus:ring-4 transition-all duration-300 text-lg"
                    >
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                  >
                    <label className="block font-bold mb-3 text-gray-800 text-lg">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-green-300 focus:outline-none focus:ring-4 transition-all duration-300 text-lg"
                      placeholder="Brief subject of your inquiry"
                    />
                  </motion.div>
                </div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <label className="block font-bold mb-3 text-gray-800 text-lg">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-green-200 bg-white hover:border-green-300 focus:outline-none focus:ring-4 transition-all duration-300 resize-vertical text-lg"
                    placeholder="Tell us more about your inquiry, questions, or how we can help you..."
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className={`w-full flex items-center justify-center px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl ${
                    isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-2xl transform'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Sending Message...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <FiSend className="w-6 h-6 mr-3" />
                        Send Message
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-xl p-12 border border-green-100 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600" />
          
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg mb-6"
            >
              <FiHelpCircle className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600"
            >
              Quick answers to common questions about FarmLab
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <h3 className="font-bold text-gray-900 mb-4 text-lg group-hover:text-green-600 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}