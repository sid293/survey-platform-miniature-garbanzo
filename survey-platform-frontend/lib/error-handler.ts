import { toast } from "@/hooks/use-toast"

export const handleApiError = (error: any) => {
  // Log the full error object for debugging
  console.error('API Error:', error)
  
  // Extract error message
  const errorMessage = error.message || 'An unexpected error occurred'
  console.log("Error message:", errorMessage)

  // Check for authentication errors
  if (errorMessage.toLowerCase().includes('authentication required') || 
      errorMessage.toLowerCase().includes('unauthorized') ||
      errorMessage.toLowerCase().includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
    return
  }

  // Show error toast for other errors
  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive"
  })
} 