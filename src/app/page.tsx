import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-100">
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-0 md:gap-8 p-0 md:p-8 animate-fade-in">
        {/* Left: SVG Illustration & Logo */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-green-100 to-lime-200 rounded-l-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col items-center justify-center w-full h-full p-8">
            {/* FarmLab Logo - Distinctive, geometric, eco-tech */}
            <div className="mb-8">
              <svg width="260" height="64" viewBox="0 0 260 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Icon: flask with leaf, circuit nodes */}
                <g>
                  {/* Flask body */}
                  <rect x="12" y="20" width="32" height="32" rx="16" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2.5" />
                  {/* Flask neck */}
                  <rect x="22" y="8" width="12" height="20" rx="6" fill="#bbf7d0" stroke="#22c55e" strokeWidth="2" />
                  {/* Leaf */}
                  <path d="M28 36c6-6 14-10 14-18-8 0-14 6-16 12 1 4 2 6 2 6z" fill="#a3e635" stroke="#22c55e" strokeWidth="1.5" />
                  {/* Circuit nodes */}
                  <circle cx="20" cy="52" r="2.5" fill="#65a30d" />
                  <circle cx="36" cy="52" r="2.5" fill="#65a30d" />
                  <circle cx="28" cy="60" r="2.5" fill="#22c55e" />
                  <path d="M28 52v6" stroke="#22c55e" strokeWidth="1.5" />
                  <path d="M20 52h16" stroke="#22c55e" strokeWidth="1.5" />
                </g>
                {/* Brand name - improved alignment and spacing */}
                <text x="60" y="48" fontFamily="'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif" fontWeight="800" fontSize="36" fill="#166534" letterSpacing="3">
                  Farm
                </text>
                <text x="155" y="48" fontFamily="'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif" fontWeight="800" fontSize="36" fill="#65a30d" letterSpacing="3">
                  Lab
                </text>
              </svg>
            </div>
            {/* Modern SVG Illustration */}
            <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="160" cy="260" rx="120" ry="30" fill="#bbf7d0" />
              <rect x="80" y="180" width="160" height="60" rx="20" fill="#f0fdf4" stroke="#22c55e" strokeWidth="3" />
              <rect x="120" y="120" width="80" height="80" rx="16" fill="#a3e635" stroke="#22c55e" strokeWidth="3" />
              <rect x="140" y="80" width="40" height="40" rx="12" fill="#22c55e" stroke="#166534" strokeWidth="2" />
              <circle cx="160" cy="100" r="8" fill="#fef9c3" stroke="#a3e635" strokeWidth="2" />
              <path d="M160 180v-40" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
              <path d="M160 120l-20 20" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
              <path d="M160 120l20 20" stroke="#166534" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="160" cy="200" rx="32" ry="8" fill="#bbf7d0" />
              <rect x="90" y="200" width="20" height="30" rx="6" fill="#fef9c3" stroke="#a3e635" strokeWidth="2" />
              <rect x="210" y="200" width="20" height="30" rx="6" fill="#fef9c3" stroke="#a3e635" strokeWidth="2" />
              <rect x="110" y="220" width="100" height="10" rx="5" fill="#bbf7d0" />
              <circle cx="160" cy="260" r="6" fill="#22c55e" />
            </svg>
          </div>
        </div>
        {/* Right: Text and CTA */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start bg-white/90 backdrop-blur-lg rounded-3xl md:rounded-l-none md:rounded-r-3xl shadow-2xl border-2 border-green-200 px-6 py-12 md:py-16 gap-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-800 text-center md:text-left leading-tight drop-shadow-lg">
            Experience the Digital Farm Revolution
          </h1>
          <h2 className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium text-center md:text-left max-w-xl">
            FarmLab is a real-world initiative: we’re digitalizing our own farm, pioneering smart agriculture, and sharing every step as we scale from one field to a network of greenhouses.
          </h2>
          <ul className="text-base sm:text-lg text-gray-600 mb-2 list-disc list-inside text-left max-w-md mx-auto md:mx-0 space-y-1">
            <li>🔎 Transparent, hands-on digital transformation</li>
            <li>� Real data, real automation, real impact</li>
            <li>🌍 From one farm to a connected community</li>
            <li>🤝 Join, learn, and shape the future with us</li>
          </ul>
          <p className="text-base sm:text-lg text-gray-700 text-center md:text-left mb-2 max-w-lg">
            Be part of a movement that’s redefining agriculture for the digital age. Get exclusive updates, behind-the-scenes insights, and early access to our platform.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 via-green-500 to-lime-400 text-white font-extrabold text-lg rounded-2xl shadow-xl hover:scale-105 hover:from-green-700 hover:to-lime-500 transition-all duration-200 animate-fade-in ring-2 ring-green-300/40 ring-inset tracking-wide"
            style={{ boxShadow: '0 0 24px 2px #a3e63555, 0 2px 12px 0 #0001' }}
          >
            Join the Waitlist & Follow the Journey
          </Link>
        </div>
      </div>
    </div>
  );
}
