import Link from "next/link";
import { FiArrowRight, FiUsers, FiTrendingUp, FiTarget, FiZap, FiHeart, FiBookOpen, FiCode, FiSearch } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-8">
              <FiTarget className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                FarmLab
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              We&apos;re pioneering the future of smart agriculture by digitalizing our own working farm.
              Join us on this transparent journey from one greenhouse to a connected agricultural network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/comingsoon"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiZap className="w-5 h-5 mr-2" />
                Explore FarmLab
                <FiArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-all duration-200"
              >
                <FiUsers className="w-5 h-5 mr-2" />
                Join Our Community
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What is FarmLab */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is FarmLab?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              FarmLab is more than just a platform—it&apos;s a real-world agricultural innovation initiative.
              We&apos;re digitalizing our own operational farm to pioneer smart agriculture solutions.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-6">
                <FiTarget className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-World Testing</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is developed and tested on our actual working farm, ensuring practical,
                reliable solutions that work in real agricultural environments.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Transparent Journey</h3>
              <p className="text-gray-600 leading-relaxed">
                Follow our complete transformation from traditional farming to a fully automated,
                data-driven agricultural operation. Every step is documented and shared.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-6">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a community of farmers, technologists, and innovators working together
                to shape the future of sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Who Should Join */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Should Join FarmLab?</h2>
            <p className="text-lg text-gray-600">FarmLab welcomes everyone interested in the future of agriculture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg mb-6">
                <FiTarget className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Farmers & Growers</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Modernize your operations with IoT sensors, automated controls, and data-driven insights
                that increase yields and reduce costs.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time monitoring</li>
                <li>• Automated irrigation</li>
                <li>• Yield optimization</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg mb-6">
                <FiCode className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Innovators</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Work with cutting-edge IoT, AI, and automation technologies in real agricultural
                applications and environments.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• IoT integration</li>
                <li>• API development</li>
                <li>• Data analytics</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg mb-6">
                <FiSearch className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Researchers & Academics</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Access real agricultural data and participate in research initiatives that advance
                sustainable farming practices.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Research partnerships</li>
                <li>• Data access</li>
                <li>• Field studies</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg mb-6">
                <FiBookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Students & Educators</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Learn about modern agriculture through hands-on examples and educational resources
                that bridge farming and technology.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Educational content</li>
                <li>• Case studies</li>
                <li>• Learning resources</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl shadow-lg mb-6">
                <FiHeart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Enthusiasts & Curious Minds</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Follow our journey and learn how technology is transforming traditional agriculture
                into a sustainable, efficient industry.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Behind-the-scenes access</li>
                <li>• Educational insights</li>
                <li>• Community discussions</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg mb-6">
                <FiUsers className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Industry Partners</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Collaborate with us to integrate your agricultural technologies, research partnerships,
                or business opportunities.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Partnership opportunities</li>
                <li>• Integration support</li>
                <li>• Business development</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Our Journey */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey So Far</h2>
            <p className="text-lg text-gray-600">From concept to real-world implementation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2023</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Founded</div>
              <div className="text-gray-600">FarmLab was established with a vision to revolutionize agriculture through technology.</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2024</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">First Deployment</div>
              <div className="text-gray-600">Successfully deployed our IoT system on our pilot farm with real-time monitoring.</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">2025</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">Platform Launch</div>
              <div className="text-gray-600">Full platform release with comprehensive farm management features and community access.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join the Agricultural Revolution?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Be part of the movement that&apos;s bringing modern technology to traditional farming.
            Join our community and help shape the future of sustainable agriculture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/comingsoon"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              <FiZap className="w-5 h-5 mr-2" />
              Learn More About FarmLab
            </Link>
            <Link
              href="/comingsoon"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-green-600 transition-all duration-200"
            >
              <FiUsers className="w-5 h-5 mr-2" />
              Join the Waitlist
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-green-600 transition-all duration-200 opacity-80 hover:opacity-100"
              style={{ minWidth: 'fit-content' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3m0 0l4-4m-4 4l4 4m13-8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6"></path></svg>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
