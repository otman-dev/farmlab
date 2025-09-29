"use client";
import React, { useState, useMemo } from "react";
import { FiArrowRight, FiArrowLeft, FiCheckCircle, FiSmile, FiChevronDown, FiChevronUp } from "react-icons/fi";

// Inline the JSON structure (in a real app, import or fetch it)

type FormDataType = Record<string, string | string[] | number | boolean | undefined>;
type ErrorsType = Record<string, string | undefined>;
type ExpandedType = Record<number, boolean>;
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

	// Fun Discord-like color palette for chat bubbles
	const funColors = [
		"from-indigo-200 via-purple-200 to-pink-200",
		"from-green-200 via-teal-200 to-cyan-200",
		"from-yellow-200 via-orange-200 to-pink-200",
		"from-pink-200 via-red-200 to-yellow-200",
		"from-blue-200 via-indigo-200 to-purple-200",
		"from-emerald-200 via-lime-200 to-yellow-200"
	];

	export default function MultiStepRegistration() {
		const [stepIndex, setStepIndex] = useState<number>(0);
		const [formData, setFormData] = useState<FormDataType>({});
		const [errors, setErrors] = useState<ErrorsType>({});
		const [expanded, setExpanded] = useState<ExpandedType>({});
		const [submitted, setSubmitted] = useState<boolean>(false);
		const [validationInProgress, setValidationInProgress] = useState<boolean>(false);

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
		}, [formData, stepIndex]);

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

		function handleChange(id: string, value: string | string[] | number | boolean | undefined) {
			setFormData((prev: FormDataType) => ({ ...prev, [id]: value }));
			setErrors((prev: ErrorsType) => ({ ...prev, [id]: undefined }));
		}
		function handleMultiSelect(id: string, option: string) {
			setFormData((prev: FormDataType) => {
				const arr: string[] = Array.isArray(prev[id]) ? prev[id] : [];
				if (arr.includes(option)) {
					return { ...prev, [id]: arr.filter((o: string) => o !== option) };
				} else {
					return { ...prev, [id]: [...arr, option] };
				}
			});
			setErrors((prev: ErrorsType) => ({ ...prev, [id]: undefined }));
		}
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

		// UI helpers
		// Define a more comprehensive Question type
		type Question = {
			id: string;
			label: string;
			type: string;
			required?: boolean;
			minLength?: number;
			options?: string[];
		};

		function renderQuestion(q: Question) {
			   if (q.type === "text" || q.type === "email" || q.type === "password") {
				   return (
					   <div className="mb-6" key={q.id}>
						   <label className="block font-semibold mb-2 text-gray-800">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
						   <input
							   type={q.type}
						   className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-lg transition-all`}
						   value={formData[q.id] ? String(formData[q.id]) : ""}
							   onChange={e => handleChange(q.id, e.target.value)}
							   placeholder={q.label}
							   minLength={q.minLength || undefined}
						   />
						   {errors[q.id] && <div className="text-red-500 text-sm mt-1">{errors[q.id]}</div>}
					   </div>
				   );
			   }
			if (q.type === "multi-select") {
				return (
					<div className="mb-6" key={q.id}>
						<label className="block font-semibold mb-2 text-gray-800">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
						<div className="flex flex-wrap gap-2">
							{q.options?.map((option: string) => (
								<button
									type="button"
									key={option}
									className={`px-4 py-2 rounded-full border-2 text-base font-medium transition-all flex items-center gap-2
										${Array.isArray(formData[q.id]) && (formData[q.id] as string[]).includes(option)
											? `border-indigo-500 bg-indigo-50 text-indigo-700 scale-105 shadow`
											: `border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50`}
									`}
									onClick={() => handleMultiSelect(q.id, option)}
								>
									{Array.isArray(formData[q.id]) && (formData[q.id] as string[]).includes(option) && <FiCheckCircle className="text-indigo-500" />}
									{option}
								</button>
							))}
						</div>
						{errors[q.id] && <div className="text-red-500 text-sm mt-1">{errors[q.id]}</div>}
					</div>
				);
			}
			if (q.type === "single-select") {
				return (
					<div className="mb-6" key={q.id}>
						<label className="block font-semibold mb-2 text-gray-800">{q.label}{q.required && <span className="text-red-500">*</span>}</label>
						<div className="flex flex-wrap gap-2">
							{q.options?.map((option: string) => (
								<button
									type="button"
									key={option}
									className={`px-4 py-2 rounded-full border-2 text-base font-medium transition-all flex items-center gap-2
										${formData[q.id] === option
											? `border-green-500 bg-green-50 text-green-700 scale-105 shadow`
											: `border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50`}
									`}
									onClick={() => handleChange(q.id, option)}
								>
									{formData[q.id] === option && <FiCheckCircle className="text-green-500" />}
									{option}
								</button>
							))}
						</div>
						{errors[q.id] && <div className="text-red-500 text-sm mt-1">{errors[q.id]}</div>}
					</div>
				);
			}
			return null;
		}

		// Fun Discord-like chat bubble style
		type BubbleProps = {
			children: React.ReactNode;
			colorIdx: number;
			expanded: boolean;
			onToggle: () => void;
			title: string;
		};
		function Bubble({ children, colorIdx, expanded, onToggle, title }: BubbleProps) {
			const color = funColors[colorIdx % funColors.length];
			return (
				<div className={`mb-8 w-full`}>
					<div className={`rounded-2xl shadow-lg bg-gradient-to-r ${color} p-1`}>
						<div className="bg-white rounded-2xl p-6 flex flex-col">
							<div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
								<div className="font-bold text-lg text-gray-900 flex items-center gap-2">
									<FiSmile className="text-2xl text-indigo-400" />
									{title}
								</div>
								<div>{expanded ? <FiChevronUp /> : <FiChevronDown />}</div>
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
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-green-50 to-pink-50">
					<div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
						<FiCheckCircle className="text-green-500 text-5xl mx-auto mb-4 animate-bounce" />
						<h2 className="text-3xl font-bold mb-2">Thank you for joining FarmLab!</h2>
						<p className="text-lg text-gray-700 mb-6">We received your info and will be in touch soon. 🚀</p>
					</div>
				</div>
			);
		}

		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-green-50 to-pink-50 py-8">
				<form className="max-w-2xl w-full mx-4">
					<div className="mb-8 text-center">
						<h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{formJson.form.title}</h1>
						<p className="text-lg text-gray-600">{formJson.form.description}</p>
					</div>
					<div className="mb-6 flex items-center justify-center gap-2">
						{steps.map((s, idx) => (
							s ? <div key={s.id} className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === stepIndex ? 'bg-indigo-500 scale-125' : 'bg-gray-300'}`}></div> : null
						))}
					</div>
					{submitError && (
						<div className="mb-4 text-red-600 text-center font-semibold">{submitError}</div>
					)}
					{currentStep && (
						<Bubble
							colorIdx={stepIndex}
							expanded={expanded[stepIndex] ?? true}
							onToggle={() => setExpanded(e => ({ ...e, [stepIndex]: !(e[stepIndex] ?? true) }))}
							title={currentStep.title}
						>
							{currentStep.questions.map((q) => renderQuestion(q))}
						</Bubble>
					)}
					<div className="flex justify-between mt-4">
						<button
							type="button"
							onClick={handleBack}
							disabled={stepIndex === 0}
							className={`px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${stepIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
						>
							<FiArrowLeft /> Back
						</button>
						{stepIndex < steps.length - 2 ? (
							<button
								type="button"
								onClick={handleNext}
								className="px-6 py-2 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg"
							>
								Next <FiArrowRight />
							</button>
						) : (
							<button
								type="submit"
								onClick={handleSubmit}
								className="px-6 py-2 rounded-xl font-medium flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg"
							>
								Submit <FiCheckCircle />
							</button>
						)}
					</div>
				</form>
			</div>
		);
		}
