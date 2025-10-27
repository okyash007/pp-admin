import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page. This area is restricted to administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Your current role doesn't have the necessary permissions to view this content.</p>
            <p className="mt-2">Please contact your administrator if you believe this is an error.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
