import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../service/operations/vendor";
import { toast } from "react-toastify";

const VendorRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    address: "",
    description: "",
    adhar: "",
    pan: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      toast.error("Please accept the Terms & Conditions before registering.");
      return;
    }

    const response = await signUp(formData);
    if (response) {
      navigate("/vendor/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Partner Registration
          </CardTitle>
          <p className="text-gray-600">Register to list your properties</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company/Agency Name</Label>
              <Input
                id="company"
                name="company"
                placeholder="Enter your company name"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter your business address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adhar">Adhar Number</Label>
              <Input
                id="adhar"
                name="adhar"
                placeholder="Enter your adhar number"
                value={formData.adhar}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan">Pan Number</Label>
              <Input
                id="pan"
                name="pan"
                placeholder="Enter your pan number"
                value={formData.pan}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell us about your business"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  Terms & Conditions
                </button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white"
            >
              Register
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/vendor/login"
                className="text-blue-600 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Terms & Conditions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
            <h2 className="text-xl font-semibold mb-3">Terms & Conditions</h2>
            <div className="max-h-64 overflow-y-auto text-gray-700 text-sm space-y-2">
              <p>
                1. By registering as a vendor, you agree to provide accurate and
                truthful information about your business.
              </p>
              <p>
                2. All uploaded data and property listings must comply with our
                platform’s guidelines.
              </p>
              <p>
                3. Misuse of the platform or providing false information may
                result in account suspension.
              </p>
              <p>
                4. Your data may be used for communication and verification
                purposes only.
              </p>
              <p>
                5. The company reserves the right to update or modify terms at
                any time.
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="px-4"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setAccepted(true);
                  setShowModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRegister;
