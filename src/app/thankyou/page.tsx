import { FiCheckCircle } from "react-icons/fi";

export default function ThankYouWaitlist() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-green-50 to-green-200 px-4 py-8">
      <div className="flex flex-col items-center bg-white/90 rounded-2xl shadow-xl px-8 py-12 max-w-lg w-full border border-green-100">
        <FiCheckCircle className="text-6xl text-green-500 mb-4 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-green-700 mb-2 text-center">Thank You for Joining the Waitlist!</h1>
        <p className="text-gray-700 text-lg mb-4 text-center">
          You’ve successfully joined the FarmLab waitlist.<br />
          We’re excited to have you on board as we build the future of smart farming.
        </p>
        <p className="text-gray-600 text-base text-center mb-6">
          Stay tuned for updates and early access. In the meantime, follow us on social media and check your email for news!
        </p>
        <a
          href="/comingsoon"
          className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg shadow hover:scale-105 hover:from-green-600 hover:to-green-800 transition-all duration-150"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
