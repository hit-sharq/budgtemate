import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useNavigate } from "hooks/use-navigate";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useToast } from "hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "hooks/use-auth";

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (form.formState.isSubmitted && !form.formState.isValid) {
      // Focus on first invalid field
      const firstErrorField = Object.keys(form.formState.errors)[0];
      const element = formRef.current?.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      element?.focus();
    }
  }, [form.formState]);

  async function onSubmit(values: FormValues) {
    setIsLoggingIn(true);

    try {
      await login(values.username, values.password);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleSocialLogin(provider: string) {
    toast({
      title: "Social Login",
      description: `Social login with ${provider} is not implemented yet.`,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-100">
      <Card className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <CardHeader className="bg-primary p-6 flex flex-col items-center space-y-3">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <span className="material-icons text-primary text-3xl">account_balance_wallet</span>
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold">BudgetWise</h1>
            <p className="text-white text-sm opacity-80">Smart Budget & Wallet App</p>
          </div>
        </CardHeader>

        <div className="flex border-b">
          <button className="flex-1 py-3 font-medium text-center border-b-2 border-primary text-primary">
            Login
          </button>
          <button
            className="flex-1 py-3 font-medium text-center text-neutral-400"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
        </div>

        <CardContent className="p-6">
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="username"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary"
                    name="rememberMe"
                  />
                  <span className="text-sm text-neutral-700">Remember me</span>
                </label>
                <Button variant="link" className="px-0 h-auto text-primary">
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 flex items-center justify-center">
            <span className="border-t border-neutral-200 flex-grow"></span>
            <span className="px-3 text-xs text-neutral-400 uppercase">Or continue with</span>
            <span className="border-t border-neutral-200 flex-grow"></span>
          </div>

          <div className="mt-4 flex space-x-4">
            <Button
              className="flex-1 border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="#4285F4"
              >
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
              Google
            </Button>
            <Button
              className="flex-1 border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              onClick={() => handleSocialLogin("Apple")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center p-4 border-t">
          <p className="text-sm text-neutral-500">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => navigate("/register")}
            >
              Sign up now
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
