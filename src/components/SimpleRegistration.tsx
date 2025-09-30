"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiTarget, FiUsers } from "react-icons/fi";

// Define types
type FormDataType = Record<string, string | string[] | number | boolean | undefined>;
type ErrorsType = Record<string, string | undefined>;

// Simple input component that never loses focus
const BasicInput = ({ id, label, type, required, minLength, formData, errors, onChange }: {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  formData: FormDataType;
  errors: ErrorsType;
  onChange: (id: string, value: string) => void;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="mb-4 sm:mb-6">
      <label htmlFor={id} className="block font-semibold mb-2 text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type === "password" && showPassword ? "text" : type}
          className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg font-medium ${
            errors[id] 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400' 
              : 'border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-4 shadow-sm hover:shadow-md focus:shadow-lg`}
          defaultValue={formData[id] ? String(formData[id]) : ""}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            onChange(id, target.value);
          }}
          placeholder={`Enter your ${label.toLowerCase()}`}
          minLength={minLength}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 711.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            )}
          </button>
        )}
      </div>
      {errors[id] && (
        <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {errors[id]}
        </div>
      )}
    </div>
  );
};

// Multi-select component
const MultiSelect = ({ id, label, options, required, formData, errors, onChange }: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  formData: FormDataType;
  errors: ErrorsType;
  onChange: (id: string, value: string[]) => void;
}) => {
  const currentValue = Array.isArray(formData[id]) ? formData[id] as string[] : [];
  
  const toggleOption = (option: string) => {
    if (currentValue.includes(option)) {
      onChange(id, currentValue.filter(v => v !== option));
    } else {
      onChange(id, [...currentValue, option]);
    }
  };
  
  return (
    <div className="mb-4 sm:mb-6">
      <label className="block font-semibold mb-3 text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {options.map((option) => {
          const isSelected = currentValue.includes(option);
          return (
            <button
              key={option}
              type="button"
              className={`p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-3 text-left shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-green-500 bg-green-100 text-green-800 shadow-md transform scale-105 ring-2 ring-green-200'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
              }`}
              onClick={() => toggleOption(option)}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected 
                  ? 'border-green-600 bg-green-600' 
                  : 'border-gray-400 bg-white'
              }`}>
                {isSelected && <FiCheckCircle className="text-white w-3 h-3" />}
              </div>
              <span className="flex-1 font-medium">{option}</span>
            </button>
          );
        })}
      </div>
      {errors[id] && (
        <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {errors[id]}
        </div>
      )}
    </div>
  );
};

// Single select component
const SingleSelect = ({ id, label, options, required, formData, errors, onChange }: {
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  formData: FormDataType;
  errors: ErrorsType;
  onChange: (id: string, value: string) => void;
}) => {
  const currentValue = formData[id] as string;
  
  return (
    <div className="mb-4 sm:mb-6">
      <label className="block font-semibold mb-3 text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {options.map((option) => {
          const isSelected = currentValue === option;
          return (
            <button
              key={option}
              type="button"
              className={`p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-3 text-left shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-100 text-emerald-800 shadow-md transform scale-105 ring-2 ring-emerald-200'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              onClick={() => onChange(id, option)}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected 
                  ? 'border-emerald-600 bg-emerald-600' 
                  : 'border-gray-400 bg-white'
              }`}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                )}
              </div>
              <span className="flex-1 font-medium">{option}</span>
            </button>
          );
        })}
      </div>
      {errors[id] && (
        <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {errors[id]}
        </div>
      )}
    </div>
  );
};

// Completely isolated research field input component
const ResearchFieldInput = React.memo(({ 
  value, 
  error, 
  onChange 
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Set initial value only once
  React.useEffect(() => {
    if (!isInitialized && inputRef.current) {
      inputRef.current.value = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  
  return (
    <div className="mb-4 sm:mb-6">
      <label htmlFor="research_field" className="block font-semibold mb-2 text-gray-900">
        What is your research field or academic focus?
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        ref={inputRef}
        id="research_field"
        name="research_field"
        type="text"
        className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg font-medium ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500'
        } focus:outline-none focus:ring-4 shadow-sm hover:shadow-md focus:shadow-lg`}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          onChange(target.value);
        }}
        placeholder="Enter your research field or academic focus"
      />
      {error && (
        <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
});
ResearchFieldInput.displayName = 'ResearchFieldInput';

// Completely isolated interest reason input component
const InterestReasonInput = React.memo(({ 
  value, 
  error, 
  onChange 
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Set initial value only once
  React.useEffect(() => {
    if (!isInitialized && inputRef.current) {
      inputRef.current.value = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);
  
  return (
    <div className="mb-4 sm:mb-6">
      <label htmlFor="interest_reason" className="block font-semibold mb-2 text-gray-900">
        What brings you to FarmLab?
      </label>
      <input
        ref={inputRef}
        id="interest_reason"
        name="interest_reason"
        type="text"
        className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg font-medium ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400' 
            : 'border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500'
        } focus:outline-none focus:ring-4 shadow-sm hover:shadow-md focus:shadow-lg`}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          onChange(target.value);
        }}
        placeholder="What brings you to FarmLab?"
      />
      {error && (
        <div className="flex items-center mt-2 text-red-600 text-sm font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
});
InterestReasonInput.displayName = 'InterestReasonInput';

export default function MultiStepRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({});
  const [errors, setErrors] = useState<ErrorsType>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Stable change handlers
  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const handleMultiSelectChange = (id: string, value: string[]) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const handleSingleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: undefined }));
  };

  // Get selected roles
  const selectedRoles = Array.isArray(formData.roles) ? formData.roles as string[] : [];

  // Role-specific question components
  const FarmerQuestions = () => (
    <>
      <SingleSelect
        id="farm_size"
        label="Farm size"
        options={["< 1 ha", "1–5 ha", "5–20 ha", "20+ ha"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
      <MultiSelect
        id="production_type"
        label="Type of production (select all that apply)"
        options={["Vegetables", "Grains / Cereals", "Fruits / Orchards", "Livestock / Dairy", "Greenhouse", "Hydroponics / Vertical Farming", "Mixed / Other"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
      <MultiSelect
        id="current_tech_usage"
        label="What technologies do you already use?"
        options={["None — mostly manual", "Drip or timed irrigation", "Basic sensors (e.g., soil moisture)", "Farm management apps or software", "IoT / automated control systems", "Drones / imaging / AI", "Renewable energy solutions"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
      <MultiSelect
        id="challenges"
        label="What are your biggest challenges? (Select up to 3)"
        options={["Water usage / irrigation optimization", "Pest / disease detection", "Labor shortages", "Climate unpredictability", "Low yield / inefficiency", "Feed / livestock cost", "Lack of technical support", "Sustainability / soil health"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
      <MultiSelect
        id="priorities"
        label="What are your top priorities in the next 2 years?"
        options={["Automate key operations", "Reduce costs", "Increase yield", "Transition to sustainable practices", "Adopt smart farming solutions", "Collaborate with tech partners"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  const TechnologistQuestions = () => (
    <>
      <SingleSelect
        id="expertise_area"
        label="What is your primary area of expertise?"
        options={["IoT / Embedded Systems", "Backend / API Development", "Data Science / AI / ML", "Automation / Robotics", "Hardware / Electronics Design", "Cloud / Infrastructure", "Full-stack Development", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
      <MultiSelect
        id="collaboration_interest"
        label="What type of collaboration interests you?"
        options={["Build and integrate IoT devices", "Develop APIs or dashboards", "Work with real-time sensor data", "Contribute to open-source software", "Pilot-test solutions on real farms", "Research and analytics projects"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
      <MultiSelect
        id="data_interest"
        label="What kind of agricultural data would be most valuable to you?"
        options={["Sensor telemetry (soil, climate, etc.)", "Plant growth / yield metrics", "Livestock data", "Automation / control logs", "Market and pricing trends", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  // Use static JSX instead of functions to prevent recreation
  const researcherQuestionsJSX = (
    <>
      <ResearchFieldInput
        value={formData.research_field ? String(formData.research_field) : ""}
        error={errors.research_field}
        onChange={(value) => handleInputChange("research_field", value)}
      />
      <MultiSelect
        id="collab_interest"
        label="What type of collaboration interests you?"
        options={["Data access", "Field trials", "Joint publications", "Student projects", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  const enthusiastQuestionsJSX = (
    <>
      <InterestReasonInput
        value={formData.interest_reason ? String(formData.interest_reason) : ""}
        error={errors.interest_reason}
        onChange={(value) => handleInputChange("interest_reason", value)}
      />
      <MultiSelect
        id="follow_topics"
        label="What topics would you like to follow?"
        options={["Smart farming", "IoT", "Sustainability", "Market trends", "All of the above"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  const IndustryQuestions = () => (
    <>
      <SingleSelect
        id="sector"
        label="What sector are you in?"
        options={["Agri-inputs (fertilizers, seeds, etc.)", "Logistics / cold chain", "Food processing / packaging", "Renewable energy", "Agritech / SaaS", "Government / policy", "Investment / VC", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
      <MultiSelect
        id="industry_interest"
        label="What are you most interested in exploring with FarmLab?"
        options={["Commercial partnerships", "Product integration", "Research collaboration", "Market intelligence", "Pilot deployment", "Sponsorship or investment"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  const InvestorQuestions = () => (
    <>
      <SingleSelect
        id="investment_focus"
        label="What is your main investment focus?"
        options={["AgriTech", "IoT / Hardware", "SaaS / Software", "Sustainability", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
      <SingleSelect
        id="ticket_size"
        label="Typical ticket size?"
        options={["< $50k", "$50k–$250k", "$250k–$1M", "$1M+", "Not sure"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
    </>
  );

  const StudentQuestions = () => (
    <>
      <SingleSelect
        id="study_level"
        label="What is your level?"
        options={["High school", "Undergraduate", "Graduate", "Educator", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleSingleSelectChange}
      />
      <MultiSelect
        id="interest_area"
        label="What are you most interested in?"
        options={["Internships", "Research projects", "Learning resources", "Hackathons", "Other"]}
        formData={formData}
        errors={errors}
        onChange={handleMultiSelectChange}
      />
    </>
  );

  // Build dynamic steps based on selected roles
  const buildSteps = () => {
    const baseSteps = [
      {
        id: "basic_info",
        title: "Basic Information",
        content: (
          <>
            <BasicInput
              id="full_name"
              label="Full Name"
              type="text"
              required
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
            <BasicInput
              id="email"
              label="Email Address"
              type="email"
              required
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
            <BasicInput
              id="password"
              label="Create Password"
              type="password"
              required
              minLength={8}
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
            <BasicInput
              id="country"
              label="Country / Region"
              type="text"
              required
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
            <BasicInput
              id="organization"
              label="Organization / Farm / Company Name"
              type="text"
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          </>
        )
      },
      {
        id: "user_type",
        title: "Your Role & Interest",
        content: (
          <MultiSelect
            id="roles"
            label="Which of the following describe you? (You can select more than one)"
            options={[
              "Farmer / Grower",
              "Technologist / Developer / Engineer",
              "Researcher / Academic",
              "Industry Professional (Agri-related, food, energy, logistics, etc.)",
              "Investor / Business Developer",
              "Student / Educator",
              "Enthusiast / Curious Observer"
            ]}
            required
            formData={formData}
            errors={errors}
            onChange={handleMultiSelectChange}
          />
        )
      }
    ];

    // Add role-specific steps
    const roleSteps = [];
    
    if (selectedRoles.includes("Farmer / Grower")) {
      roleSteps.push({
        id: "farmer_path",
        title: "Farmer Path",
        content: <FarmerQuestions />
      });
    }
    
    if (selectedRoles.includes("Technologist / Developer / Engineer")) {
      roleSteps.push({
        id: "technologist_path",
        title: "Technologist Path", 
        content: <TechnologistQuestions />
      });
    }
    
    if (selectedRoles.includes("Researcher / Academic")) {
      roleSteps.push({
        id: "researcher_path",
        title: "Researcher / Academic Path",
        content: researcherQuestionsJSX
      });
    }
    
    if (selectedRoles.includes("Industry Professional (Agri-related, food, energy, logistics, etc.)")) {
      roleSteps.push({
        id: "industry_path",
        title: "Industry Professional Path",
        content: <IndustryQuestions />
      });
    }
    
    if (selectedRoles.includes("Investor / Business Developer")) {
      roleSteps.push({
        id: "investor_path",
        title: "Investor / Business Developer Path",
        content: <InvestorQuestions />
      });
    }
    
    if (selectedRoles.includes("Student / Educator")) {
      roleSteps.push({
        id: "student_path",
        title: "Student / Educator Path",
        content: <StudentQuestions />
      });
    }
    
    if (selectedRoles.includes("Enthusiast / Curious Observer")) {
      roleSteps.push({
        id: "enthusiast_path",
        title: "Enthusiast / Curious Observer Path",
        content: enthusiastQuestionsJSX
      });
    }

    // Final step
    const finalStep = {
      id: "final_step",
      title: "Engagement & Participation",
      content: (
        <>
          <MultiSelect
            id="participation_mode"
            label="How would you like to participate in FarmLab?"
            options={[
              "Join the community / follow updates",
              "Access data and dashboards", 
              "Join beta / pilot programs",
              "Partner commercially",
              "Contribute to research"
            ]}
            formData={formData}
            errors={errors}
            onChange={handleMultiSelectChange}
          />
          <SingleSelect
            id="pricing_model"
            label="What pricing model would you find most appealing?"
            options={[
              "Monthly subscription",
              "One-time purchase",
              "Pay-as-you-grow (based on farm size)",
              "Revenue-sharing model",
              "Not sure yet"
            ]}
            formData={formData}
            errors={errors}
            onChange={handleSingleSelectChange}
          />
        </>
      )
    };

    return [...baseSteps, ...roleSteps, finalStep];
  };

  // Get current steps array
  const steps = buildSteps();

  const validateCurrentStep = async () => {
    setIsValidating(true);
    const newErrors: ErrorsType = {};
    
    if (currentStep === 0) {
      // Basic validation
      if (!formData.full_name) newErrors.full_name = "Required";
      if (!formData.email) {
        newErrors.email = "Required";
      } else {
        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email as string)) {
          newErrors.email = "Invalid email format";
        } else {
          // Check if email already exists
          try {
            const response = await fetch('/api/auth/check-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: formData.email }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.exists) {
                newErrors.email = "This email is already registered. Please use a different email or sign in.";
              }
            }
            // If API call fails, we'll proceed without email check to avoid blocking user
          } catch (error) {
            console.error('Email check failed:', error);
            // Continue without blocking if API is down
          }
        }
      }
      if (!formData.password) {
        newErrors.password = "Required";
      } else if ((formData.password as string).length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (!formData.country) newErrors.country = "Required";
    } else if (currentStep === 1) {
      if (!formData.roles || (Array.isArray(formData.roles) && formData.roles.length === 0)) {
        newErrors.roles = "Please select at least one role";
      }
    }
    
    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Debug: Check what's in formData.roles
      console.log('Raw formData.roles:', formData.roles);
      console.log('Is formData.roles an array?', Array.isArray(formData.roles));
      console.log('formData.roles length:', Array.isArray(formData.roles) ? formData.roles.length : 'N/A');

      // Get the primary role (first selected role)
      const primaryRole = Array.isArray(formData.roles) && formData.roles.length > 0 
        ? (formData.roles as string[])[0] 
        : 'waiting_list';

      console.log('Calculated primaryRole:', primaryRole);

      // Transform form data to match API expectations
      const registrationData = {
        // Required fields first
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: primaryRole, // Primary role for user account
        
        // Optional basic fields
        organization: formData.organization,
        country: formData.country,
        
        // All the detailed form responses
        roles: formData.roles, // Full roles array for registration response
        experience_level: formData.experience_level,
        farm_size: formData.farm_size,
        production_type: formData.production_type,
        current_tech_usage: formData.current_tech_usage,
        challenges: formData.challenges,
        priorities: formData.priorities,
        expertise_area: formData.expertise_area,
        collaboration_interest: formData.collaboration_interest,
        data_interest: formData.data_interest,
        research_field: formData.research_field,
        collab_interest: formData.collab_interest,
        sector: formData.sector,
        industry_interest: formData.industry_interest,
        investment_focus: formData.investment_focus,
        ticket_size: formData.ticket_size,
        study_level: formData.study_level,
        interest_area: formData.interest_area,
        follow_topics: formData.follow_topics,
        interest_reason: formData.interest_reason,
        participation_mode: formData.participation_mode,
        pricing_model: formData.pricing_model
      };

      // Debug: Log form data being sent
      console.log('Primary role selected:', primaryRole);
      console.log('Final registrationData role field:', registrationData.role);
      console.log('Form data being sent:', { ...registrationData, password: '[REDACTED]' });
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        console.log('Registration error response:', data);
        setErrors({ general: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.log('Registration catch error:', error);
      setErrors({ general: 'Registration failed' });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg mb-6 mx-auto">
            <FiCheckCircle className="text-white text-4xl animate-bounce" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
            Welcome to the Future of Agriculture!
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
            Thank you for joining our community. We&apos;ll be in touch soon with updates about our platform launch.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            <FiTarget className="w-5 h-5 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="relative min-h-screen px-4 py-6 sm:py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Mobile-First Header with Navigation */}
          <div className="mb-8 sm:mb-10">
            {/* Top row - Logo and Back button */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <Link 
                href="/"
                className="flex items-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200 flex items-center justify-center">
                  <FiTarget className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">FarmLab</span>
              </Link>
              
              <Link 
                href="/"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-sm text-gray-700 font-medium rounded-lg border border-gray-200/80 hover:bg-white hover:text-green-600 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
              >
                <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </Link>
            </div>
            
            {/* Title Section - Mobile Optimized */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight leading-tight">
                Join the Agricultural
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 mt-1">
                  Revolution
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed px-2">
                Help us build the future of smart farming. Your insights will shape our platform.
              </p>
            </div>
          </div>

          {/* Progress indicators */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`transition-all duration-300 ${
                  idx === currentStep 
                    ? 'w-6 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full scale-110' 
                    : idx < currentStep
                      ? 'w-3 h-3 bg-green-400 rounded-full'
                      : 'w-3 h-3 bg-gray-300 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Current step */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FiTarget className="text-green-600" />
                {steps[currentStep].title}
              </h2>
            </div>

            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 font-medium">{errors.general}</p>
              </div>
            )}

            {steps[currentStep].content}

            {/* Navigation */}
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
                  currentStep === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 shadow-sm hover:shadow-md'
                }`}
              >
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={isValidating}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all ${
                  isValidating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <FiUsers className="w-4 h-4" />
                    {isValidating ? 'Validating...' : 'Join FarmLab'}
                  </>
                ) : (
                  <>
                    {isValidating ? 'Validating...' : 'Next'} <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}