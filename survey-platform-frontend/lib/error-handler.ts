import { toast } from "@/hooks/use-toast"

export const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    return
  }

  toast({
    title: "Error",
    description: error.message || "Something went wrong. Please try again.",
    variant: "destructive"
  })
} 