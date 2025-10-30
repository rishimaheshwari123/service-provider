"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createJobAPI } from "@/service/operations/job";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
interface JobFormData {
  title: string;
  location: string;
  type: string;
  department: string;
  experience: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  deadline: string;
}

export default function JobCreate() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    location: "",
    type: "",
    department: "",
    experience: "",
    salary: "",
    description: "",
    responsibilities: [],
    requirements: [],
    benefits: [],
    deadline: "",
  });

  const user = useSelector((state: RootState) => state.auth?.user ?? null);

  const [newResponsibility, setNewResponsibility] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (
    field: "responsibilities" | "requirements" | "benefits",
    value: string
  ) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));

      if (field === "responsibilities") setNewResponsibility("");
      if (field === "requirements") setNewRequirement("");
      if (field === "benefits") setNewBenefit("");
    }
  };

  const removeArrayItem = (
    field: "responsibilities" | "requirements" | "benefits",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would call your backend API
      const jobData = {
        ...formData,
        postedDate: new Date().toISOString(),
        _id: Date.now().toString(), // Temporary ID generation
      };

      console.log("Job data to be sent to API:", jobData);

      // Simulate API call
      const response = await createJobAPI(jobData);
      if (response) {
        toast({
          title: "Job Created Successfully!",
          description: "The job posting has been created and is now live.",
        });
        setFormData({
          title: "",
          location: "",
          type: "",
          department: "",
          experience: "",
          salary: "",
          description: "",
          responsibilities: [],
          requirements: [],
          benefits: [],
          deadline: "",
        });
      }

      // Reset form
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.location &&
      formData.type &&
      formData.department &&
      formData.experience &&
      formData.salary &&
      formData.description &&
      formData.deadline &&
      formData.responsibilities.length > 0 &&
      formData.requirements.length > 0 &&
      formData.benefits.length > 0
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Job Posting</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to create a new job posting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of the job position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Real Estate Sales Executive"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="e.g., Bhopal, MP"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                    <SelectItem value="support"> Support</SelectItem>
                    <SelectItem value="staff"> Staff</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience *</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  placeholder="e.g., 2-5 years"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Salary *</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  placeholder="e.g., ₹4L - ₹8L per annum"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    handleInputChange("deadline", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Provide a detailed description of the role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide a detailed job description..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
            <CardDescription>
              Add key responsibilities for this role
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                placeholder="Add a responsibility..."
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                  addArrayItem("responsibilities", newResponsibility))
                }
              />
              <Button
                type="button"
                onClick={() =>
                  addArrayItem("responsibilities", newResponsibility)
                }
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.responsibilities.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm py-1 px-2"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("responsibilities", index)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Add required qualifications and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(),
                  addArrayItem("requirements", newRequirement))
                }
              />
              <Button
                type="button"
                onClick={() => addArrayItem("requirements", newRequirement)}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.requirements.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm py-1 px-2"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("requirements", index)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits</CardTitle>
            <CardDescription>Add benefits and perks offered</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a benefit..."
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), addArrayItem("benefits", newBenefit))
                }
              />
              <Button
                type="button"
                onClick={() => addArrayItem("benefits", newBenefit)}
                size="icon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((item, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-sm py-1 px-2"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem("benefits", index)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              "Creating..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Job
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
