import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react'
import { validateEmail, validatePassword } from '@/lib/validation'
import { useAuthStore } from '@/stores/authStore'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  
  const { login, isAuthenticated, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  const validateField = (name, value) => {
    let error = null
    switch (name) {
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      default:
        break
    }
    return error
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setApiError('')
    
    // Mark all fields as touched
    const newTouched = { email: true, password: true }
    setTouched(newTouched)
    
    // Validate all fields
    const newErrors = {}
    newErrors.email = validateField('email', formData.email)
    newErrors.password = validateField('password', formData.password)
    
    setErrors(newErrors)
    
    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== null)
    
    if (!hasErrors) {
      try {
        await login(formData.email, formData.password)
        navigate(from, { replace: true })
      } catch (error) {
        setApiError(error.message || 'Login failed. Please try again.')
      }
    }
    
    setIsSubmitting(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched({
      ...touched,
      [name]: true
    })
    
    // Validate field on blur
    const error = validateField(name, value)
    setErrors({
      ...errors,
      [name]: error
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEF18C]/20 via-[#FEF18C]/10 to-[#FEF18C]/5 flex items-center justify-center p-4">
      {loading ? (
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-[4px] border-black border-t-transparent rounded-full animate-spin mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
          <p className="text-black font-black">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
        <Card className="bg-white border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="space-y-1 text-center pb-8 border-black -mx-6 px-6 pt-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FEF18C] via-[#FEF18C] to-[#FEF18C]/80 border-[5px] border-black rounded-lg flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Shield className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <CardTitle className="text-3xl font-black text-black uppercase tracking-tight">
              Admin Login
            </CardTitle>
            <CardDescription className="text-black font-bold mt-2">
              Sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border-[3px] border-red-500 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-600 font-black">
                  <AlertCircle className="w-5 h-5" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-black text-black uppercase tracking-tight">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black z-10 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-11 h-12 bg-white border-[3px] ${errors.email && touched.email ? 'border-red-500' : 'border-black'} focus:border-[#FEF18C] focus:ring-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold`}
                  />
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-2 text-sm text-red-600 font-black">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-black text-black uppercase tracking-tight">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black z-10 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-11 pr-11 h-12 bg-white border-[3px] ${errors.password && touched.password ? 'border-red-500' : 'border-black'} focus:border-[#FEF18C] focus:ring-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-none font-bold`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-[#FEF18C] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <div className="flex items-center gap-2 text-sm text-red-600 font-black">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#828BF8] to-[#5C66D4] hover:from-[#828BF8]/90 hover:to-[#5C66D4]/90 text-white font-black border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
