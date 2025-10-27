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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {loading ? (
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-md">
        <Card className="shadow-lg border">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Admin Login
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {apiError && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 h-12 ${errors.email && touched.email ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                  />
                </div>
                {errors.email && touched.email && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 pr-10 h-12 ${errors.password && touched.password ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
