import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../service/operations/vendor";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";

// Zod schema
const loginSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[1-9]\d{9}$/,
      "Phone must be 10 digits and cannot start with 0 or +"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const VendorLogin = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.phone, data.password, dispatch);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t('partnerLogin.title')}</CardTitle>
          <p className="text-gray-600">{t('partnerLogin.subtitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                {t('partnerLogin.phoneNumber')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('partnerLogin.phonePlaceholder')}
                {...register("phone")}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {t('partnerLogin.password')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('partnerLogin.passwordPlaceholder')}
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

            <Button
              type="submit"
              className="w-full gradient-gold text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('partnerLogin.loggingIn') : t('partnerLogin.login')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {t('partnerLogin.noAccount')}{" "}
              <Link
                to="/vendor/register"
                className="text-blue-600 hover:underline"
              >
                {t('partnerLogin.registerHere')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorLogin;
