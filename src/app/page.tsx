import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-lg w-full mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border-2 border-green-200 px-6 py-10 flex flex-col items-center gap-6 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-green-700 mb-2 text-center">FarmLab Coming Soon</h1>
        <p className="text-lg text-gray-700 text-center mb-4">Be the first to experience the future of smart agriculture. Join our waitlist for early access and updates!</p>
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3 bg-gradient-to-r from-green-400 via-green-600 to-lime-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:from-green-500 hover:to-lime-500 transition-all duration-200 animate-fade-in ring-2 ring-green-300/40 ring-inset"
          style={{ boxShadow: '0 0 16px 2px #a3e63555, 0 2px 8px 0 #0001' }}
        >
          Join the Waitlist
        </Link>
      </div>
    </div>
  );
}
