import React, { useState } from "react";
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
import { login } from "@/service/operations/auth";
import { Eye, EyeOff } from "lucide-react";

// 🔹 Zod schema with phone validation
const loginSchema = z.object({
  phone: z
    .string()
    .regex(
      /^[1-9]\d{9}$/,
      "Phone number must be 10 digits and not start with 0"
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
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
      await login(data.phone, data.password, dispatch); // phone used instead of email
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">{t('pages.login.welcomeBack')}</h1>
          <p className="text-muted-foreground mt-2">{t('pages.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('pages.login.phone')}</Label>
            <Input
              id="phone"
              type="text"
              placeholder={t('forms.placeholders.enterPhone')}
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('pages.login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t('forms.placeholders.enterPassword')}
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
            className="w-full"
            disabled={isSubmitting}
            variant="hero"
          >
            {isSubmitting ? t('common.loading') : t('pages.login.signIn')}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-muted-foreground">
            {t('pages.login.noAccount')}{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              {t('pages.login.signUp')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
