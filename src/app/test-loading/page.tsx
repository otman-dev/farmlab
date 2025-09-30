import Link from "next/link";

// Test page to see the loading screen
export default async function TestLoadingPage() {
  // Add a small delay to ensure loading screen shows
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Screen Test</h1>
        <p className="text-gray-600">If you saw the new loading screen before this page loaded, it&apos;s working!</p>
        <div className="mt-6">
          <Link href="/" className="text-green-600 hover:text-green-700 underline">
            Go back to home
          </Link>
        </div>
      </div>
    </div>
  );
}