"use client";

import Link from "next/link";
import { FiTarget, FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, FiExternalLink } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <FiTarget className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">FarmLab</span>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Transforming agriculture through smart IoT solutions and AI-powered insights. 
              Empowering farmers to create sustainable and efficient operations.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="https://github.com/otman-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com/company/farmlab"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-700 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/auth/register" className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center">
                  Join Waitlist
                </Link>
              </li>
              <li>
                <Link href="/auth/signin" className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-200 flex items-center">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  <FiMail className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">Email</p>
                  <a
                    href="mailto:contact@farmlab.ma"
                    className="text-green-400 hover:text-green-300 transition-colors duration-200"
                  >
                    contact@farmlab.ma
                  </a>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  <FiPhone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">Phone</p>
                  <a
                    href="tel:+212600000000"
                    className="text-green-400 hover:text-green-300 transition-colors duration-200"
                  >
                    +212 6 00 00 00 00
                  </a>
                </div>
              </div>
              
              {/* Location */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                  <FiMapPin className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm font-medium">Location</p>
                  <p className="text-green-400">
                    Casablanca, Morocco
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact CTA */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Have questions about our smart farming solutions? 
              We&apos;d love to hear from you.
            </p>
            
            {/* Contact Button */}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiMail className="w-5 h-5 mr-2" />
              Contact Us
              <FiExternalLink className="w-4 h-4 ml-2" />
            </Link>
            
            {/* Quick Contact Info */}
            <div className="bg-gray-800 rounded-xl p-4 space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Quick Contact</p>
              <p className="text-sm text-gray-300">Response within 24 hours</p>
              <p className="text-sm text-green-400 font-medium">Available Monday - Friday</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} FarmLab. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Smart farming solutions for sustainable agriculture.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-green-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <div className="flex items-center text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Made in Morocco
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}