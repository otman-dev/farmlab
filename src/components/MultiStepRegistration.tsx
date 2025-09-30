"use client";
import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiTarget, FiChevronDown, FiChevronUp, FiUsers } from "react-icons/fi";
import { UncontrolledInput } from "./UncontrolledInput";

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

	export default function MultiStepRegistration() {
		const [stepIndex, setStepIndex] = useState<number>(0);
		const [formData, setFormData] = useState<FormDataType>({});
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
			// Build the steps array dynamically by joining all selected role branches
			const baseSteps = formJson.form.steps;
			const selectedRoles: string[] = Array.isArray(formData["roles"]) ? formData["roles"] : [];
			const branches: Record<string, { title: string; questions: Question[] }> = formJson.branches;
			// Get all matching branch keys in the order of selection
			const selectedBranchKeys = selectedRoles.map(role => branchLogic[role]).filter(Boolean);
			
			// Build steps: base, all selected branches, final
			const calculatedSteps = [
				...baseSteps,
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
			const requiredFields = {
				'full_name': 'Full Name',
				'email': 'Email',
				'password': 'Password'
			};
			
			const missingFields = Object.entries(requiredFields).filter(
				([key]) => !formData[key]
			).map(([/* key */, label]) => label);
			
			if (missingFields.length > 0) {
				setSubmitError(`Missing required fields: ${missingFields.join(', ')}`);
				return;
			}
			
			if (validateStep()) {
				try {
					console.log('Submitting form data:', { ...formData, password: '[REDACTED]' });
					const res = await fetch('/api/auth/register', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(formData),
					});
					
					const data = await res.json();
					
					if (!res.ok) {
						console.error('Registration failed:', data);
						if (data.details && Array.isArray(data.details)) {
							setSubmitError(`Registration failed: ${data.details.join(', ')}`);
						} else {
							setSubmitError(data.error || data.message || 'Registration failed.');
						}
						return;
					}
					
					console.log('Registration successful:', data);
					setSubmitted(true);
				} catch (err: unknown) {
					console.error('Registration error:', err);
					setSubmitError(err instanceof Error ? err.message : 'Registration failed.');
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
								Welcome to the Future of Agriculture!
							</h2>
							<p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
								Thank you for joining our community. We&apos;ve received your information and will be in touch soon with updates about our platform launch.
							</p>
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
								<p className="text-sm text-green-800 font-medium">
									🚀 You&apos;re now part of our exclusive community of agricultural innovators
								</p>
							</div>
							<Link 
								href="/"
								className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
							>
								<FiTarget className="w-5 h-5 mr-2" />
								Return to Home
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
								Join the Agricultural
								<span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 animate-gradient-x">
									Revolution
								</span>
							</h1>
							<p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
								Help us build the future of smart farming. Your insights will shape our platform.
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
								<FiArrowLeft className="w-4 h-4" /> Back
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
									{validationInProgress ? 'Validating...' : 'Next'} <FiArrowRight className="w-4 h-4" />
								</button>
							) : (
								<button
									type="submit"
									onClick={handleSubmit}
									className="order-1 sm:order-2 px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
								>
									<FiUsers className="w-4 h-4" />
									Join FarmLab
								</button>
							)}
						</div>
						
						{/* Additional info footer */}
						<div className="mt-4 sm:mt-6 text-center">
							<p className="text-sm text-gray-500 px-4">
								By joining, you agree to be part of our agricultural innovation community
							</p>
						</div>
					</div>
				</div>
			</div>
		);
		}
