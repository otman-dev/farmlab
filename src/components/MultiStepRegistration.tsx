"use client";
import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiTarget, FiChevronDown, FiChevronUp, FiUsers } from "react-icons/fi";
import { UncontrolledInput } from "./UncontrolledInput";
import { useI18n } from "./LanguageProvider";

// Define types first
type FormDataType = Record<string, string | string[] | number | boolean | undefined>;
type ErrorsType = Record<string, string | undefined>;
type ExpandedType = Record<number, boolean>;

// Define a more comprehensive Question type
type Question = {
	id: string;
	label: string;
	type: string;
	required?: boolean;
	minLength?: number;
	options?: string[];
};

// Move formJson outside component to make it completely stable
const formJson = {
	"form": {
		"title": "FarmLab Registration & Market Intelligence Form",
		"description": "Adaptive multi-branch questionnaire to understand user profile, challenges, goals, and collaboration opportunities with FarmLab.",
		"steps": [
			{
				"id": "basic_info",
				"title": "Basic Information",
				   "questions": [
					   { "id": "full_name", "label": "Full Name", "type": "text", "required": true },
					   { "id": "email", "label": "Email Address", "type": "email", "required": true },
					   { "id": "password", "label": "Create Password", "type": "password", "required": true, "minLength": 8 },
					   { "id": "country", "label": "Country / Region", "type": "text", "required": true }, // Always required, even with OAuth
					   { "id": "organization", "label": "Organization / Farm / Company Name", "type": "text", "required": false }
				   ]
			},
			{
				"id": "oauth_basic_info",
				"title": "Complete Your Profile",
				"questions": [
					{ "id": "country", "label": "Country / Region", "type": "text", "required": true },
					{ "id": "organization", "label": "Organization / Farm / Company Name", "type": "text", "required": false }
				]
			},
			{
				"id": "user_type",
				"title": "Your Role & Interest",
				"description": "This determines which question paths you’ll see next.",
				"questions": [
					{
						"id": "roles",
						"label": "Which of the following describe you? (You can select more than one)",
						"type": "multi-select",
						"options": [
							"Farmer / Grower",
							"Technologist / Developer / Engineer",
							"Researcher / Academic",
							"Industry Professional (Agri-related, food, energy, logistics, etc.)",
							"Investor / Business Developer",
							"Student / Educator",
							"Enthusiast / Curious Observer"
						],
						"required": true
					}
				],
				"branch_logic": {
					"Farmer / Grower": "branch_farmer",
					"Technologist / Developer / Engineer": "branch_technologist",
					"Farmer / Grower + Technologist / Developer / Engineer": "branch_hybrid",
					"Industry Professional (Agri-related, food, energy, logistics, etc.)": "branch_industry"
				}
			}
		]
	},
	"branches": {
	       "branch_researcher": {
		       "title": "Researcher / Academic Path",
		       "questions": [
			       { "id": "research_field", "label": "What is your research field or academic focus?", "type": "text", "required": true },
			       { "id": "collab_interest", "label": "What type of collaboration interests you?", "type": "multi-select", "options": ["Data access", "Field trials", "Joint publications", "Student projects", "Other"] }
		       ]
	       },
	       "branch_investor": {
		       "title": "Investor / Business Developer Path",
		       "questions": [
			       { "id": "investment_focus", "label": "What is your main investment focus?", "type": "single-select", "options": ["AgriTech", "IoT / Hardware", "SaaS / Software", "Sustainability", "Other"] },
			       { "id": "ticket_size", "label": "Typical ticket size?", "type": "single-select", "options": ["< $50k", "$50k–$250k", "$250k–$1M", "$1M+", "Not sure"] }
		       ]
	       },
	       "branch_student": {
		       "title": "Student / Educator Path",
		       "questions": [
			       { "id": "study_level", "label": "What is your level?", "type": "single-select", "options": ["High school", "Undergraduate", "Graduate", "Educator", "Other"] },
			       { "id": "interest_area", "label": "What are you most interested in?", "type": "multi-select", "options": ["Internships", "Research projects", "Learning resources", "Hackathons", "Other"] }
		       ]
	       },
	       "branch_enthusiast": {
		       "title": "Enthusiast / Curious Observer Path",
		       "questions": [
			       { "id": "interest_reason", "label": "What brings you to FarmLab?", "type": "text", "required": false },
			       { "id": "follow_topics", "label": "What topics would you like to follow?", "type": "multi-select", "options": ["Smart farming", "IoT", "Sustainability", "Market trends", "All of the above"] }
		       ]
	       },
		"branch_farmer": {
			"title": "Farmer Path",
			"questions": [
				{ "id": "farm_size", "label": "Farm size", "type": "single-select", "options": ["< 1 ha", "1–5 ha", "5–20 ha", "20+ ha"] },
				{ "id": "production_type", "label": "Type of production (select all that apply)", "type": "multi-select", "options": ["Vegetables", "Grains / Cereals", "Fruits / Orchards", "Livestock / Dairy", "Greenhouse", "Hydroponics / Vertical Farming", "Mixed / Other"] },
				{ "id": "current_tech_usage", "label": "What technologies do you already use?", "type": "multi-select", "options": ["None — mostly manual", "Drip or timed irrigation", "Basic sensors (e.g., soil moisture)", "Farm management apps or software", "IoT / automated control systems", "Drones / imaging / AI", "Renewable energy solutions"] },
				{ "id": "challenges", "label": "What are your biggest challenges? (Select up to 3)", "type": "multi-select", "options": ["Water usage / irrigation optimization", "Pest / disease detection", "Labor shortages", "Climate unpredictability", "Low yield / inefficiency", "Feed / livestock cost", "Lack of technical support", "Sustainability / soil health"] },
				{ "id": "priorities", "label": "What are your top priorities in the next 2 years?", "type": "multi-select", "options": ["Automate key operations", "Reduce costs", "Increase yield", "Transition to sustainable practices", "Adopt smart farming solutions", "Collaborate with tech partners"] }
			]
		},
		"branch_technologist": {
			"title": "Technologist Path",
			"questions": [
				{ "id": "expertise_area", "label": "What is your primary area of expertise?", "type": "single-select", "options": ["IoT / Embedded Systems", "Backend / API Development", "Data Science / AI / ML", "Automation / Robotics", "Hardware / Electronics Design", "Cloud / Infrastructure", "Full-stack Development", "Other"] },
				{ "id": "collaboration_interest", "label": "What type of collaboration interests you?", "type": "multi-select", "options": ["Build and integrate IoT devices", "Develop APIs or dashboards", "Work with real-time sensor data", "Contribute to open-source software", "Pilot-test solutions on real farms", "Research and analytics projects"] },
				{ "id": "data_interest", "label": "What kind of agricultural data would be most valuable to you?", "type": "multi-select", "options": ["Sensor telemetry (soil, climate, etc.)", "Plant growth / yield metrics", "Livestock data", "Automation / control logs", "Market and pricing trends", "Other"] }
			]
		},
		"branch_hybrid": {
			"title": "Farmer + Technologist (Hybrid) Path",
			"questions": [
				{ "id": "hybrid_focus", "label": "Are you more focused on:", "type": "single-select", "options": ["Applying my tech skills to my own farm", "Building solutions for others", "Both"] },
				{ "id": "pilot_interest", "label": "Would you be interested in becoming an early pilot site for FarmLab technologies?", "type": "single-select", "options": ["Yes", "Maybe — need more info", "Not right now"] }
			]
		},
		"branch_industry": {
			"title": "Industry / Related Sector Path",
			"questions": [
				{ "id": "sector", "label": "What sector are you in?", "type": "single-select", "options": ["Agri-inputs (fertilizers, seeds, etc.)", "Logistics / cold chain", "Food processing / packaging", "Renewable energy", "Agritech / SaaS", "Government / policy", "Investment / VC", "Other"] },
				{ "id": "industry_interest", "label": "What are you most interested in exploring with FarmLab?", "type": "multi-select", "options": ["Commercial partnerships", "Product integration", "Research collaboration", "Market intelligence", "Pilot deployment", "Sponsorship or investment"] }
			]
		}
	},
	"final_section": {
		"title": "Engagement & Monetization (All Users)",
		"questions": [
			{ "id": "participation_mode", "label": "How would you like to participate in FarmLab?", "type": "multi-select", "options": ["Join the community / follow updates", "Access data and dashboards", "Join beta / pilot programs", "Partner commercially", "Contribute to research"] },
			{ "id": "pricing_model", "label": "What pricing model would you find most appealing?", "type": "single-select", "options": ["Monthly subscription", "One-time purchase", "Pay-as-you-grow (based on farm size)", "Revenue-sharing model", "Not sure yet"] }
		]
	}
};


// Role to branch mapping (no hybrid)
const branchLogic: { [key: string]: string } = {
	"Farmer / Grower": "branch_farmer",
	"Technologist / Developer / Engineer": "branch_technologist",
	"Industry Professional (Agri-related, food, energy, logistics, etc.)": "branch_industry",
	"Researcher / Academic": "branch_researcher",
	"Investor / Business Developer": "branch_investor",
	"Student / Educator": "branch_student",
	"Enthusiast / Curious Observer": "branch_enthusiast"
};

	// FarmLab brand color palette for progress bubbles
	const farmLabColors = [
		"from-green-200 via-emerald-200 to-teal-200",
		"from-emerald-200 via-green-200 to-lime-200",
		"from-teal-200 via-cyan-200 to-blue-200",
		"from-green-300 via-emerald-300 to-teal-300",
		"from-lime-200 via-green-200 to-emerald-200",
		"from-cyan-200 via-teal-200 to-green-200"
	];

	// Define props for OAuth data
interface MultiStepRegistrationProps {
	googleOAuthData?: {
		name?: string;
		email?: string;
		googleAuthenticated?: boolean;
		token?: string;
	};
	searchParams?: URLSearchParams;
	forceProfileCompletion?: boolean;
}

export default function MultiStepRegistration({ 
	googleOAuthData, 
	searchParams, 
	forceProfileCompletion = false 
}: MultiStepRegistrationProps = {}) {
		const { t } = useI18n();
		
		// Extract token data if available
const [tokenData, setTokenData] = useState<any>(null);
		
React.useEffect(() => {
		// Try to parse token from props, URL, or localStorage
		console.log('MultiStepRegistration: Checking for token data', {
			hasGoogleOAuthData: !!googleOAuthData,
			hasGoogleOAuthToken: !!(googleOAuthData?.token),
			hasSearchParams: !!searchParams,
			tokenFromParams: searchParams?.get('token')
		});
		
		let token = googleOAuthData?.token || (searchParams ? searchParams.get('token') : null);
		
		// If no token in props or URL, try localStorage
		if (!token) {
			try {
				const storedToken = localStorage.getItem('pendingUserToken');
				if (storedToken) {
					console.log('MultiStepRegistration: Found token in localStorage');
					token = storedToken;
				}
			} catch (e) {
				console.error('MultiStepRegistration: Failed to read localStorage:', e);
			}
		}
		
		if (token) {
			try {
				const parsed = JSON.parse(decodeURIComponent(token));
				setTokenData(parsed);
				console.log('MultiStepRegistration: Parsed token data:', parsed);
				
				// If we have token data, immediately set the step to 1 (first input form)
				if (parsed && parsed.email) {
					// If we're in an OAuth flow, skip to the minimal OAuth form by setting stepIndex=1
					setStepIndex(0);
				}
			} catch (e) {
				console.error('MultiStepRegistration: Failed to parse token:', e);
			}
		} else {
			console.log('MultiStepRegistration: No token found in props or URL');
		}
	}, [googleOAuthData?.token, searchParams]);		// Log initialization for debugging
		console.log("MultiStepRegistration initialized with OAuth data:", googleOAuthData ? {
			name: googleOAuthData.name,
			email: googleOAuthData.email,
			googleAuthenticated: googleOAuthData.googleAuthenticated,
			hasToken: !!googleOAuthData.token,
			tokenData: tokenData ? 'present' : 'none'
		} : 'No OAuth data');
		
		// For OAuth users, we start with the oauth_basic_info step
		// For regular users, we start with the standard basic_info step
		const startingStepIndex = 0; // Always start at first step
		const [stepIndex, setStepIndex] = useState<number>(startingStepIndex);
		
	// Add a useEffect to handle forced profile completion and disable back button
	React.useEffect(() => {
		if (forceProfileCompletion) {
			console.log('MultiStepRegistration: Force profile completion mode active');
			
			// Check if profile is already completed from localStorage
			const isProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
			
			// Only add restrictions if profile is not yet completed
			if (!isProfileCompleted) {
				// Add an event listener to prevent navigation away
				const handleBeforeUnload = (e: BeforeUnloadEvent) => {
					// Check if we're navigating to the signout page
					const navUrl = document?.activeElement?.getAttribute('href');
					if (navUrl && navUrl.includes('/api/auth/signout')) {
						// Allow navigation to signout without warning
						return;
					}
					
					e.preventDefault();
					e.returnValue = 'You must complete your profile before leaving this page.';
					return e.returnValue;
				};
				
				// Disable the browser's back button
				const handlePopState = () => {
					window.history.pushState(null, document.title, window.location.href);
					alert('You must complete your profile before navigating away.');
				};
				
				window.history.pushState(null, document.title, window.location.href);
				window.addEventListener('popstate', handlePopState);
				window.addEventListener('beforeunload', handleBeforeUnload);
				
				return () => {
					window.removeEventListener('popstate', handlePopState);
					window.removeEventListener('beforeunload', handleBeforeUnload);
				};
			}
		}
	}, [forceProfileCompletion]);

	// Create initial form data state based on OAuth status
	const createInitialFormData = () => {
		// First try to use explicit googleOAuthData from props
		if (googleOAuthData && googleOAuthData.email) {
			console.log('MultiStepRegistration: Using googleOAuthData to pre-fill form', {
				name: googleOAuthData.name,
				email: googleOAuthData.email
			});
			return {
				full_name: googleOAuthData.name || '',
				email: googleOAuthData.email || '',
				googleAuthenticated: googleOAuthData.googleAuthenticated || false,
				// We don't pre-fill country since it's required input from the user
				country: '',
				organization: ''
			};
		}
		
		// Then try to use token data if available
		if (tokenData && tokenData.email) {
			console.log('MultiStepRegistration: Using tokenData to pre-fill form', {
				name: tokenData.name,
				email: tokenData.email,
				provider: tokenData.provider
			});
			return {
				full_name: tokenData.name || '',
				email: tokenData.email || '',
				googleAuthenticated: tokenData.provider === 'google' || false,
				country: '',
				organization: ''
			};
		}
		
		// Default to empty form data
		console.log('MultiStepRegistration: No OAuth data found, using empty form');
		return {};
	};		const [formData, setFormData] = useState<FormDataType>(createInitialFormData());
		
		// Update form data when token data changes
		React.useEffect(() => {
			if (tokenData && tokenData.email) {
				console.log('MultiStepRegistration: Updating form data from token');
				setFormData(prev => ({
					...prev,
					full_name: prev.full_name || tokenData.name || '',
					email: prev.email || tokenData.email || '',
					googleAuthenticated: prev.googleAuthenticated || tokenData.provider === 'google' || false,
				}));
			}
		}, [tokenData]);
		const [errors, setErrors] = useState<ErrorsType>({});
		const [expanded, setExpanded] = useState<ExpandedType>({});
		const [submitted, setSubmitted] = useState<boolean>(false);
		const [validationInProgress, setValidationInProgress] = useState<boolean>(false);
		const [showPassword, setShowPassword] = useState<boolean>(false);

		// Add effect to log step changes
		React.useEffect(() => {
			console.log("Step index changed to:", stepIndex);
		}, [stepIndex]);

		// Use useMemo to prevent rebuilding steps array on every render
		const { steps, currentStep } = useMemo(() => {
			console.log("Building steps array with selected roles:", formData["roles"]);
			// For OAuth users, we use a modified steps array
			const isOAuthUser = !!googleOAuthData;
			
			// Define base steps differently based on authentication method
			const baseSteps = isOAuthUser 
				? [formJson.form.steps.find(step => step.id === 'oauth_basic_info')] // Only use OAuth version for basic info
				: [formJson.form.steps.find(step => step.id === 'basic_info')]; // Use standard version
			
			// Filter out any undefined steps (shouldn't happen, but just in case)
			const filteredBaseSteps = baseSteps.filter(Boolean);
			
			// Add user type step which is common for both OAuth and regular users
			const userTypeStep = formJson.form.steps.find(step => step.id === 'user_type');
			if (userTypeStep) {
				filteredBaseSteps.push(userTypeStep);
			}
			
			const selectedRoles: string[] = Array.isArray(formData["roles"]) ? formData["roles"] : [];
			const branches: Record<string, { title: string; questions: Question[] }> = formJson.branches;
			// Get all matching branch keys in the order of selection
			const selectedBranchKeys = selectedRoles.map(role => branchLogic[role]).filter(Boolean);
			
			// Build steps: base, all selected branches, final
			const calculatedSteps = [
				...filteredBaseSteps,
				...selectedBranchKeys.map(branchKey => {
					const branch = branches[branchKey];
					return branch ? { id: branchKey, title: branch.title, questions: branch.questions } : null;
				}).filter(Boolean),
				{ id: "final_section", title: formJson.final_section.title, questions: formJson.final_section.questions }
			];
			
			return {
				steps: calculatedSteps,
				currentStep: calculatedSteps[stepIndex] ?? null
			};
		}, [formData["roles"], stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

		// Validation
		function validateStep(): boolean {
				console.log("Validating step:", currentStep?.id);
				if (!currentStep) {
					console.error("No current step to validate");
					return false;
				}
				const stepErrors: ErrorsType = {};
				   for (const q of currentStep.questions as Question[]) {
					   console.log(`Validating question "${q.id}" (${q.type}):`, {
						   value: q.type === 'password' ? '[REDACTED]' : formData[q.id],
						   required: q.required,
						   hasValue: !!formData[q.id],
						   isArray: Array.isArray(formData[q.id]),
						   arrayLength: Array.isArray(formData[q.id]) ? (formData[q.id] as string[]).length : 'n/a'
					   });
					   
					   // Special handling for OAuth users - skip password validation but ensure country is required
					   const isOAuthUser = formData['googleAuthenticated'];
					   
					   // Skip required validation for password field if user is authenticated with OAuth
					   if (q.id === 'password' && isOAuthUser) {
						   // Password not required for OAuth users
						   continue;
					   }
					   
					   // Ensure country is always validated as required, regardless of authentication method
					   if (q.id === 'country' && !formData[q.id]) {
						   console.log(`Field "${q.id}" failed required validation`);
						   // Use specific error message for OAuth users
						   if (isOAuthUser) {
							   stepErrors[q.id] = t("profile.country.required") || "Country is required even with Google sign-in";
						   } else {
							   stepErrors[q.id] = t("form.error.required");
						   }
					   }
					   
					   // @ts-expect-error: Some questions may not have required
					   if (q.required && (!formData[q.id] || (Array.isArray(formData[q.id]) && formData[q.id].length === 0))) {
						   console.log(`Field "${q.id}" failed required validation`);
						   stepErrors[q.id] = "Required";
					   }
					   if (q.type === "email" && formData[q.id]) {
						   const emailRegex = /^[^\s@]+@[^ 0-\s@]+\.[^\s@]+$/;
						   if (!emailRegex.test(formData[q.id] as string)) stepErrors[q.id] = "Invalid email";
					   }
					   if (q.type === "password" && formData[q.id]) {
						   if (q.minLength && (formData[q.id] as string).length < q.minLength) {
							   console.log(`Field "${q.id}" failed password length validation`);
							   stepErrors[q.id] = `Password must be at least ${q.minLength} characters`;
						   }
					   }
				   }
				console.log("Validation errors:", stepErrors);
				const isValid = Object.keys(stepErrors).length === 0;
				// Important: Set errors AFTER checking if there are any
				setErrors(stepErrors);
				return isValid;
			}

		const handleChange = useCallback((id: string, value: string | string[] | number | boolean | undefined) => {
			setFormData((prev: FormDataType) => ({ ...prev, [id]: value }));
			setErrors((prev: ErrorsType) => ({ ...prev, [id]: undefined }));
		}, []);
		
		const handleMultiSelect = useCallback((id: string, option: string) => {
			setFormData((prev: FormDataType) => {
				const arr: string[] = Array.isArray(prev[id]) ? prev[id] : [];
				if (arr.includes(option)) {
					return { ...prev, [id]: arr.filter((o: string) => o !== option) };
				} else {
					return { ...prev, [id]: [...arr, option] };
				}
			});
			setErrors((prev: ErrorsType) => ({ ...prev, [id]: undefined }));
		}, []);

		const handleToggleExpanded = useCallback(() => {
			setExpanded(e => ({ ...e, [stepIndex]: !(e[stepIndex] ?? true) }));
		}, [stepIndex]);
		
		function handleNext() {
			console.log("Attempting to go to next step...");
			console.log("Current form data:", { ...formData, password: formData.password ? '[REDACTED]' : undefined });
			
			// Prevent multiple validation attempts while processing
			if (validationInProgress) {
				console.log("Validation already in progress, ignoring click");
				return;
			}
			
			setValidationInProgress(true);
			
			// Use a setTimeout to ensure React state updates are processed
			// This prevents race conditions where setErrors hasn't completed before checking validation
			setTimeout(() => {
				const isValid = validateStep();
				console.log("Step validation result:", isValid, "Current errors:", errors);
				
				if (isValid) {
					console.log("Advancing from step", stepIndex, "to", stepIndex + 1);
					// If next step is the last, set submitted
					if (stepIndex === steps.length - 2) {
						setSubmitted(true);
					} else {
						setStepIndex((i: number) => i + 1);
					}
				} else {
					console.log("Failed to advance due to validation errors");
				}
				
				setValidationInProgress(false);
			}, 10);
		}
		function handleBack() {
			setStepIndex((i: number) => (i > 0 ? i - 1 : 0));
		}
		const [submitError, setSubmitError] = useState<string | null>(null);
		async function handleSubmit(e: React.FormEvent<HTMLButtonElement>) {
			e.preventDefault();
			setSubmitError(null);
			
			// Final validation of critical fields before submission
			// For OAuth users, password is not required
			const isOAuthUser = formData['googleAuthenticated'];
			
			console.log('MultiStepRegistration: Form submission attempt', { 
				isOAuthUser,
				fullName: formData['full_name'], 
				email: formData['email'],
				hasPassword: !!formData['password'],
				country: formData['country'],
				hasRoles: Array.isArray(formData['roles']) ? formData['roles'].length > 0 : false,
				hasTokenData: !!tokenData,
				forceProfileCompletion
			});
			
			// If this is a forced profile completion from Google OAuth but we somehow lost the OAuth flag,
			// try to recover it from the token data or the force flag
			if (forceProfileCompletion && !formData['googleAuthenticated'] && (tokenData?.provider === 'google')) {
				console.log('Recovering googleAuthenticated flag from token data');
				formData['googleAuthenticated'] = true;
			}
			
			// Double check if we should be in OAuth mode based on available data
			const effectiveOAuthUser = isOAuthUser || (tokenData?.provider === 'google');
			
			// Expanded required fields to include country and roles
			// For OAuth users, we still require country field explicitly
			const requiredFields = effectiveOAuthUser 
				? {
					'full_name': 'Full Name',
					'email': 'Email',
					'country': 'Country', // Country is still required for OAuth users
					'roles': 'Roles'
				}
				: {
					'full_name': 'Full Name',
					'email': 'Email',
					'password': 'Password',
					'country': 'Country',
					'roles': 'Roles'
				};
			
			const missingFields = Object.entries(requiredFields).filter(
				([key]) => {
					if (key === 'roles') {
						// Special handling for roles which should be an array with at least one value
						return !formData[key] || !Array.isArray(formData[key]) || formData[key].length === 0;
					}
					return !formData[key];
				}
			).map(([key, label]) => {
				console.log(`Field check: ${key} - ${formData[key] ? 'present' : 'missing'}`);
				return label;
			});
			
			if (missingFields.length > 0) {
				console.error(`Form validation failed - missing fields: ${missingFields.join(', ')}`);
				setSubmitError(t("form.error.missingFields") + `: ${missingFields.join(', ')}`);
				return;
			}
			
			if (validateStep()) {
				try {
					console.log('Submitting form data:', { 
						...formData, 
						password: '[REDACTED]',
						rolesCount: Array.isArray(formData.roles) ? formData.roles.length : 0
					});
					
					// Use different endpoints for OAuth vs regular registration
					const endpoint = formData['googleAuthenticated'] 
					  ? '/api/auth/complete-profile'
					  : '/api/auth/register';
					
					// Get token from localStorage if available - this helps with authentication
					let tokenParam = '';
					try {
						const storedToken = localStorage.getItem('pendingUserToken');
						if (storedToken) {
							tokenParam = `?token=${encodeURIComponent(storedToken)}`;
						}
					} catch (e) {
						console.error('Error accessing localStorage for token:', e);
					}
					
					console.log(`Submitting form to endpoint: ${endpoint}${tokenParam}`);
					const res = await fetch(`${endpoint}${tokenParam}`, {
						method: 'POST',
						headers: { 
							'Content-Type': 'application/json',
							'X-OAuth-Authentication': formData['googleAuthenticated'] ? 'true' : 'false',
							// Include auth token in headers as well for redundancy
							'X-Auth-Token': String(formData['token'] || localStorage.getItem('pendingUserToken') || ''),
						},
						body: JSON.stringify({
							...formData,
							// Include token data in the request body as well
							_tokenData: localStorage.getItem('authTokenRaw') || null,
						}),
						// Include credentials to send cookies with the request
						credentials: 'include',
					});
					
					// Handle network errors
					if (!res) {
						console.error('Network error: No response received');
						setSubmitError('Network error: Could not connect to server. Please try again.');
						return;
					}
					
					// Log response status
					console.log(`Registration response status: ${res.status} ${res.statusText}`);
					
					const data = await res.json();
					console.log('Registration response data:', data);
					
					if (!res.ok) {
						console.error('Registration failed:', data);
						
						// Special handling for database connection errors (503 Service Unavailable)
						if (res.status === 503 && (data.dbConnectionError || data.message?.includes('database'))) {
							console.error('Database connection error during profile submission');
							setSubmitError(t("errors.database.submitFailed") || 
								"We're having trouble connecting to our database. Your profile will be saved when connectivity is restored. You can continue to the next step.");
							
							// Store the form data in localStorage as a fallback
							try {
								localStorage.setItem('pendingProfileData', JSON.stringify(formData));
								localStorage.setItem('pendingProfileTimestamp', Date.now().toString());
								console.log('Stored form data in localStorage as fallback');
								
								// Despite the error, we'll treat this as a successful submission
								// This allows the user to proceed even when the DB is down
								setSubmitted(true);
								return;
							} catch (e) {
								console.error('Failed to store form data in localStorage:', e);
							}
						}
						
						// Handle standard validation errors
						if (data.details && Array.isArray(data.details)) {
							setSubmitError(t("register.error.withDetails") + `: ${data.details.join(', ')}`);
						} else {
							setSubmitError(data.error || data.message || t("register.error.generic"));
						}
						return;
					}
					
					console.log('Registration successful:', data);
					
					// Verify that the role was updated to waiting_list
					if (data.roleUpdated && data.currentRole === 'waiting_list') {
						console.log(`Role successfully updated from ${data.previousRole} to ${data.currentRole}`);
					} else {
						console.warn('Role update status not confirmed in response');
					}
					
					setSubmitted(true);
					
// For users who complete their profile, redirect to comingsoon page
				// Make sure to force a session refresh first to get the new role
				console.log('Registration complete, user now has waiting_list role');
				
					// Clear any stored pending user data
					try {
						localStorage.removeItem('pendingUserToken');
						localStorage.removeItem('pendingUserCompletion');
						localStorage.removeItem('pendingUserEmail');
						localStorage.removeItem('pendingTimestamp');
						
						// Set the profileCompleted flag to prevent beforeunload warnings
						localStorage.setItem('profileCompleted', 'true');
						
						// Remove any existing beforeunload handler
						window.onbeforeunload = null;
						
						console.log('Cleared localStorage pending user data and disabled beforeunload warnings');
					} catch (e) {
						console.error('Failed to clear localStorage:', e);
					}				// Force a full page reload to get a fresh session with the new role
				setTimeout(() => {
					// If the server indicated we should refresh the session (particularly for token-based auth)
					const refreshRequired = data.refreshSession === true;
					
					if (refreshRequired) {
						// Perform more thorough session refresh for token-based auth
						console.log('Performing thorough session refresh...');
						
						// First clear any session cache
						fetch('/api/auth/session?update=force', { 
							method: 'GET',
							headers: {
								'Cache-Control': 'no-cache, no-store, must-revalidate',
								'Pragma': 'no-cache',
								'Expires': '0'
							}
						})
						.then(() => {
							// Short delay to allow backend session updates to propagate
							setTimeout(() => {
								// Try the signin endpoint to force a new session
								fetch('/api/auth/signin?callbackUrl=' + encodeURIComponent(data.redirectTo || '/comingsoon'))
								.then(() => {
									console.log('Session thoroughly refreshed, redirecting to', data.redirectTo || '/comingsoon');
									// Use replace instead of href to ensure we don't add to browser history
									window.location.replace(data.redirectTo || '/comingsoon');
								})
								.catch(err => {
									console.error('Failed during thorough session refresh:', err);
									window.location.replace('/comingsoon');
								});
							}, 500);
						})
						.catch(err => {
							console.error('Failed to clear session cache:', err);
							window.location.replace('/comingsoon');
						});
					} else {
						// Standard session refresh
						console.log('Standard session refresh before redirecting...');
						fetch('/api/auth/session', { method: 'GET' })
							.then(() => {
								console.log('Session refreshed, redirecting to', data.redirectTo || '/comingsoon');
								// Use replace instead of href to ensure we don't add to browser history
								window.location.replace(data.redirectTo || '/comingsoon');
							})
							.catch(err => {
								console.error('Failed to refresh session before redirect:', err);
								window.location.replace('/comingsoon');
							});
					}
				}, 1500); // Slightly longer delay to show success state
				} catch (err: unknown) {
					console.error('Registration error:', err);
					setSubmitError(err instanceof Error ? err.message : t("register.error.generic"));
				}
			}
		}

		// Simple render function without useCallback to avoid deps issues
		const renderQuestion = (q: Question) => {
			if (q.type === "text" || q.type === "email" || q.type === "password") {
				return (
					<UncontrolledInput
						key={q.id}
						id={q.id}
						label={q.label}
						type={q.type}
						required={q.required}
						minLength={q.minLength}
						value={formData[q.id] ? String(formData[q.id]) : ""}
						error={errors[q.id]}
						showPassword={showPassword}
						onTogglePassword={q.type === "password" ? () => setShowPassword(!showPassword) : undefined}
						onChange={handleChange}
					/>
				);
			}
			if (q.type === "multi-select") {
				return (
					<div className="mb-4 sm:mb-6" key={q.id}>
						<label className="block font-semibold mb-3 text-gray-900">
							{q.label}
							{q.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
							{q.options?.map((option: string) => {
								const isSelected = Array.isArray(formData[q.id]) && (formData[q.id] as string[]).includes(option);
								return (
									<button
										type="button"
										key={option}
										className={`p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-3 text-left shadow-sm hover:shadow-md ${
											isSelected
												? 'border-green-500 bg-green-100 text-green-800 shadow-md transform scale-105 ring-2 ring-green-200'
												: 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700'
										}`}
										onClick={() => handleMultiSelect(q.id, option)}
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
						{errors[q.id] && (
							<div className="flex items-center mt-2 text-red-600 text-sm font-medium">
								<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								{errors[q.id]}
							</div>
						)}
					</div>
				);
			}
			if (q.type === "single-select") {
				return (
					<div className="mb-4 sm:mb-6" key={q.id}>
						<label className="block font-semibold mb-3 text-gray-900">
							{q.label}
							{q.required && <span className="text-red-500 ml-1">*</span>}
						</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
							{q.options?.map((option: string) => {
								const isSelected = formData[q.id] === option;
								return (
									<button
										type="button"
										key={option}
										className={`p-3 sm:p-4 rounded-xl border-2 text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-3 text-left shadow-sm hover:shadow-md ${
											isSelected
												? 'border-emerald-500 bg-emerald-100 text-emerald-800 shadow-md transform scale-105 ring-2 ring-emerald-200'
												: 'border-gray-300 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700'
										}`}
										onClick={() => handleChange(q.id, option)}
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
						{errors[q.id] && (
							<div className="flex items-center mt-2 text-red-600 text-sm font-medium">
								<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								{errors[q.id]}
							</div>
						)}
					</div>
				);
			}
			return null;
		};

		// FarmLab brand-consistent chat bubble style
		type BubbleProps = {
			children: React.ReactNode;
			colorIdx: number;
			expanded: boolean;
			onToggle: () => void;
			title: string;
		};
		function Bubble({ children, colorIdx, expanded, onToggle, title }: BubbleProps) {
			const color = farmLabColors[colorIdx % farmLabColors.length];
			return (
				<div className="mb-4 sm:mb-6 lg:mb-8 w-full">
					<div className={`rounded-2xl shadow-lg bg-gradient-to-r ${color} p-1`}>
						<div className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col overflow-hidden">
							<div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
								<div className="font-bold text-lg sm:text-xl text-gray-900 flex items-center gap-2">
									<FiTarget className="text-xl sm:text-2xl text-green-600" />
									{title}
								</div>
								<div className="text-green-600">
									{expanded ? <FiChevronUp /> : <FiChevronDown />}
								</div>
							</div>
							{expanded && <div className="mt-4">{children}</div>}
						</div>
					</div>
				</div>
			);
		}

		// Render
		if (submitted) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
					{/* Enhanced background with pattern and animation */}
					<div className="absolute inset-0 overflow-hidden">
						<div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
						<div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
					</div>
					<div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-8">
						<div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-gray-100">
							{/* Success icon with FarmLab branding */}
							<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg mb-6 mx-auto">
								<FiCheckCircle className="text-white text-4xl animate-bounce" />
							</div>
							{/* FarmLab branded success message */}
							<div className="flex items-center justify-center mb-4">
								<div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md mr-3">
									<FiTarget className="w-6 h-6 text-white" />
								</div>
								<span className="text-xl font-bold text-gray-900">FarmLab</span>
							</div>
							<h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
								{t("register.success.title")}
							</h2>
							<p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
								{t("register.success.message")}
							</p>
							<div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
								<div className="flex items-center">
									<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
										<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<div>
										<p className="text-green-700 font-medium">You&apos;ve been added to the waiting list!</p>
										<p className="text-green-600 text-sm">Your account has been updated and is ready to go.</p>
									</div>
								</div>
							</div>
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
								<p className="text-sm text-green-800 font-medium">
									🚀 {t("register.success.community")}
								</p>
							</div>
							<Link 
								href="/"
								className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
							>
								<FiTarget className="w-5 h-5 mr-2" />
								{t("register.success.returnHome")}
							</Link>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-x-hidden">
				{/* Enhanced background with pattern and animation - matching landing page */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
					<div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
				</div>
				
				<div className="relative flex items-center justify-center min-h-screen px-4 py-6 lg:py-6 lg:py-8">
					<div className="w-full max-w-2xl mx-auto">
						{/* FarmLab Header - matching landing page branding */}
						<div className="mb-4 sm:mb-6 lg:mb-8 text-center">
							{/* Logo and brand identity */}
							<div className="flex items-center justify-center mb-4 sm:mb-6">
								<div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
									<FiTarget className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
								</div>
								<span className="ml-3 text-xl sm:text-2xl font-bold text-gray-900">FarmLab</span>
							</div>
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 sm:mb-4 tracking-tight">
								{t("register.heading")}
								<span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
									{t("register.headingHighlight")}
								</span>
							</h1>
							<p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
								{t("register.multistep.subtitle")}
							</p>
						</div>
						
						{/* Progress indicators */}
						<div className="mb-4 sm:mb-6 flex items-center justify-center gap-2 overflow-hidden">
							{steps.map((s, idx) => (
								s ? (
									<div 
										key={s.id} 
										className={`transition-all duration-300 flex-shrink-0 ${
											idx === stepIndex 
												? 'w-6 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full scale-110' 
												: idx < stepIndex
													? 'w-3 h-3 bg-green-400 rounded-full'
													: 'w-3 h-3 bg-gray-300 rounded-full'
										}`}
									>
									</div>
								) : null
							))}
						</div>
						
						{/* Error display */}
						{submitError && (
							<div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="flex items-center">
									<div className="flex-shrink-0 w-5 h-5 text-red-500 mr-3">
										<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
										</svg>
									</div>
									<p className="text-red-800 font-medium">{submitError}</p>
								</div>
							</div>
						)}
						
						{/* Current step content */}
						{currentStep && (
							<Bubble
								colorIdx={stepIndex}
								expanded={expanded[stepIndex] ?? true}
								onToggle={handleToggleExpanded}
								title={currentStep.title}
							>
								{currentStep.questions.map((q) => renderQuestion(q))}
							</Bubble>
						)}
						
						{/* Navigation buttons */}
						<div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-4 sm:mt-6">
							<button
								type="button"
								onClick={handleBack}
								disabled={stepIndex === 0}
								className={`order-2 sm:order-1 px-4 sm:px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
									stepIndex === 0 
										? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
										: 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 shadow-sm hover:shadow-md'
								}`}
							>
								<FiArrowLeft className="w-4 h-4" /> {t("form.button.back")}
							</button>
							{stepIndex < steps.length - 2 ? (
								<button
									type="button"
									onClick={handleNext}
									disabled={validationInProgress}
									className={`order-1 sm:order-2 px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto ${
										validationInProgress
											? 'bg-gray-400 text-white cursor-not-allowed'
											: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
									}`}
								>
									{validationInProgress ? t("form.button.validating") : t("form.button.next")} <FiArrowRight className="w-4 h-4" />
								</button>
							) : (
								<button
									type="submit"
									onClick={handleSubmit}
									className="order-1 sm:order-2 px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
								>
									<FiUsers className="w-4 h-4" />
									{t("register.button.joinNow")}
								</button>
							)}
						</div>
						
						{/* Additional info footer */}
						<div className="mt-4 sm:mt-6 text-center">
							<p className="text-sm text-gray-500 px-4">
								{t("register.agreeTerms")}
							</p>
						</div>
					</div>
				</div>
			</div>
		);
		}
