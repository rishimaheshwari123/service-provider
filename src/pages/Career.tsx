"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Briefcase,
  MapPin,
  Clock,
  Building,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { getJobsAPI } from "@/service/operations/job";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import PromoBanner from "@/components/home/PromoBanner";

const Careers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  const extractUniqueValues = (jobs) => {
    const departments = [
      ...new Set(jobs.map((job) => job.department).filter(Boolean)),
    ];
    const types = [...new Set(jobs.map((job) => job.type).filter(Boolean))];
    const locations = [
      ...new Set(jobs.map((job) => job.location).filter(Boolean)),
    ];

    setUniqueDepartments(departments);
    setUniqueTypes(types);
    setUniqueLocations(locations);
  };

  const fetchAllJobs = async () => {
    try {
      setLoading(true);
      const response = await getJobsAPI();
      setJobs(response);
      extractUniqueValues(response);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError(t('careers.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} ${t('careers.daysRemaining')}` : t('careers.deadlinePassed');
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      selectedDepartment === "all" || job.department === selectedDepartment;
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesLocation =
      selectedLocation === "all" || job.location === selectedLocation;

    return matchesSearch && matchesDepartment && matchesType && matchesLocation;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("all");
    setSelectedType("all");
    setSelectedLocation("all");
  };

  const handleJobClick = (jobId) => {
    navigate(`/careers/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('careers.loadingJobs')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAllJobs}>{t('messages.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

          {/* <HeroSection /> */}
          <PromoBanner/>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        

        {/* Why Join Us Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('careers.whyJoinUs')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('careers.whyJoinUsDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('careers.professionalGrowth')}
                </h3>
                <p className="text-gray-600">
                  {t('careers.professionalGrowthDesc')}
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('careers.collaborativeCulture')}
                </h3>
                <p className="text-gray-600">
                  {t('careers.collaborativeCultureDesc')}
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.2 7.8l-7.7 7.7-4-4-5.7 5.7"></path>
                    <path d="M15 7h6v6"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('careers.competitiveBenefits')}
                </h3>
                <p className="text-gray-600">
                  {t('careers.competitiveBenefitsDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('careers.currentOpenings')}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t('careers.currentOpeningsDesc')}
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Input
                    placeholder={t('careers.searchJobs')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-12 text-black placeholder:text-gray-500"
                  />
                </div>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t('careers.department')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('careers.allDepartments')}</SelectItem>
                    {uniqueDepartments.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t('careers.jobType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('careers.allTypes')}</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={t('careers.location')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('careers.allLocations')}</SelectItem>
                    {uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm ||
                selectedDepartment !== "all" ||
                selectedType !== "all" ||
                selectedLocation !== "all") && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={clearFilters}>
                    {t('careers.clearFilters')}
                  </Button>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(searchTerm ||
              selectedDepartment !== "all" ||
              selectedType !== "all" ||
              selectedLocation !== "all") && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {t('careers.activeFilters')}:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {t('common.search')}: {searchTerm}
                    </Badge>
                  )}
                  {selectedDepartment !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {t('careers.department')}: {selectedDepartment}
                    </Badge>
                  )}
                  {selectedType !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {t('careers.type')}: {selectedType}
                    </Badge>
                  )}
                  {selectedLocation !== "all" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-800"
                    >
                      {t('careers.location')}: {selectedLocation}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {filteredJobs.length} {t('careers.jobsFound')}
              </h3>
            </div>

            {/* Job Cards */}
            {filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <Card
                    key={job._id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleJobClick(job._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <span className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {job.department}
                            </span>
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
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {job.description}
                          </p>
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 mr-1 text-amber-600" />
                            <span className="text-gray-600 mr-2">
                              {t('careers.posted')}: {job.deadline}
                            </span>
                            <span className="text-amber-600 font-medium">
                              {calculateDaysRemaining(job.deadline)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button className="gradient-gold text-white">
                            {t('common.viewDetails')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('careers.noJobsFound')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('careers.tryAdjusting')}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  {t('careers.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Careers;