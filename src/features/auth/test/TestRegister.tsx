// import AppInput from '../../../components/common/Input/AppInput'
// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Box, Button, Typography } from '@mui/material'
// import { createUser } from '../authService'
// import axios from 'axios'

// interface RegisterFormProps {
//   onSubmit: (email: string) => void
//   onSwitchToLogin?: () => void
// }

// export default function RegisterForm({ onSubmit, onSwitchToLogin }: RegisterFormProps) {
//   const navigate = useNavigate()

//   const [name, setName]         = useState('')
//   const [email, setEmail]       = useState('')
//   const [password, setPassword] = useState('')

 
//   const [nameError, setNameError]         = useState('')
//   const [emailError, setEmailError]       = useState('')
//   const [passwordError, setPasswordError] = useState('')
//   const [formError, setFormError]         = useState('')

// const handleRegister = async () => {

//   setFormError('')
//   setMobileError('')
//   setRoleError('')
//   setNameError('')
//   setEmailError('')


//   if (!name.trim()) {
//     setNameError('Name is required')
//     return
//   }

//   if (name.trim().length < 4) {
//     setNameError('Name must be at least 4 characters')
//     return
//   }

//   if (!email.trim()) {
//     setEmailError('Email is required')
//     return
//   }

//   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
//     setEmailError('Enter a valid email address')
//     return
//   }

//   if (!mobile.trim()) {
//     setMobileError('Mobile number is required')
//     return
//   }

//   if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
//     setMobileError('Enter a valid 10-digit mobile number')
//     return
//   }

//   if (!password.trim()) {
//   setPasswordError('Password is required')
//   return
//   }

//   if (password.length < 7) {
//   setPasswordError('At least 7 characters required')
//   return
//   } 

//   if (!/[A-Z]/.test(password)) {
//   setPasswordError('Add at least one uppercase letter')
//   return
//   }

//   if (!/[a-z]/.test(password)) {
//   setPasswordError('Add at least one lowercase letter')
//   return
//   }

//   if (!/[!@#$%^&*]/.test(password)) {
//   setPasswordError('Add a special character (!@#$%^&*)')
//   return
//   }
// }

// const payload = { name, email, password }
//     console.log('API Payload:', payload)

//     try {
// 			setLoading(true)
// 			const res = await createUser(payload)
// 			console.log('API Response:', res)
// 			if (res.success) {
// 				onSubmit(mobile)
// 			} else {
// 				setFormError(res.message || 'Failed to create user')
// 			}
// 		} catch (err) {
// 			if (axios.isAxiosError(err)) {
// 				const serverMessage = err.response?.data
// 				if (serverMessage && typeof serverMessage === 'object' && 'message' in serverMessage) {
// 					setFormError(String(serverMessage.message))
// 				} else {
// 					setFormError('Failed to create user')
// 				}
// 			} else {
// 				setFormError('Failed to create user')
// 			}
// 		} finally {
// 			setLoading(false)
// 		}
// 	}

//     return (
//     <Box
//       display="flex"  
//       justifyContent="center"
//       alignItems="center"
//       height="100vh"
//       backgroundcolor="#f5f5f5"
//     ></Box>
        
//         </Typography>
//         <AppInput
// 				sx={{ mt: 2 }}
// 				placeholder="Enter your name"
// 				fullWidth
// 				value={name}
// 				onChange={(e) => {
// 					setName(e.target.value)
// 					if (nameError) setNameError('')
// 					if (formError) setFormError('')
// 				}}
// 				error={!!nameError}
// 				helperText={nameError}
// 			/>

// 			<AppInput
// 				sx={{ mt: 2 }}
// 				placeholder="Enter your mail address"
// 				fullWidth
// 				value={email}
// 				onChange={(e) => {
// 					setEmail(e.target.value)
// 					if (emailError) setEmailError('')
// 					if (formError) setFormError('')
// 				}}
// 				error={!!emailError}
// 				helperText={emailError}
// 			/>
            
//             <AppInput
//           sx={{ mt: 2 }}
//           placeholder="Create a password"
//           fullWidth
//           type="password"
//           value={password}
//           onChange={(e) => {
//             setPassword(e.target.value)
//             if (passwordError) setPasswordError('')
//             if (formError) setFormError('')
//           }}
//           error={!!passwordError}
//           helperText={passwordError}
//         />
// 			<AppInput
// 				sx={{ mt: 2 }}
// 				placeholder="Mobile Number"
// 				fullWidth
// 				value={mobile}
// 				onChange={(e) => {
// 					setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
// 					if (mobileError) setMobileError('')
// 					if (formError) setFormError('')
// 				}}
// 				error={!!mobileError}
// 				helperText={mobileError}
// 				inputProps={{ maxLength: 10 }}
// 			/>