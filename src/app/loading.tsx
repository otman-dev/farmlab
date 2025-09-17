export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-50 to-green-200">
      <div className="flex flex-col items-center">
        <svg className="animate-spin h-12 w-12 text-green-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Loading FarmLab...</h2>
        <p className="text-green-600 text-base">Please wait while we prepare your experience.</p>
      </div>
    </div>
  );
}
