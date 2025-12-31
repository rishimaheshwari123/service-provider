import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../service/operations/vendor";
import { toast } from "react-toastify";

// Zod schema - PAN is now optional
const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .regex(
      /^[1-9]\d{9}$/,
      "Phone must be 10 digits and cannot start with 0 or +"
    ),
  company: z.string().min(2, "Company name is required"),
  address: z.string().min(5, "Business address is required"),
  adhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits"),
  pan: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]$/,
      "PAN must be 10 characters: 5 letters, 4 digits, 1 letter"
    )
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

const VendorRegister = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormData) => {
    if (!accepted) {
      toast.error(t('partnerRegister.acceptTermsError'));
      return;
    }

    const response = await signUp(data);
    if (response) navigate("/partner/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('partnerRegister.title')}
          </CardTitle>
          <p className="text-gray-600">{t('partnerRegister.subtitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('partnerRegister.fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder={t('partnerRegister.fullNamePlaceholder')}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('partnerRegister.email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder={t('partnerRegister.emailPlaceholder')}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('partnerRegister.password')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={t('partnerRegister.passwordPlaceholder')}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t('partnerRegister.phoneNumber')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder={t('partnerRegister.phonePlaceholder')}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adhar">
                  {t('partnerRegister.aadharNumber')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="adhar"
                  {...register("adhar")}
                  placeholder={t('partnerRegister.aadharPlaceholder')}
                  className={errors.adhar ? "border-destructive" : ""}
                />
                {errors.adhar && (
                  <p className="text-sm text-destructive">
                    {errors.adhar.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">
                  {t('partnerRegister.panNumber')} <span className="text-gray-400">({t('common.optional')})</span>
                </Label>
                <Input
                  id="pan"
                  {...register("pan")}
                  placeholder={t('partnerRegister.panPlaceholder')}
                  className={errors.pan ? "border-destructive" : ""}
                />
                {errors.pan && (
                  <p className="text-sm text-destructive">
                    {errors.pan.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                {t('partnerRegister.companyName')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                {...register("company")}
                placeholder={t('partnerRegister.companyPlaceholder')}
                className={errors.company ? "border-destructive" : ""}
              />
              {errors.company && (
                <p className="text-sm text-destructive">
                  {errors.company.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                {t('partnerRegister.businessAddress')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...register("address")}
                placeholder={t('partnerRegister.addressPlaceholder')}
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('partnerRegister.businessDescription')}</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder={t('partnerRegister.descriptionPlaceholder')}
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
                {t('partnerRegister.agreeToTerms')}{" "}
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-blue-600 hover:underline"
                >
                  {t('partnerRegister.termsAndConditions')}
                </button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('partnerRegister.registering') : t('partnerRegister.register')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {t('partnerRegister.alreadyHaveAccount')}{" "}
              <Link
                to="/partner/login"
                className="text-blue-600 hover:underline"
              >
                {t('partnerRegister.loginHere')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
            <h2 className="text-xl font-semibold mb-3">{t('partnerRegister.termsAndConditions')}</h2>
            <div className="max-h-64 overflow-y-auto text-gray-700 text-sm space-y-2">
              <p>{t('partnerRegister.term1')}</p>
              <p>{t('partnerRegister.term2')}</p>
              <p>{t('partnerRegister.term3')}</p>
              <p>{t('partnerRegister.term4')}</p>
              <p>{t('partnerRegister.term5')}</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="px-4"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => {
                  setAccepted(true);
                  setShowModal(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4"
              >
                {t('partnerRegister.accept')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorRegister;
