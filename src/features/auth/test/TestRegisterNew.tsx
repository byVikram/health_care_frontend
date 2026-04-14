import AppInput from '../../../components/common/Input/AppInput'
import { Box, Button, Typography, Alert } from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { createUser, CreateUserRequest } from '../authService'
import { useState } from 'react'

interface RegisterFormProps {
  onSubmit: (email: string) => void
  onSwitchToLogin?: () => void
}

interface RegisterFormValues {
  name: string
  email: string
  password: string
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {

  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },

    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .min(4, 'Name must be at least 4 characters'),

      email: Yup.string()
        .email('Enter a valid email address')
        .required('Email is required'),

      password: Yup.string()
        .required('Password is required')
        .min(7, 'At least 7 characters required')
        .matches(/[A-Z]/, 'Add at least one uppercase letter')
        .matches(/[a-z]/, 'Add at least one lowercase letter')
        .matches(/[!@#$%^&*]/, 'Add a special character (!@#$%^&*)'),
    }),

    onSubmit: async (values) => {
      setFormError('')
    const payload: CreateUserRequest = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
    }

      try {
        setLoading(true)
        const res = await createUser(payload)

        if (res.success) {
          onSubmit(values.email.trim())
        } else {
          setFormError(res.message || 'Failed to create user')
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setFormError(error?.response?.data?.message || 'Failed to create user')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <form onSubmit={formik.handleSubmit}>
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f5f5">
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

        {/* NAME */}
        <AppInput
          sx={{ mt: 2 }}
          name="name"
          placeholder="Enter your name"
          fullWidth
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && !!formik.errors.name}
          helperText={
            formik.touched.name && formik.errors.name
            ? formik.errors.name
            : ''
          }
        />

        {/* EMAIL */}
        <AppInput
          sx={{ mt: 2 }}
          name="email"
          placeholder="Enter your email address"
          fullWidth
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && !!formik.errors.email}
          helperText={
            formik.touched.email && formik.errors.email
            ? formik.errors.email
            : ''
          }
        />

        {/* PASSWORD */}
        <AppInput
          sx={{ mt: 2 }}
          name="password"
          type="password"
          placeholder="Create a password"
          fullWidth
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && !!formik.errors.password}
          helperText={
            formik.touched.password && formik.errors.password
            ? formik.errors.password
            : ''
          }
        />

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{ mt: 3, mb: 2, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          {loading ? 'Submit...' : 'Submit'}
        </Button>
      </Box>
    </Box>
    </form>
  )
}