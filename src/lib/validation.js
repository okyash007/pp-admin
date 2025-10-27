// Validation utility functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number'
  return null
}

export const validateName = (name, fieldName) => {
  if (!name) return `${fieldName} is required`
  if (name.length < 2) return `${fieldName} must be at least 2 characters long`
  if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters and spaces`
  return null
}

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

export const validateTerms = (checked) => {
  if (!checked) return 'You must agree to the terms and conditions'
  return null
}
