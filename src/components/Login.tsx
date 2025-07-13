
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginProps {
  onLogin: (credentials: LoginFormData) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    onLogin(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center md:items-start justify-between">
        {/* Left Side - Logo and text */}
        <div className="mb-8 md:mb-0 md:ml-12 md:self-center">
          <div className="flex items-start md:items-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">MC</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Mini-CRM
          </h1>
          <p className="text-slate-600 mt-2 md:max-w-sm">Sign in to access your dashboard</p>
        </div>

        {/* Right Side - Login Card */}
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-slate-200 bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="text-center text-xl text-slate-900">Welcome Back</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@minicrm.com"
                      className="pl-10 h-12 border-slate-300"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /\S+@\S+\.\S+/,
                          message: 'Please enter a valid email'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 border-slate-300"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" {...register('rememberMe')} />
                    <Label htmlFor="remember" className="text-sm text-slate-600">Remember me</Label>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-sm text-slate-600 hover:text-slate-900">
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium">
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 font-medium mb-2">Demo Credentials</p>
                  <p className="text-sm text-slate-500">
                    Email: admin@minicrm.com<br />
                    Password: admin123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
