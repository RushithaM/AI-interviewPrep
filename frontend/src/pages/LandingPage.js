import React, { useState } from 'react';
import './index.css';
import homebg from './background/homebg.jpg';
import test from './background/test.jpg';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronDown, Menu } from 'lucide-react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';

// Import other images for the slider
import featureImage2 from './background/image2.jpg';
import featureImage3 from './background/image3.jpg';
import mobileImage1 from './background/mobileFeature1.jpg';
import mobileImage2 from './background/mobileFeature2.jpg';
import mobileImage3 from './background/mobileFeature3.jpg';

function LandingPage() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  const { isSignedIn } = useAuth();
  const history = useHistory();
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      history.push('/dashboard');
    }
  }, [isSignedIn, history]);

  // FAQ data
  const faqs = [
    { question: "How much does it cost to use the platform?", answer: "Our pricing varies based on the plan you choose. Please refer to our Plans section for detailed information." },
    { question: "Can I use the platform for multiple job applications?", answer: "Yes, you can use our platform for multiple job applications. Our service is designed to help you prepare for various positions." },
    { question: "How long does it take to receive the resume modifications and questions?", answer: "Typically, you'll receive your tailored resume modifications and interview questions within 24-48 hours of submission." },
    { question: "What kind of interview questions can I expect?", answer: "You can expect a mix of role-specific, behavioral, and situational questions tailored to the job description and your resume." },
    { question: "Is my data secure?", answer: "Yes, we take data security very seriously. All your information is encrypted and stored securely. We never share your data with third parties." },
    { question: "Can I cancel my service or get a refund?", answer: "Yes, you can cancel your subscription at any time. Refund policies vary depending on your plan. Please contact our support team for specific details." },
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-[#687494] text-white fixed w-full top-0 z-10 px-1 font-bold">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              <Menu className="h-8 w-8" />
            </button>
          </div>

          {/* Left side: Navigation Links (Desktop) */}
          <div className="hidden md:flex space-x-8 px-10">
            <a href="#home" className="hover:text-gray-300 uppercase ">Home</a>
            <a href="#about" className="hover:text-gray-300 uppercase">About</a>
            <a href="#features" className="hover:text-gray-300">FEATURES</a>
            <a href="#plans" className="hover:text-gray-300 uppercase">Plans</a>
            <a href="#faqs" className="hover:text-gray-300 uppercase">FAQs</a>
          </div>

          {/* Right side: Sign In/Sign Up Buttons (Always visible and aligned to the right) */}
          <div className="flex space-x-6 px-1 ml-auto justify-end">
            <SignInButton mode="modal">
              <button className="bg-transparent hover:bg-gray-600 text-white font-bold py-2 px-4 border border-white rounded">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-transparent hover:bg-gray-600 text-white font-bold py-2 px-4 border border-white rounded">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </div>

        {/* Mobile Menu (Shown when Hamburger is clicked) */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#1a202c] text-white px-2 py-4 space-y-2">
            <a href="#home" className="block py-2 hover:bg-gray-700">Home</a>
            <a href="#about" className="block py-2 hover:bg-gray-700">About</a>
            <a href="#features" className="block py-2 hover:bg-gray-700">Features</a>
            <a href="#plans" className="block py-2 hover:bg-gray-700">Plans</a>
            <a href="#faqs" className="block py-2 hover:bg-gray-700">FAQs</a>
          </div>
        )}
      </nav>

      {/* Home Section */}
      <section
        id="home"
        className="h-screen flex justify-center items-center bg-cover bg-center px-4"
        style={{ backgroundImage: `url(${homebg})` }}
      >
        {/* Card */}
        <div className="bg-gradient-to-r from-[#363d4f] to-[#7a8db5] text-white p-4 sm:px-10 sm:py-16 rounded-3xl shadow-lg w-full max-w-md h-[80vh] sm:max-w-none sm:w-5/6 lg:w-2/3 sm:h-auto flex items-center sm:justify-end sm:items-start mx-2">
          <div className="text-right">
            <h1 className="text-5xl sm:text-6xl font-bold mb-2">Unlock Your Dream Job</h1>
            <h2 className="text-5xl sm:text-6xl font-bold mb-4">with AI-Powered Interview Prep</h2>
            <p className="text-lg sm:text-xl mb-6 pb-5">Tailored Questions for Success</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-200">
                Get Started For Free!
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex flex-col justify-center items-center bg-[#011a2e] py-20">
        <div className="container mx-auto flex flex-col lg:flex-row p-10 space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="flex-1 text-left mb-8 text-white px-4 lg:px-0">
            <h2 className="text-5xl lg:text-7xl font-bold mb-4">About Our</h2>
            <h2 className="text-5xl lg:text-7xl font-bold mb-4">Website</h2>
            <p className="text-lg">
              Our AI-powered platform revolutionizes interview preparation,
              offering tailored questions and insights to help you succeed
              in landing your dream job. We analyze your resume and the job
              description to provide the most relevant and impactful
              interview practice experience.
            </p>
          </div>
          <div className="flex flex-col space-y-4 flex-1 px-4 lg:px-0">
            <div className="bg-white text-blue p-5 rounded-3xl shadow-lg">
              <center>
                <h3 className="sm:text-xl font-bold">Resume Based Interview Questions</h3>
              </center>
            </div>
            <div className="bg-white text-blue p-5 rounded-3xl shadow-lg">
              <center>
                <h3 className="sm:text-xl font-bold">Role Based Interview Questions</h3>
              </center>
            </div>
            <div className="bg-white text-blue p-5 rounded-3xl shadow-lg">
              <center>
                <h3 className="sm:text-xl font-bold">Company Specific Interview Questions</h3>
              </center>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="min-h-screen flex justify-center items-center bg-[#011a2e] py-20">
        <div className="container mx-auto px-4 sm:px-2 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Slider {...sliderSettings} className="feature-slider">
              {/* Slide 1 */}
              <div className="px-2">
                <div
                  className="h-[60vh] flex flex-col justify-between bg-cover bg-center relative rounded-3xl overflow-hidden"
                  style={{ backgroundImage: `url(${isMobile ? mobileImage1 : test})` }}
                >
                  <h3 className="text-2xl sm:text-4xl font-bold text-blue m-8">Resume Based Questions</h3>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full absolute bottom-8 right-8 hover:bg-blue-700">
                      Try it now!
                    </button>
                  </SignInButton>
                </div>
              </div>
              {/* Slide 2 */}
              <div className="px-2">
                <div
                  className="h-[60vh] flex flex-col justify-between bg-cover bg-center relative rounded-3xl overflow-hidden"
                  style={{ backgroundImage: `url(${isMobile ? mobileImage2 : featureImage2})` }}
                >
                  <h3 className="text-2xl sm:text-4xl font-bold text-blue m-8">Role Based Questions</h3>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full absolute bottom-8 right-8 hover:bg-blue-700">
                      Try it now!
                    </button>
                  </SignInButton>
                </div>
              </div>
              {/* Slide 3 */}
              <div className="px-2">
                <div
                  className="h-[60vh] flex flex-col justify-between bg-cover bg-center relative rounded-3xl overflow-hidden"
                  style={{ backgroundImage: `url(${isMobile ? mobileImage3 : featureImage3})` }}
                >
                  <h3 className="text-2xl sm:text-4xl font-bold text-blue m-8">Company Specific Questions</h3>
                  <SignInButton mode="modal">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-full absolute bottom-8 right-8 hover:bg-blue-700">
                      Try it now!
                    </button>
                  </SignInButton>
                </div>
              </div>
            </Slider>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="min-h-screen flex flex-col justify-center items-center bg-[#011a2e] py-16">
        {/* Heading for Plans */}
        <h2 className="text-5xl text-white text-center font-semibold mb-10">Our Plans</h2>

        <div className="flex flex-col md:flex-row justify-center space-x-6 space-y-6 md:space-y-0 overflow-hidden relative w-full">
          {/* For mobile view, add swiper functionality */}
          <div className="flex md:hidden w-full snap-x overflow-x-auto scrollbar-hide">
            {/* Basic Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 snap-center mx-4 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2 p-5px">Basic Plan</h2>
                <p className="text-7xl mb-2 font-bold p-5px mt-8">$19</p>
              </center>
              <p className="mb-4 mt-8">• Resume modification based on job description<br />
                • Job description-based interview questions</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full ">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>

            {/* Standard Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 snap-center mx-4 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2 p-5px">Standard Plan</h2>
                <p className="text-7xl mb-2 font-bold p-5px mt-8">$39</p>
              </center>
              <p className="mb-4 mt-8">• All Basic Plan features<br />
                • Personalized interview strategies<br />
                • 24/7 AI chat support</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full ">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 snap-center mx-4 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2 p-5px">Premium Plan</h2>
                <p className="text-7xl mb-2 font-bold p-5px mt-8">$59</p>
              </center>
              <p className="mb-4 mt-8">• All Standard Plan features<br />
                • Mock interviews with AI<br />
                • Performance analysis and feedback</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full ">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>
          </div>

          {/* Desktop view remains unchanged */}
          <div className="hidden md:flex flex-col md:flex-row justify-center space-x-8 space-y-4 md:space-y-0 w-full">
            {/* Basic Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2">Basic Plan</h2>
                <p className="text-7xl font-bold mt-8">$19</p>
              </center>
              <p className="mb-4 mt-8">• Resume modification based on job description<br />
                • Job description-based interview questions</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>

            {/* Standard Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2 p-5px">Standard Plan</h2>
                <p className="text-7xl mb-2 font-bold p-5px mt-8">$39</p>
              </center>
              <p className="mb-4 mt-8">• All Basic Plan features<br />
                • Personalized interview strategies<br />
                • 24/7 AI chat support</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-b from-[#363d4f] to-[#7a8db5] rounded-3xl text-white p-8 w-80 h-96 flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:from-[#2c4a88] hover:to-[#0c1323]">
              <center>
                <h2 className="text-4xl font-semibold mb-2 p-5px">Premium Plan</h2>
                <p className="text-7xl mb-2 font-bold p-5px mt-8">$59</p>
              </center>
              <p className="mb-4 mt-8">• All Standard Plan features<br />
                • Mock interviews with AI<br />
                • Performance analysis and feedback</p>
              <center>
                <SignInButton mode="modal">
                  <button className="bg-[#0a4272] text-white px-4 py-2 rounded-full">
                    Select Plan
                  </button>
                </SignInButton>
              </center>
            </div>
          </div>


        </div>
      </section>



      {/* FAQ Section */}
      <section id="faqs" className="min-h-screen flex flex-col justify-center items-center bg-[#011a2e] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h1>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4">
                <button
                  className="w-full bg-white text-left p-4 rounded-md flex justify-between items-center"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown className={`transform transition-transform ${activeIndex === index ? 'rotate-180' : ''}`} />
                </button>
                {activeIndex === index && (
                  <div className="bg-gray-100 p-4 mt-2 rounded-md">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 bg-gray-200 text-center p-6 rounded-full max-w-5xl mx-auto">
          <p className="sm:text-xl font-semibold px-5">
            Unlock tailored interview questions and expert insights designed to help you land your dream job.
            <br></br>Prepare smarter, not harder.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;