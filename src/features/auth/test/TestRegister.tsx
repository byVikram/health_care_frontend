import AppInput from '../../../components/common/Input/AppInput'
import { useState } from 'react'
import { Box, Button, Typography, Alert } from '@mui/material'
import { createUser, CreateUserRequest } from '../authService'

interface RegisterFormProps {
  onSubmit: (email: string) => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const [nameError, setNameError]         = useState('')
  const [emailError, setEmailError]       = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [formError, setFormError]         = useState('')

  const handleRegister = async () => {
    setFormError('')
    setNameError('')
    setEmailError('')
    setPasswordError('')

    if (!name.trim()) {
      setNameError('Name is required')
      return
    }
    if (name.trim().length < 4) {
      setNameError('Name must be at least 4 characters')
      return
    }

    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address')
      return
    }

    if (!password.trim()) {
      setPasswordError('Password is required')
      return
    }
    if (password.length < 7) {
      setPasswordError('At least 7 characters required')
      return
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Add at least one uppercase letter')
      return
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError('Add at least one lowercase letter')
      return
    }
    if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError('Add a special character (!@#$%^&*)')
      return
    }

    const payload = { name: name.trim(), email: email.trim(), password } as unknown as CreateUserRequest
    console.log('API Payload:', payload)

    try {
      setLoading(true)
      const res = await createUser(payload)
      console.log('API Response:', res)
      if (res.success) {
        onSubmit(email.trim())
      } else {
        setFormError(res.message || 'Failed to create user')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setFormError(error?.response?.data?.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 4,
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        }}
      >
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          Register Form
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Fill in the details below 
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <AppInput
          sx={{ mt: 2 }}
          placeholder="Enter your name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (nameError) setNameError('')
            if (formError) setFormError('')
          }}
          error={!!nameError}
          helperText={nameError}
        />

        <AppInput
          sx={{ mt: 2 }}
          placeholder="Enter your email address"
          fullWidth
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (emailError) setEmailError('')
            if (formError) setFormError('')
          }}
          error={!!emailError}
          helperText={emailError}
        />

        <AppInput
          sx={{ mt: 2 }}
          placeholder="Create a password"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (passwordError) setPasswordError('')
            if (formError) setFormError('')
          }}
          error={!!passwordError}
          helperText={passwordError}
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleRegister}
          disabled={loading}
          sx={{ mt: 3, mb: 2, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Submit...' : 'Submit'}
        </Button>
      </Box>
    </Box>
  )
}