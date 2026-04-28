import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { signUp } from "@/service/operations/auth";
import { Eye, EyeOff, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 🔹 Signup schema with phone validation
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[1-9]\d{9}$/.test(val),
        "Phone must be 10 digits and cannot start with 0, + or +91"
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    if (!acceptedTerms) {
      alert("Please accept Terms & Conditions and Privacy Policy");
      return;
    }
    try {
      const formData = {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        password: data.password,
        referralCode: data.referralCode || "",
      };
      const success = await signUp(formData, navigate, dispatch);
      if (success) {
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
  <div>
    <Navbar/>
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('pages.signup.createAccount')}</h1>
          <p className="text-muted-foreground mt-2">{t('pages.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('pages.signup.fullName')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('pages.signup.fullNamePlaceholder')}
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('pages.signup.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('pages.signup.emailPlaceholder')}
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('pages.signup.phoneNumber')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('pages.signup.phonePlaceholder')}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('pages.signup.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('pages.signup.passwordPlaceholder')}
                {...register("password")}
                className={
                  errors.password ? "border-destructive pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('pages.signup.confirmPassword')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('pages.signup.confirmPasswordPlaceholder')}
                {...register("confirmPassword")}
                className={
                  errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-600" />
              Referral Code <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter referral code (if you have one)"
              {...register("referralCode")}
              className={errors.referralCode ? "border-destructive" : ""}
              maxLength={8}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.referralCode && (
              <p className="text-sm text-destructive">{errors.referralCode.message}</p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Have a referral code? Enter it to earn bonus reward points!
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="termsAndPrivacy"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-4 h-4 mt-1 cursor-pointer"
            />
            <label htmlFor="termsAndPrivacy" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link to="/terms" target="_blank" className="text-primary hover:underline">
                Terms & Conditions
              </Link>
              {" "}and{" "}
              <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              <span className="text-destructive"> *</span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !acceptedTerms}
            variant="hero"
          >
            {isSubmitting ? t('pages.signup.creatingAccount') : t('pages.signup.createAccountBtn')}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-muted-foreground">
            {t('pages.signup.alreadyHaveAccount')}{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-medium"
            >
              {t('pages.signup.signIn')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
    <Footer/>
  </div>
  );
};

export default Signup;
