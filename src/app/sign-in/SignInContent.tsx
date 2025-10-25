// 'use client'

// import { useEffect, useState } from 'react'
// import Link from 'next/link'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { signIn } from 'next-auth/react'
// import { useSession } from 'next-auth/react'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
// import { Alert, AlertDescription } from '@/components/ui/alert'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Eye, EyeOff, Loader2 } from 'lucide-react'
// import { Header } from '@/components/layout/Header'
// // Footer intentionally not shown on sign-in page

// export default function SignInContent() {
//   const router = useRouter()
//   const { status } = useSession()
//   const searchParams = useSearchParams()
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false
//   })
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState('')

//   // Clean any callbackUrl query if present (ensure plain /sign-in)
//   useEffect(() => {
//     if (searchParams && searchParams.has('callbackUrl')) {
//       router.replace('/sign-in')
//     }
//   }, [searchParams, router])

//   // Surface NextAuth error query (e.g., CredentialsSignin)
//   useEffect(() => {
//     if (!searchParams) return
//     const err = searchParams.get('error')
//     if (!err) return
//     if (err === 'CredentialsSignin') {
//       setError('Invalid email or password')
//     } else if (err === 'OAuthAccountNotLinked') {
//       setError('Please sign in with the originally used provider')
//     } else {
//       setError('Sign in failed. Please try again.')
//     }
//   }, [searchParams])

//   // If already signed in, send to admin
//   useEffect(() => {
//     if (status === 'authenticated') {
//       router.replace('/admin')
//     }
//   }, [status, router])

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }))
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError('')

//     try {
//       // Basic validation
//       if (!formData.email || !formData.password) {
//         setError('Please fill in all fields')
//         return
//       }

//       // Email validation
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//       if (!emailRegex.test(formData.email)) {
//         setError('Please enter a valid email address')
//         return
//       }

//       // Use NextAuth credentials provider with SPA-style handling
//       const origin = typeof window !== 'undefined' ? window.location.origin : ''
//       const absoluteCallback = origin ? `${origin}/admin` : '/admin'
//       const result = await signIn('credentials', {
//         email: formData.email,
//         password: formData.password,
//         callbackUrl: absoluteCallback,
//         redirect: false
//       })

//       if (!result) {
//         setError('Sign in failed. Please try again.')
//         return
//       }
//       if (result.error) {
//         setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error)
//         return
//       }
//       // Use replace instead of push to avoid history stack issues
//       router.replace('/admin')
//     } catch (err) {
//       console.error('Sign-in error:', err)
//       const msg = err instanceof Error ? err.message : String(err)
//       if (typeof msg === 'string' && /Failed to fetch|NetworkError/i.test(msg)) {
//         setError('Cannot reach auth server. Check your network and NEXTAUTH_URL.')
//       } else if (typeof msg === 'string' && /Invalid URL/i.test(msg)) {
//         setError('Invalid URL. Ensure NEXTAUTH_URL is a full URL (e.g., http://localhost:3000) and callbackUrl is absolute.')
//       } else {
//         setError('Something went wrong. Please try again.')
//       }
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Header hideAuthButtons />
      
//       <main className="flex items-center justify-center py-12 px-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
//             <CardDescription className="text-center">
//               Enter your email and password to access your account
//             </CardDescription>
//           </CardHeader>
          
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
              
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   name="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   required
//                   disabled={isLoading}
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     name="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Enter your password"
//                     value={formData.password}
//                     onChange={handleInputChange}
//                     required
//                     disabled={isLoading}
//                   />
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                     onClick={() => setShowPassword(!showPassword)}
//                     disabled={isLoading}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <Checkbox
//                   id="rememberMe"
//                   name="rememberMe"
//                   checked={formData.rememberMe}
//                   onCheckedChange={(checked) => 
//                     setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
//                   }
//                   disabled={isLoading}
//                 />
//                 <Label htmlFor="rememberMe" className="text-sm">
//                   Remember me
//                 </Label>
//               </div>
//             </CardContent>
            
//             <CardFooter className="flex flex-col space-y-4">
//               <Button 
//                 type="submit" 
//                 className="w-full" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Signing in...
//                   </>
//                 ) : (
//                   'Sign In'
//                 )}
//               </Button>
              
//               <div className="text-center text-sm text-muted-foreground">
//                 Need access to an account? Please contact your administrator.
//               </div>
//             </CardFooter>
//           </form>
//         </Card>
//       </main>
      
//     </div>
//   )
// }
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/Header'

export default function SignInContent() {
  const router = useRouter()
  const { status } = useSession()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Surface NextAuth error query
  useEffect(() => {
    if (!searchParams) return
    const error = searchParams.get('error')
    
    if (error) {
      switch (error) {
        case 'CredentialsSignin':
          setError('Invalid email or password')
          break
        case 'OAuthAccountNotLinked':
          setError('Please sign in with the originally used provider')
          break
        default:
          setError('Sign in failed. Please try again.')
      }
    }
  }, [searchParams])

  // If already signed in, redirect
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams?.get('callbackUrl')
      router.push(callbackUrl || '/admin')
    }
  }, [status, router, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields')
        return
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address')
        return
      }

      // Sign in with credentials
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        switch (result.error) {
          case 'CredentialsSignin':
            setError('Invalid email or password')
            break
          default:
            setError('Sign in failed. Please try again.')
        }
        return
      }

      // Successful sign-in
      if (result?.url) {
        router.push(result.url)
      } else {
        router.push('/admin')
      }

    } catch (err) {
      console.error('Sign-in error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header hideAuthButtons />
      
      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="text-center text-sm text-muted-foreground">
                Need access to an account? Please contact your administrator.
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}