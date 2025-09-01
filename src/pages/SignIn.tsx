import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import wallpaper from '../assets/wallpaper.png'
import logo from '../assets/logo.png'

const emailSchema = z.object({
  email: z.string().email('Invalid email'),
})
type EmailForm = z.infer<typeof emailSchema>

const otpSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .min(4, 'OTP must be at least 4 digits')
    .max(6, 'OTP can be at most 6 digits'),
  keepLoggedIn: z.boolean().optional(),
})
type OtpForm = z.infer<typeof otpSchema>

export default function SignIn({ onAuth }: { onAuth: (u: any) => void }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<'email' | 'otp'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  const VITE_API_URL = import.meta.env.VITE_API_URL || ''

  const onRequestOtp = async (data: EmailForm) => {
    setServerError('')
    try {
      await axios.post(`${VITE_API_URL}/api/auth/request-otp`, data, { withCredentials: true })
      otpForm.setValue('email', data.email)
      setStage('otp')
      setOtpSent(true)
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Failed to send OTP')
    }
  }

  const onVerifyOtp = async (data: OtpForm) => {
    setServerError('')
    try {
      const res = await axios.post(`${VITE_API_URL}/api/auth/verify-otp`, data, { withCredentials: true })
      onAuth(res.data.user)
      navigate('/app')
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Verification failed')
    }
  }

  const onResendOtp = async () => {
    setServerError('')
    try {
      const email = otpForm.getValues('email')
      await axios.post(`${VITE_API_URL}/api/auth/request-otp`, { email }, { withCredentials: true })
      setOtpSent(true)
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Failed to resend OTP')
    }
  }

  const FloatingInput = ({
    label,
    type = 'text',
    register,
    error,
    children,
  }: {
    label: string
    type?: string
    register: any
    error?: string
    children?: React.ReactNode
  }) => (
    <div className="relative w-full my-1">
      <input
        type={type}
        placeholder=" "
        {...register}
        className={`peer w-full border rounded-lg px-3 pt-1 pb-1 focus:outline-none focus:ring-1 focus:ring-blue-600 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      <label className="absolute left-3 -top-3 bg-white px-1 text-sm text-gray-400 transition-all duration-200 peer-focus:text-blue-600">
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="h-screen md:w-[62vw] sm:w-full mx-auto bg-white md:border border-gray-400 md:rounded-2xl flex flex-col md:flex-row overflow-hidden relative">
       {/* Logo */}
        <Link to="/" className="absolute md:top-4 md:left-4 top-4 left-1/2 -translate-x-1/2 md:translate-x-0">
          <img src={logo} alt="Logo" className="h-6" />
        </Link>

      {/* Left side - Form */}
      <div className="flex flex-col justify-center mt-3 pt-10 md:pt-0 md:p-12 max-w-md mx-auto">
        <h2 className="text-2xl text-center md:text-start text-[#232323] font-bold mb-1">
          Sign In
        </h2>
        <p className="text-[#969696] text-sm mb-5">Sign in to access your account</p>

        <form
          className="space-y-4"
          onSubmit={
            stage === 'email' ? emailForm.handleSubmit(onRequestOtp) : otpForm.handleSubmit(onVerifyOtp)
          }
        >
          <FloatingInput
            label="Email"
            type="email"
            register={
              stage === 'email' ? emailForm.register('email') : otpForm.register('email')
            }
            error={stage === 'email' ? emailForm.formState.errors.email?.message : undefined}
          />

          {stage === 'otp' && (
            <>
              <FloatingInput
                label="OTP Code"
                type={showOtp ? 'text' : 'password'}
                register={otpForm.register('code')}
                error={otpForm.formState.errors.code?.message}
              >
                <button
                  type="button"
                  onClick={() => setShowOtp(!showOtp)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showOtp ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </FloatingInput>

              {otpSent && (
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={onResendOtp}
                >
                  Resend OTP
                </button>
              )}

              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  {...otpForm.register('keepLoggedIn')}
                  id="keepLoggedIn"
                  className="mr-2 cursor-pointer"
                />
                <label htmlFor="keepLoggedIn" className="text-sm text-gray-600">
                  Keep me logged in
                </label>
              </div>
            </>
          )}

          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg font-semibold text-sm bg-blue-500 text-white py-2 hover:bg-blue-700 transition"
          >
            {stage === 'email' ? 'Get OTP' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Need an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => navigate('/signup')}
          >
            Create one
          </button>
        </p>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          <img src={wallpaper} alt="Background" className="w-full h-full object-contain" />
        </div>
      </div>
    </div>
  )
}
