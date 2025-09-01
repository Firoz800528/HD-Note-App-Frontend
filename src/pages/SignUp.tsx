import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import wallpaper from '../assets/wallpaper.png'
import logo from '../assets/logo.png'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email'),
  code: z.string().optional(),
})
type FormData = z.infer<typeof formSchema>

export default function Login({ onAuth }: { onAuth: (u: any) => void }) {
  const [otpSent, setOtpSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const form = useForm<FormData>({ resolver: zodResolver(formSchema) })

  const VITE_API_URL = import.meta.env.VITE_API_URL || ''

  const onRequestOtp = async (data: FormData) => {
    setServerError('')
    try {
      await axios.post(
        `${VITE_API_URL}/api/auth/request-otp`,
        {
          name: data.name,
          dob: data.dob,
          email: data.email,
        },
        { withCredentials: true }
      )
      setOtpSent(true)
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Failed to send OTP')
    }
  }

  const onVerifyOtp = async (data: FormData) => {
    setServerError('')
    try {
      const res = await axios.post(`${VITE_API_URL}/api/auth/verify-otp`, data, {
        withCredentials: true,
      })
      onAuth(res.data.user)
    } catch (e: any) {
      setServerError(e.response?.data?.message || 'Verification failed')
    }
  }

  // Floating Input Component
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
          Sign up
        </h2>
        <p className="text-[#969696] text-center md:text-start text-sm mb-5">
          Sign up to enjoy the features on HD
        </p>

        {/* Unified Form */}
        <form
          className="space-y-4"
          onSubmit={
            otpSent ? form.handleSubmit(onVerifyOtp) : form.handleSubmit(onRequestOtp)
          }
        >
          <FloatingInput
            label="Your Name"
            register={form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <FloatingInput
            label="Date of Birth"
            type="date"
            register={form.register('dob')}
            error={form.formState.errors.dob?.message}
          />
          <FloatingInput
            label="Email"
            type="email"
            register={form.register('email')}
            error={form.formState.errors.email?.message}
          />

          {otpSent && (
            <FloatingInput
              label="OTP Code"
              type={showOtp ? 'text' : 'password'}
              register={form.register('code')}
              error={form.formState.errors.code?.message}
            >
              <button
                type="button"
                onClick={() => setShowOtp(!showOtp)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                {showOtp ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </FloatingInput>
          )}

          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

          <button
            type="submit"
            className="w-full rounded-lg font-semibold text-sm bg-blue-500 text-white py-2 hover:bg-blue-700 transition"
          >
            {otpSent ? 'Sign Up' : 'Get OTP'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="w-full h-full rounded-3xl overflow-hidden">
          <img
            src={wallpaper}
            alt="Background"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  )
}
