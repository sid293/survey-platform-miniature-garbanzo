"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  PlusCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
  BarChart3,
  Eye,
  Copy,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/error-handler'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Survey {
  id: string
  title: string
  description: string
  status: string
  questions_count: number
  responses_count: number
  created_at: string
  updated_at: string
  published_at?: string
}

export default function SurveysPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const { toast } = useToast()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      console.log("fetch surveys start: ")
      const response = await apiClient.getSurveys()
      console.log("response for surveys: ",response)
      setSurveys(response.data.surveys)
    } catch (error) {
      handleApiError(error)
      setError('Failed to fetch surveys')
    } finally {
      setLoading(false)
    }
  }

  // Original mock implementation (commented out)
  /*
  const [allSurveys, setAllSurveys] = useState([
    {
      id: "1",
      title: "Product Satisfaction Survey",
      description: "Help us improve our products",
      status: "active",
      questions_count: 5,
      responses_count: 42,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2023-01-15T11:00:00Z",
      published_at: "2023-01-15T11:00:00Z"
    }
  ])
  */

  // Filter surveys based on active tab
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleSelectSurvey = (id: string) => {
    setSelectedSurveys((prev) => (prev.includes(id) ? prev.filter((surveyId) => surveyId !== id) : [...prev, id]))
  }

  const selectAllSurveys = () => {
    if (selectedSurveys.length === filteredSurveys.length) {
      setSelectedSurveys([])
    } else {
      setSelectedSurveys(filteredSurveys.map((survey) => survey.id))
    }
  }

  const deleteSurvey = async (id: string) => {
    try {
      await apiClient.deleteSurvey(id)
      // Remove from state
      const updatedSurveys = surveys.filter((survey) => survey.id !== id)
      setSurveys(updatedSurveys)
      setSelectedSurveys(selectedSurveys.filter((surveyId) => surveyId !== id))

      toast({
        title: "Survey Deleted",
        description: "The survey has been permanently deleted.",
      })
    } catch (error) {
      handleApiError(error)
    }
  }

  const deleteSelectedSurveys = async () => {
    try {
      // Delete each selected survey
      await Promise.all(selectedSurveys.map(id => apiClient.deleteSurvey(id)))
      
      // Remove from state
      const updatedSurveys = surveys.filter((survey) => !selectedSurveys.includes(survey.id))
      setSurveys(updatedSurveys)
      setSelectedSurveys([])

      toast({
        title: "Surveys Deleted",
        description: `${selectedSurveys.length} surveys have been permanently deleted.`,
      })
    } catch (error) {
      handleApiError(error)
    }
  }

  const duplicateSurvey = async (id: string) => {
    try {
      const surveyToDuplicate = surveys.find((survey) => survey.id === id)
      if (!surveyToDuplicate) return

      const newSurvey = {
        title: `${surveyToDuplicate.title} (Copy)`,
        description: surveyToDuplicate.description,
        questions: [] // You'll need to fetch the questions if needed
      }

      const response = await apiClient.createSurvey(newSurvey)
      
      // Update state with the new survey
      setSurveys([...surveys, response.data.survey])

      toast({
        title: "Survey Duplicated",
        description: "A copy of the survey has been created as a draft.",
      })
    } catch (error) {
      handleApiError(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading surveys...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Surveys</h1>
          <p className="text-muted-foreground mt-1">Manage and analyze all your surveys</p>
        </div>
        <Link href="/surveys/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Survey
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search surveys..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Checkbox id="status-active" className="mr-2" />
                <label htmlFor="status-active">Active</label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Checkbox id="status-draft" className="mr-2" />
                <label htmlFor="status-draft">Draft</label>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Checkbox id="status-completed" className="mr-2" />
                <label htmlFor="status-completed">Completed</label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select defaultValue="newest">
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="responses-high">Most Responses</SelectItem>
              <SelectItem value="responses-low">Least Responses</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList>
          <TabsTrigger value="all">All Surveys</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedSurveys.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedSurveys.length === filteredSurveys.length}
              onCheckedChange={selectAllSurveys}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              {selectedSurveys.length} selected
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteSelectedSurveys}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {filteredSurveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No surveys found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            We couldn't find any surveys matching your search. Try adjusting your filters or create a new survey.
          </p>
          <Link href="/surveys/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSurveys.map((survey) => (
            <Card key={survey.id}>
              <CardHeader>
                <CardTitle>{survey.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{survey.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{survey.questions_count} questions</span>
                  <span>{survey.responses_count} responses</span>
                </div>
                <div className="mt-4 flex justify-between">
                  <Link href={`/surveys/${survey.id}/edit`}>
                    <Button variant="outline">View</Button>
                  </Link>
                  <Link href={`/surveys/${survey.id}/responses`}>
                    <Button variant="outline">Responses</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredSurveys.length}</strong> of <strong>{surveys.length}</strong> surveys
        </div>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
