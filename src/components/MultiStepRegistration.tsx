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
	form: {
		title: "register.form.title",
		description: "register.form.description",
		steps: [
			{
				id: "basic_info",
				title: "register.form.basicInfo.title",
				questions: [
					{ id: "full_name", label: "register.form.fullName", type: "text", required: true },
					{ id: "email", label: "register.form.email", type: "email", required: true },
					{ id: "password", label: "register.form.password", type: "password", required: true, minLength: 8 },
					{ id: "regions_operate", label: "register.form.regionsOperate", type: "multi-select", options: ["register.form.region.northAfrica", "register.form.region.subSaharanAfrica", "register.form.region.middleEast", "register.form.region.europe", "register.form.region.northAmerica", "register.form.region.latinAmerica", "register.form.region.asiaPacific", "register.form.region.other"], required: false },
					{ id: "organization_type", label: "register.form.organizationType", type: "multi-select", options: ["register.form.organization.smallholder", "register.form.organization.commercial", "register.form.organization.cooperative", "register.form.organization.agribusiness", "register.form.organization.agritech", "register.form.organization.research", "register.form.organization.ngo", "register.form.organization.government", "register.form.organization.investor", "register.form.organization.other"], required: false },
					{ id: "primary_objectives", label: "register.form.primaryObjectives", type: "multi-select", options: ["register.form.objective.increaseYield", "register.form.objective.reduceCosts", "register.form.objective.improveSustainability", "register.form.objective.accessData", "register.form.objective.runPilots", "register.form.objective.findPartners", "register.form.objective.upskillStaff", "register.form.objective.monetizeData"], required: false },
					{ id: "engagement_preference", label: "register.form.engagementPreference", type: "multi-select", options: ["register.form.engagement.news", "register.form.engagement.webinars", "register.form.engagement.pilotPrograms", "register.form.engagement.dataApi", "register.form.engagement.paidProducts", "register.form.engagement.partnerships"], required: false }
				]
			},
			{
				id: "oauth_basic_info",
				title: "register.form.oauthBasicInfo.title",
				questions: [
					{ id: "roles", label: "register.form.roles", type: "multi-select", options: ["register.form.role.farmer", "register.form.role.technologist", "register.form.role.researcher", "register.form.role.industry", "register.form.role.investor", "register.form.role.student", "register.form.role.enthusiast"], required: true },
					{ id: "regions_operate", label: "register.form.regionsOperateSingle", type: "multi-select", options: ["register.form.region.northAfrica", "register.form.region.subSaharanAfrica", "register.form.region.middleEast", "register.form.region.europe", "register.form.region.northAmerica", "register.form.region.latinAmerica", "register.form.region.asiaPacific", "register.form.region.other"], required: true },
					{ id: "participation_mode", label: "register.form.participationMode", type: "multi-select", options: ["register.form.participation.community", "register.form.participation.data", "register.form.participation.beta", "register.form.participation.commercial", "register.form.participation.research", "register.form.participation.mentor"], required: false }
				]
			},
			{
				id: "user_type",
				title: "register.form.userType.title",
				description: "register.form.userType.description",
				questions: [
					{
						id: "roles",
						label: "register.form.roles",
						type: "multi-select",
						options: [
							"register.form.role.farmer",
							"register.form.role.technologist",
							"register.form.role.researcher",
							"register.form.role.industry",
							"register.form.role.investor",
							"register.form.role.student",
							"register.form.role.enthusiast"
						],
						required: true
					}
				],
				branch_logic: {
					"Farmer / Grower": "branch_farmer",
					"Technologist / Developer / Engineer": "branch_technologist",
					"Farmer / Grower + Technologist / Developer / Engineer": "branch_hybrid",
					"Industry Professional (Agri-related, food, energy, logistics, etc.)": "branch_industry"
				}
			}
		]
	},
			branches: {
				branch_researcher: {
					title: "register.form.branch.researcher.title",
					questions: [
						{ id: "research_areas", label: "register.form.branch.researcher.researchAreas", type: "multi-select", options: ["register.form.branch.researcher.agronomy", "register.form.branch.researcher.soilScience", "register.form.branch.researcher.plantPathology", "register.form.branch.researcher.cropPhysiology", "register.form.branch.researcher.agtech", "register.form.branch.researcher.dataScience", "register.form.branch.researcher.economics", "register.form.branch.researcher.sustainability", "register.form.branch.researcher.other"], required: true },
						{ id: "collab_interest", label: "register.form.branch.researcher.collabInterest", type: "multi-select", options: ["register.form.branch.researcher.dataAccess", "register.form.branch.researcher.fieldTrials", "register.form.branch.researcher.jointPublications", "register.form.branch.researcher.studentProjects", "register.form.branch.researcher.other"] }
					]
				},
				branch_investor: {
					title: "register.form.branch.investor.title",
					questions: [
						{ id: "investment_focus", label: "register.form.branch.investor.investmentFocus", type: "single-select", options: ["register.form.branch.investor.agritech", "register.form.branch.investor.iot", "register.form.branch.investor.saas", "register.form.branch.investor.sustainability", "register.form.branch.investor.other"] },
						{ id: "ticket_size", label: "register.form.branch.investor.ticketSize", type: "single-select", options: ["register.form.branch.investor.lt50k", "register.form.branch.investor.50k_250k", "register.form.branch.investor.250k_1m", "register.form.branch.investor.1mplus", "register.form.branch.investor.notSure"] }
					]
				},
				branch_student: {
					title: "register.form.branch.student.title",
					questions: [
						{ id: "study_level", label: "register.form.branch.student.studyLevel", type: "single-select", options: ["register.form.branch.student.highSchool", "register.form.branch.student.undergraduate", "register.form.branch.student.graduate", "register.form.branch.student.educator", "register.form.branch.student.other"] },
						{ id: "interest_area", label: "register.form.branch.student.interestArea", type: "multi-select", options: ["register.form.branch.student.internships", "register.form.branch.student.researchProjects", "register.form.branch.student.learningResources", "register.form.branch.student.hackathons", "register.form.branch.student.other"] }
					]
				},
				branch_enthusiast: {
					title: "register.form.branch.enthusiast.title",
					questions: [
						{ id: "interest_reason", label: "register.form.branch.enthusiast.interestReason", type: "single-select", options: ["register.form.branch.enthusiast.curiosity", "register.form.branch.enthusiast.followTopicsOption", "register.form.branch.enthusiast.professionalInterest", "register.form.branch.enthusiast.studentResearch", "register.form.branch.enthusiast.collaborator", "register.form.branch.enthusiast.other"] },
						{ id: "follow_topics", label: "register.form.branch.enthusiast.followTopics", type: "multi-select", options: ["register.form.branch.enthusiast.smartFarming", "register.form.branch.enthusiast.iot", "register.form.branch.enthusiast.sustainability", "register.form.branch.enthusiast.marketTrends", "register.form.branch.enthusiast.all"] }
					]
				},
				branch_farmer: {
					title: "register.form.branch.farmer.title",
					questions: [
						{ id: "farm_size", label: "register.form.branch.farmer.farmSize", type: "single-select", options: ["register.form.branch.farmer.lt1ha", "register.form.branch.farmer.1_5ha", "register.form.branch.farmer.5_20ha", "register.form.branch.farmer.20plusHa"] },
						{ id: "production_type", label: "register.form.branch.farmer.productionType", type: "multi-select", options: ["register.form.branch.farmer.vegetables", "register.form.branch.farmer.grains", "register.form.branch.farmer.fruits", "register.form.branch.farmer.livestock", "register.form.branch.farmer.greenhouse", "register.form.branch.farmer.hydroponics", "register.form.branch.farmer.mixed"] },
						{ id: "current_tech_usage", label: "register.form.branch.farmer.currentTechUsage", type: "multi-select", options: ["register.form.branch.farmer.manual", "register.form.branch.farmer.irrigation", "register.form.branch.farmer.basicSensors", "register.form.branch.farmer.managementApps", "register.form.branch.farmer.iotSystems", "register.form.branch.farmer.drones", "register.form.branch.farmer.renewable"] },
						{ id: "challenges", label: "register.form.branch.farmer.challenges", type: "multi-select", options: ["register.form.branch.farmer.waterUsage", "register.form.branch.farmer.pestDetection", "register.form.branch.farmer.laborShortages", "register.form.branch.farmer.climate", "register.form.branch.farmer.lowYield", "register.form.branch.farmer.feedCost", "register.form.branch.farmer.lackSupport", "register.form.branch.farmer.sustainability"] },
						{ id: "priorities", label: "register.form.branch.farmer.priorities", type: "multi-select", options: ["register.form.branch.farmer.automate", "register.form.branch.farmer.reduceCosts", "register.form.branch.farmer.increaseYield", "register.form.branch.farmer.sustainable", "register.form.branch.farmer.smartFarming", "register.form.branch.farmer.collaborate"] }
					]
				},
				branch_technologist: {
					title: "register.form.branch.technologist.title",
					questions: [
						{ id: "expertise_area", label: "register.form.branch.technologist.expertiseArea", type: "single-select", options: ["register.form.branch.technologist.iot", "register.form.branch.technologist.backend", "register.form.branch.technologist.dataScience", "register.form.branch.technologist.automation", "register.form.branch.technologist.hardware", "register.form.branch.technologist.cloud", "register.form.branch.technologist.fullStack", "register.form.branch.technologist.other"] },
						{ id: "collaboration_interest", label: "register.form.branch.technologist.collaborationInterest", type: "multi-select", options: ["register.form.branch.technologist.buildIoT", "register.form.branch.technologist.developAPIs", "register.form.branch.technologist.sensorData", "register.form.branch.technologist.openSource", "register.form.branch.technologist.pilotTest", "register.form.branch.technologist.research"] },
						{ id: "data_interest", label: "register.form.branch.technologist.dataInterest", type: "multi-select", options: ["register.form.branch.technologist.sensorTelemetry", "register.form.branch.technologist.plantGrowth", "register.form.branch.technologist.livestockData", "register.form.branch.technologist.automationLogs", "register.form.branch.technologist.marketTrends", "register.form.branch.technologist.other"] }
					]
				},
				branch_hybrid: {
					title: "register.form.branch.hybrid.title",
					questions: [
						{ id: "hybrid_focus", label: "register.form.branch.hybrid.hybridFocus", type: "single-select", options: ["register.form.branch.hybrid.applySkills", "register.form.branch.hybrid.buildForOthers", "register.form.branch.hybrid.both"] },
						{ id: "pilot_interest", label: "register.form.branch.hybrid.pilotInterest", type: "single-select", options: ["register.form.branch.hybrid.yes", "register.form.branch.hybrid.maybe", "register.form.branch.hybrid.notNow"] }
					]
				},
				branch_industry: {
					title: "register.form.branch.industry.title",
					questions: [
						{ id: "sector", label: "register.form.branch.industry.sector", type: "single-select", options: ["register.form.branch.industry.agriInputs", "register.form.branch.industry.logistics", "register.form.branch.industry.foodProcessing", "register.form.branch.industry.renewable", "register.form.branch.industry.agritech", "register.form.branch.industry.government", "register.form.branch.industry.investment", "register.form.branch.industry.other"] },
						{ id: "industry_interest", label: "register.form.branch.industry.industryInterest", type: "multi-select", options: ["register.form.branch.industry.commercial", "register.form.branch.industry.integration", "register.form.branch.industry.research", "register.form.branch.industry.marketIntelligence", "register.form.branch.industry.pilot", "register.form.branch.industry.sponsorship"] }
					]
				}
			},
			final_section: {
				title: "register.form.finalSection.title",
				questions: [
					{ id: "participation_mode", label: "register.form.finalSection.participationMode", type: "multi-select", options: ["register.form.finalSection.community", "register.form.finalSection.analytics", "register.form.finalSection.beta", "register.form.finalSection.commercial", "register.form.finalSection.research", "register.form.finalSection.sponsor"] },
					{ id: "preferred_pricing", label: "register.form.finalSection.preferredPricing", type: "multi-select", options: ["register.form.finalSection.monthly", "register.form.finalSection.oneTime", "register.form.finalSection.payAsYouGrow", "register.form.finalSection.revenueShare", "register.form.finalSection.grants", "register.form.finalSection.notSure"] },
					{ id: "contact_pref", label: "register.form.finalSection.contactPref", type: "multi-select", options: ["register.form.finalSection.email", "register.form.finalSection.whatsapp", "register.form.finalSection.sms", "register.form.finalSection.phone", "register.form.finalSection.slack", "register.form.finalSection.noContact"] }
				]
			}
};


// Role to branch mapping (no hybrid)
const branchLogic: { [key: string]: string } = {
	"register.form.role.farmer": "branch_farmer",
	"register.form.role.technologist": "branch_technologist",
	"register.form.role.industry": "branch_industry",
	"register.form.role.researcher": "branch_researcher",
	"register.form.role.investor": "branch_investor",
	"register.form.role.student": "branch_student",
	"register.form.role.enthusiast": "branch_enthusiast"
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
	const createInitialFormData = (): FormDataType => {
		if (googleOAuthData && googleOAuthData.email) {
			console.log('MultiStepRegistration: Using googleOAuthData to pre-fill form', {
				name: googleOAuthData.name,
				email: googleOAuthData.email
			});
			return {
				full_name: googleOAuthData.name || '',
				email: googleOAuthData.email || '',
				googleAuthenticated: googleOAuthData.googleAuthenticated || false,
				roles: [],
				regions_operate: []
			};
		}

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
				roles: [],
				regions_operate: []
			};
		}

		// Default to empty form data (selection arrays initialized lazily)
		console.log('MultiStepRegistration: No OAuth data found, using empty form');
		return { roles: [], regions_operate: [] } as FormDataType;
	};

	const [formData, setFormData] = useState<FormDataType>(createInitialFormData());
		
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
			].map(step => step ? {
				...step,
				title: t(step.title),
				questions: step.questions.map(q => ({
					...q,
					label: t(q.label)
				}))
			} : null);
			
			return {
				steps: calculatedSteps,
				currentStep: calculatedSteps[stepIndex] ?? null
			};
		}, [formData["roles"], stepIndex, t]); // eslint-disable-line react-hooks/exhaustive-deps

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
					   
					   // No special-case country validation; all required multi-selects handled below
					   
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
			setFormData((prev: FormDataType) => {
				// Only update state if the value has actually changed
				if (prev[id] !== value) {
					return { ...prev, [id]: value };
				}
				return prev;
			});
			setErrors((prev: ErrorsType) => {
				// Clear error only if it exists
				if (prev[id]) {
					return { ...prev, [id]: undefined };
				}
				return prev;
			});
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
						'roles': 'Roles',
						'regions_operate': 'Region'
				}
				: {
					'full_name': 'Full Name',
					'email': 'Email',
					'password': 'Password',
						'regions_operate': 'Region',
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
					// Build outgoing payload and map selection values into expected API fields
					const outgoing: Record<string, any> = { ...formData };
					// If backend expects a 'country' property, derive it from regions_operate (use the first selected region)
					if (!outgoing.country && Array.isArray(outgoing.regions_operate) && outgoing.regions_operate.length > 0) {
						outgoing.country = String(outgoing.regions_operate[0]);
					}
					console.log('Submitting form data (outgoing):', {
						...outgoing,
						password: '[REDACTED]',
						rolesCount: Array.isArray(outgoing.roles) ? outgoing.roles.length : 0
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
							...outgoing,
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
										<span className="flex-1 font-medium">{t(option)}</span>
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
										<span className="flex-1 font-medium">{t(option)}</span>
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
