"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import JobApplicationForm from "./JobApplicationForm";
import { getJobByIdAPI } from "../service/operations/job";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining until deadline
  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : "Deadline passed";
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return today > deadlineDate;
  };

  // Fetch job details
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await getJobByIdAPI(id);
      if (response) {
        setJob(response);
      } else {
        setError("Job not found");
      }
    } catch (error) {
      console.error("Error fetching job details:", error);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Job not found"}</p>
          <Button onClick={() => navigate("/careers")}>Back to Careers</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="py-8 gradient-primary text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button
              variant="outline"
              className="mb-6 text-black border-white hover:bg-white hover:text-amber-600"
              onClick={() => navigate("/careers")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Jobs
            </Button>
            <div className="mb-4">
              <Badge className="bg-white text-amber-600 mb-2">
                {job.department}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {job.type}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.experience}
              </span>
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {job.salary}
              </span>
            </div>
          </div>
        </section>

        {/* Job Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Application Deadline */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-600">
                  Posted on {formatDate(job.postedDate)}
                </p>
                <p className="text-sm font-medium">
                  Application Deadline:{" "}
                  <span className="text-amber-600">
                    {formatDate(job.deadline)}
                  </span>
                </p>
              </div>
              <Badge
                className={
                  isDeadlinePassed(job.deadline)
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }
              >
                {calculateDaysRemaining(job.deadline)}
              </Badge>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <p className="text-gray-700 mb-6">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Key Responsibilities
              </h2>
              <ul className="space-y-2">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Requirements
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Benefits
              </h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Apply Button */}
            <div className="mt-8 text-center">
              {isDeadlinePassed(job.deadline) ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">
                    The application deadline for this position has passed.
                    Please check our other open positions.
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="gradient-gold text-white"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply for this Position
                </Button>
              )}
            </div>
          </div>

          {/* Application Form */}
          {showApplicationForm && !isDeadlinePassed(job.deadline) && (
            <JobApplicationForm
              jobId={job._id}
              jobTitle={job.title}
              job={job}
              onClose={() => setShowApplicationForm(false)}
            />
          )}

          {/* Similar Jobs */}
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Explore Other Opportunities
            </h3>
            <Button
              onClick={() => navigate("/careers")}
              variant="outline"
              size="lg"
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobDetail;
