"use client";
import { useState } from "react";
import { FiArrowRight, FiArrowLeft, FiCheck, FiTarget, FiCode, FiSearch, FiBookOpen, FiZap, FiHeart } from "react-icons/fi";

interface WaitingListData {
  userType: string;
  farmSize?: string;
  techExperience: string;
  interests: string[];
  expectations: string[];
  name: string;
  email: string;
  location: string;
  organization?: string;
  role?: string;
  experience?: string;
  challenges?: string;
  goals?: string;
}

const userTypes = [
  { id: 'farmer', label: 'Farmer', icon: FiTarget, description: 'I run or work on a farm', color: 'bg-green-500' },
  { id: 'tech', label: 'Tech Professional', icon: FiCode, description: 'I work in technology/agritech', color: 'bg-blue-500' },
  { id: 'rnd', label: 'R&D / Researcher', icon: FiSearch, description: 'I do research in agriculture/tech', color: 'bg-purple-500' },
  { id: 'student', label: 'Student', icon: FiBookOpen, description: 'I\'m studying agriculture/tech', color: 'bg-orange-500' },
  { id: 'teacher', label: 'Educator', icon: FiBookOpen, description: 'I teach agriculture/tech', color: 'bg-teal-500' },
  { id: 'curious', label: 'Just Curious', icon: FiHeart, description: 'I\'m interested in smart farming', color: 'bg-pink-500' }
];

const farmSizes = [
  { id: 'small', label: 'Small Farm', description: '< 50 acres', icon: '🌱' },
  { id: 'medium', label: 'Medium Farm', description: '50-500 acres', icon: '🌾' },
  { id: 'large', label: 'Large Farm', description: '500+ acres', icon: '🚜' },
  { id: 'greenhouse', label: 'Greenhouse/Urban Farm', description: 'Controlled environment', icon: '🏠' },
  { id: 'none', label: 'No Farm Yet', description: 'Planning to start farming', icon: '🌱' }
];

const techLevels = [
  { id: 'beginner', label: 'Beginner', description: 'New to farm technology', icon: '🌱' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some tech experience', icon: '📊' },
  { id: 'advanced', label: 'Advanced', description: 'Tech-savvy user', icon: '🤖' },
  { id: 'expert', label: 'Expert', description: 'Technology professional', icon: '⚡' }
];

const interests = [
  { id: 'monitoring', label: 'Real-time Monitoring', icon: '📊', description: 'Live sensor data & alerts' },
  { id: 'automation', label: 'Smart Automation', icon: '🤖', description: 'Automated irrigation & controls' },
  { id: 'analytics', label: 'Data Analytics', icon: '📈', description: 'Insights & predictions' },
  { id: 'mobile', label: 'Mobile Access', icon: '📱', description: 'Control from anywhere' },
  { id: 'collaboration', label: 'Team Collaboration', icon: '👥', description: 'Multi-user management' },
  { id: 'sustainability', label: 'Sustainability', icon: '🌱', description: 'Resource optimization' },
  { id: 'integration', label: 'API Integration', icon: '🔗', description: 'Connect with other systems' },
  { id: 'education', label: 'Educational Tools', icon: '📚', description: 'Learning & training' }
];

const expectations = [
  { id: 'increase_yield', label: 'Increase Crop Yields', icon: '📈' },
  { id: 'save_resources', label: 'Save Water & Resources', icon: '💧' },
  { id: 'reduce_costs', label: 'Reduce Operational Costs', icon: '💰' },
  { id: 'improve_quality', label: 'Improve Product Quality', icon: '⭐' },
  { id: 'scale_operations', label: 'Scale Farm Operations', icon: '📊' },
  { id: 'stay_competitive', label: 'Stay Competitive', icon: '🏆' },
  { id: 'learn_tech', label: 'Learn Modern Technology', icon: '🎓' },
  { id: 'network', label: 'Connect with Other Farmers', icon: '🤝' }
];

export default function ImmersiveWaitlist() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<WaitingListData>({
    userType: '',
    techExperience: '',
    interests: [],
    expectations: [],
    name: '',
    email: '',
    location: ''
  });

  const totalSteps = 6;

  const steps = [
    { title: "Welcome!", subtitle: "Let's get to know you" },
    { title: "Who are you?", subtitle: "Tell us about yourself" },
    { title: "Your Experience", subtitle: "Technology background" },
    { title: "What interests you?", subtitle: "FarmLab features" },
    { title: "Your goals", subtitle: "What do you hope to achieve?" },
    { title: "Contact Info", subtitle: "How can we reach you?" }
  ];

  const updateFormData = (field: keyof WaitingListData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const toggleExpectation = (expectationId: string) => {
    setFormData(prev => ({
      ...prev,
      expectations: prev.expectations.includes(expectationId)
        ? prev.expectations.filter(id => id !== expectationId)
        : [...prev.expectations, expectationId]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

    const submitForm = async () => {
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setCurrentStep(totalSteps); // Success step
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {      
      alert('Network error. Please check your connection and try again.');
    }
  };  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <FiZap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to FarmLab! 🌱</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              We&apos;re building the future of smart agriculture, and we want to know more about you to make FarmLab perfect for people like you.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <p className="text-sm text-gray-700">
                <strong>This will take about 2 minutes</strong> and help us understand your needs better.
                Your responses will shape how we build FarmLab!
              </p>
            </div>
          </div>
        );

      case 1: // User Type
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">First, tell us who you are!</h2>
              <p className="text-gray-600">This helps us customize your FarmLab experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => updateFormData('userType', type.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                      formData.userType === type.id
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${type.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {formData.userType === 'farmer' && (
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Tell us about your farm! 🌾</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {farmSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => updateFormData('farmSize', size.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.farmSize === size.id
                          ? 'border-green-500 bg-green-100'
                          : 'border-gray-200 bg-white hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{size.icon}</span>
                        <div className="text-left">
                          <div className="font-medium text-sm">{size.label}</div>
                          <div className="text-xs text-gray-600">{size.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2: // Tech Experience
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your tech experience level?</h2>
              <p className="text-gray-600">Help us understand how comfortable you are with technology</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => updateFormData('techExperience', level.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                    formData.techExperience === level.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{level.label}</h3>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Interests
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What FarmLab features excite you most?</h2>
              <p className="text-gray-600">Select all that interest you (the more the better!)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                    formData.interests.includes(interest.id)
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl mt-1">{interest.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{interest.label}</h3>
                      <p className="text-xs text-gray-600 mt-1">{interest.description}</p>
                    </div>
                    {formData.interests.includes(interest.id) && (
                      <FiCheck className="w-5 h-5 text-purple-600 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Expectations
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you hope to achieve with FarmLab?</h2>
              <p className="text-gray-600">Your goals help us prioritize features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expectations.map((expectation) => (
                <button
                  key={expectation.id}
                  onClick={() => toggleExpectation(expectation.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                    formData.expectations.includes(expectation.id)
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-1">{expectation.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{expectation.label}</h3>
                    </div>
                    {formData.expectations.includes(expectation.id) && (
                      <FiCheck className="w-5 h-5 text-orange-600 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Contact Info
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there! 📝</h2>
              <p className="text-gray-600">We need your contact info to keep you updated</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              {(formData.userType === 'farmer' || formData.userType === 'tech' || formData.userType === 'rnd') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization (Optional)</label>
                  <input
                    type="text"
                    value={formData.organization || ''}
                    onChange={(e) => updateFormData('organization', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Farm name, Company, University..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 6: // Success
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">You&apos;re on the list! 🎉</h2>
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
              Thank you for sharing your story with us! We&apos;ll be in touch soon with updates about FarmLab.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <p className="text-sm text-gray-700">
                <strong>What happens next?</strong><br />
                We&apos;ll analyze your responses to make FarmLab better for people like you, and you&apos;ll get early access when we launch!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-block px-8 py-3 bg-gradient-to-r from-green-400 via-green-600 to-lime-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-lime-500 transition-all duration-200 animate-pulse"
        style={{ boxShadow: '0 0 16px 2px #a3e63555, 0 2px 8px 0 #0001' }}
      >
        Join the Waitlist ✨
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header with progress */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-green-100 transition-colors"
            >
              ✕
            </button>
            <div className="text-white text-sm font-medium">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
          <div className="text-white">
            <h3 className="font-bold text-lg">{steps[currentStep]?.title}</h3>
            <p className="text-green-100 text-sm">{steps[currentStep]?.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 max-h-[60vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer with navigation */}
        {currentStep < totalSteps && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <button
              onClick={currentStep === totalSteps - 1 ? submitForm : nextStep}
              disabled={
                (currentStep === 1 && !formData.userType) ||
                (currentStep === 2 && !formData.techExperience) ||
                (currentStep === 5 && (!formData.name || !formData.email || !formData.location))
              }
              className={`flex items-center px-6 py-2 rounded-xl font-medium transition-all ${
                (currentStep === 1 && !formData.userType) ||
                (currentStep === 2 && !formData.techExperience) ||
                (currentStep === 5 && (!formData.name || !formData.email || !formData.location))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {currentStep === totalSteps - 1 ? 'Join Waitlist' : 'Next'}
              <FiArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        )}

        {currentStep === totalSteps && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}