"use client";
import React, { useRef, useEffect } from "react";

interface UncontrolledInputProps {
	id: string;
	label: string;
	type: string;
	required?: boolean;
	minLength?: number;
	value: string;
	error?: string;
	showPassword?: boolean;
	onTogglePassword?: () => void;
	onChange: (id: string, value: string) => void;
	// Flag to indicate if this is for an OAuth user
	isOAuthUser?: boolean;
}

// Completely uncontrolled input that never loses focus
export const UncontrolledInput: React.FC<UncontrolledInputProps> = ({
	id,
	label,
	type,
	required,
	minLength,
	value,
	error,
	showPassword,
	onTogglePassword,
	onChange,
	isOAuthUser
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	
	// Set initial value only once
	useEffect(() => {
		if (inputRef.current && inputRef.current.value === '') {
			inputRef.current.value = value;
		}
	}, [value]);
	
	// Handle input changes with onInput (fires immediately)
	const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		// Use requestAnimationFrame to prevent any blocking
		requestAnimationFrame(() => {
			onChange(id, target.value);
		});
	};
	
	return (
		<div className="mb-4 sm:mb-6">
			<label htmlFor={id} className="block font-semibold mb-2 text-gray-900">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
				{id === 'country' && isOAuthUser && <span className="ml-2 text-sm font-normal text-blue-600">(Required for Google sign-in)</span>}
			</label>
			<div className="relative">
				<input
					ref={inputRef}
					id={id}
					name={id}
					type={type === "password" && showPassword ? "text" : type}
					className={`w-full px-4 py-3 sm:py-4 rounded-xl border-2 transition-all text-base sm:text-lg font-medium ${
						error 
							? 'border-red-400 focus:border-red-500 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-400' 
							: id === 'country' && isOAuthUser 
								? 'border-blue-300 focus:border-blue-500 focus:ring-blue-200 bg-blue-50 hover:border-blue-400 text-blue-900 placeholder-blue-400'
								: 'border-gray-300 focus:border-green-500 focus:ring-green-200 bg-white hover:border-gray-400 text-gray-900 placeholder-gray-500'
					} focus:outline-none focus:ring-4 shadow-sm hover:shadow-md focus:shadow-lg`}
					onInput={handleInput}
					placeholder={`Enter your ${label.toLowerCase()}`}
					minLength={minLength}
					autoComplete={type === "email" ? "email" : type === "password" ? "new-password" : "off"}
				/>
				{type === "password" && onTogglePassword && (
					<button
						type="button"
						onClick={onTogglePassword}
						className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
						tabIndex={-1}
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
			{error && (
				<div className="flex items-center mt-2 text-red-600 text-sm font-medium">
					<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					{/* Special handling for country field if it's an OAuth user */}
					{id === 'country' && isOAuthUser ? 
						'Country is required even with Google sign-in' : 
						error}
				</div>
			)}
		</div>
	);
};