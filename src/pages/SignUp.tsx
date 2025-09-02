import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import wallpaper from '../assets/wallpaper.png';
import logo from '../assets/logo.png';

declare global {
  interface Window { google: any; }
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email'),
});

const otpSchema = z.object({
  code: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
  email: z.string().email(),
});

type FormData = z.infer<typeof formSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function SignUp({ onAuth }: { onAuth: (u: any) => void }) {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const form = useForm<FormData>({ resolver: zodResolver(formSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const VITE_API_URL = import.meta.env.VITE_API_URL || '';
  const VITE_GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    const cleanup = () => document.body.removeChild(script);

    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: VITE_GOOGLE_CLIENT_ID,
        callback: async (res: any) => {
          try {
            const response = await axios.post(
              `${VITE_API_URL}/api/auth/google`,
              { token: res.credential },
              { withCredentials: true }
            );
            localStorage.setItem('user', JSON.stringify(response.data.user));
            onAuth(response.data.user);
            navigate('/app');
          } catch (err: any) {
            setServerError(err.response?.data?.message || 'Google sign-up failed');
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-button')!,
        { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
      );

      window.google.accounts.id.prompt();
    };

    return cleanup;
  }, [onAuth, navigate, VITE_API_URL, VITE_GOOGLE_CLIENT_ID]);

  const requestOtp = async (data: FormData) => {
    setServerError('');
    try {
      await axios.post(`${VITE_API_URL}/api/auth/request-otp`, data, { withCredentials: true });
      otpForm.setValue('email', data.email);
      setOtpSent(true);
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async (data: OtpForm) => {
    setServerError('');
    try {
      const res = await axios.post(`${VITE_API_URL}/api/auth/verify-otp`, data, { withCredentials: true });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onAuth(res.data.user);
      navigate('/app');
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'OTP verification failed');
    }
  };

  const resendOtp = async () => {
    setServerError('');
    try {
      const email = otpForm.getValues('email');
      await axios.post(`${VITE_API_URL}/api/auth/request-otp`, { email }, { withCredentials: true });
      setResendTimer(15);
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="h-screen md:w-[62vw] sm:w-full mx-auto bg-white md:border border-gray-400 md:rounded-2xl flex flex-col md:flex-row overflow-hidden relative">
      <Link to="/" className="absolute md:top-4 md:left-4 top-4 left-1/2 -translate-x-1/2 md:translate-x-0">
        <img src={logo} alt="Logo" className="h-6" />
      </Link>

      <div className="flex flex-col justify-center mt-3 pt-10 md:pt-0 md:p-12 max-w-md mx-auto">
        <h2 className="text-2xl text-center md:text-start text-[#232323] font-bold mb-1">Sign Up</h2>
        <p className="text-[#969696] text-sm mb-5 text-center md:text-start">Create your account to continue</p>

        {!otpSent ? (
          <form className="space-y-4" onSubmit={form.handleSubmit(requestOtp)}>
            <div className="flex flex-col space-y-2">
              <input {...form.register('name')} placeholder="Name" className="border rounded-lg px-3 py-2" />
              {form.formState.errors.name && <p className="text-red-600 text-sm">{form.formState.errors.name.message}</p>}

              <input {...form.register('dob')} type="date" placeholder="Date of Birth" className="border rounded-lg px-3 py-2" />
              {form.formState.errors.dob && <p className="text-red-600 text-sm">{form.formState.errors.dob.message}</p>}

              <input {...form.register('email')} type="email" placeholder="Email" className="border rounded-lg px-3 py-2" />
              {form.formState.errors.email && <p className="text-red-600 text-sm">{form.formState.errors.email.message}</p>}
            </div>

            {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

            <button type="submit" className="w-full rounded-lg font-semibold text-sm bg-blue-500 text-white py-2 hover:bg-blue-700 transition">Get OTP</button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={otpForm.handleSubmit(verifyOtp)}>
            <input {...otpForm.register('code')} placeholder="OTP Code" className="border rounded-lg px-3 py-2" />
            {otpForm.formState.errors.code && <p className="text-red-600 text-sm">{otpForm.formState.errors.code.message}</p>}

            {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

            <button type="button" onClick={resendOtp} disabled={resendTimer > 0} className={`text-sm ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}>
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>

            <button type="submit" className="w-full rounded-lg font-semibold text-sm bg-blue-500 text-white py-2 hover:bg-blue-700 transition">Verify OTP</button>
          </form>
        )}

        <div id="google-button" className="mt-3"></div>
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          <img src={wallpaper} alt="Background" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  );
}
