import React, { useState } from "react";
import { Mail, Phone, Wrench, Zap, Home, ClipboardList } from "lucide-react"; // Imported relevant icons
import { createCustomerSupportAPI } from "@/service/operations/customerSupport";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const CustomerSupport = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Assuming createCustomerSupportAPI handles the form submission
    const respose = await createCustomerSupportAPI(formData);
    if (respose?.success) {
      // Reset form on successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
      // Optionally show a success message to the user
      alert("Your service inquiry has been submitted successfully!");
    } else {
      // Optionally show an error message
      alert("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen font-inter antialiased text-gray-900 bg-gray-50">
        {/* Main Content Section */}
        <main className="container mx-auto my-8 p-4 md:p-8 lg:p-12">
          {/* Header Section: Changed from Property to Service */}
          <section className="mb-16 text-center bg-white p-8 md:p-12 rounded-2xl shadow-lg border-t-4 border-indigo-600">
            <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-700 mb-6 leading-snug">
              🛠️ Welcome to Our Dedicated <br className="hidden md:inline" />
              Home Services Support Center!
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 max-w-4xl mx-auto">
              Whether you're booking a Home Cleaning, hiring an Electrician, or
              need support for any other service, we're here to help. Our
              dedicated team is ready to assist with your booking, job
              completion, or general queries.
            </p>
          </section>

          <hr className="my-16 border-indigo-200 border-dotted" />

          {/* FAQs Section: Service-Focused */}
          <section className="mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-10 text-center flex items-center justify-center">
              <ClipboardList className="mr-3" size={32} /> Frequently Asked
              Questions (FAQs)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {/* FAQ Card 1: Home Cleaning */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform transition duration-300 hover:shadow-xl group hover:border-indigo-300">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 flex items-center">
                  <Home className="mr-2" size={20} /> Q: How do I book a Home
                  Cleaning service?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A: Navigate to the "Book Services" page, select 'Home
                  Cleaning', choose your preferred date/time and service
                  package, then confirm your booking with payment.
                </p>
              </div>
              {/* FAQ Card 2: Hire Electrician */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform transition duration-300 hover:shadow-xl group hover:border-indigo-300">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 flex items-center">
                  <Zap className="mr-2" size={20} /> Q: Can I hire an
                  Electrician for an emergency repair?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A: Yes, we offer an 'Emergency Service' option for critical
                  repairs like electrical faults. Select the category and
                  specify 'Emergency' in the job description for priority
                  matching.
                </p>
              </div>
              {/* FAQ Card 3: Reschedule/Cancel */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform transition duration-300 hover:shadow-xl group hover:border-indigo-300">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 flex items-center">
                  <Wrench className="mr-2" size={20} /> Q: What is the process
                  to reschedule or cancel a booking?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A: You can manage your bookings directly in your User
                  Dashboard. Look for the "My Bookings" section, where you'll
                  find options to reschedule (up to 24 hours prior) or cancel.
                </p>
              </div>
              {/* FAQ Card 4: Service Fees */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform transition duration-300 hover:shadow-xl group hover:border-indigo-300">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300 flex items-center">
                  <ClipboardList className="mr-2" size={20} /> Q: Are there any
                  hidden fees for services?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A: All service charges are clearly outlined on the booking
                  page. The total price you see is what you pay. Any material
                  costs are discussed and approved by you upfront.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-16 border-indigo-200 border-dotted" />

          {/* Contact Us Section with Form */}
          <section className="mb-20 p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-700 mb-10 text-center">
              📞 Contact Our Service Support Team
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 mb-12 max-w-3xl mx-auto text-center">
              If your question isn't covered in our FAQs, please reach out. Fill
              out the form below, and our team will get back to you as soon as
              possible, typically within 24 business hours.
            </p>

            <h3 className="text-2xl font-bold text-indigo-600 mb-8 text-center">
              Submit Your Service Inquiry
            </h3>
            <form
              onSubmit={handleSubmit}
              className="space-y-6 bg-indigo-50 p-8 md:p-10 rounded-2xl shadow-inner border border-indigo-200 max-w-3xl mx-auto"
            >
              {/* Name and Email in one row for better spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Subject and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Subject:
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    placeholder="Issue with recent booking"
                  />
                </div>
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category:
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none pr-10 transition duration-200 cursor-pointer"
                    >
                      <option value="">-- Select a Service Category --</option>
                      <option value="home_cleaning">
                        Home Cleaning Support
                      </option>
                      <option value="hire_electrician">
                        Hire Electrician / Electrical Repair
                      </option>
                      <option value="hire_plumber">
                        Hire Plumber / Plumbing Issue
                      </option>
                      <option value="booking_issue">
                        Booking/Scheduling Issue
                      </option>
                      <option value="payment_billing">Payment & Billing</option>
                      <option value="partner_onboarding">
                        Partner/Service Provider Onboarding
                      </option>
                      <option value="technical_issue">
                        Technical Issue (App/Website)
                      </option>
                      <option value="general_feedback">General Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.096 6.924 4.682 8.338z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Detailed Message:
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  placeholder="Please describe your issue or request..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out text-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Send Service Inquiry
              </button>
            </form>
          </section>

          <hr className="my-16 border-indigo-200 border-dotted" />

          {/* Other Ways to Connect */}
          <section className="mb-8 text-center bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-8">
              Prefer to Speak Directly?
            </h2>
            <div className="space-y-6 text-lg text-gray-700 max-w-2xl mx-auto">
              <p className="flex flex-col md:flex-row items-center justify-center text-xl">
                <Mail
                  className="mr-3 text-indigo-600"
                  size={24}
                  strokeWidth={2}
                />
                <span className="font-semibold text-gray-900 mr-2">
                  Email Support:
                </span>
                <a
                  href="mailto:support@yourserviceswebsite.com"
                  className="text-indigo-600 hover:underline transition-colors duration-200"
                >
                  support@yourserviceswebsite.com
                </a>
              </p>
              <p className="flex flex-col md:flex-row items-center justify-center text-xl">
                <Phone
                  className="mr-3 text-indigo-600"
                  size={24}
                  strokeWidth={2}
                />
                <span className="font-semibold text-gray-900 mr-2">
                  Call Us:
                </span>
                <span className="text-indigo-600">
                  [Your Services Phone Number]
                </span>{" "}
                (Mon-Sat, 9 AM - 6 PM IST)
              </p>
            </div>
          </section>

          <p className="text-center text-xl text-gray-700 mt-20 mb-4">
            We look forward to connecting you with the best home services!
          </p>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CustomerSupport;
