'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { handleApiError } from '@/lib/error-handler'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QuestionEditor from '@/components/question-editor'
import QuestionBank from '@/components/question-bank'
import SurveyPreview from '@/components/survey-preview'

interface Survey {
  id: string
  title: string
  description: string
  questions: Array<{
    id: string
    type: string
    question: string
    options?: string[]
    required?: boolean
    min?: number
    max?: number
  }>
  status: string
}

export default function EditSurveyPage({ params }: { params: { id: string } }) {
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchSurvey()
  }, [params.id])

  const fetchSurvey = async () => {
    try {
      const response = await apiClient.getSurvey(params.id)
      setSurvey(response.data.survey)
    } catch (error) {
      handleApiError(error)
      setError('Failed to fetch survey')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSurvey = async (updatedSurvey: Partial<Survey>) => {
    try {
      const response = await apiClient.updateSurvey(params.id, updatedSurvey)
      setSurvey(response.data.survey)
    } catch (error) {
      handleApiError(error)
      setError('Failed to update survey')
    }
  }

  const handlePublish = async () => {
    try {
      await apiClient.publishSurvey(params.id)
      router.push('/surveys')
    } catch (error) {
      handleApiError(error)
      setError('Failed to publish survey')
    }
  }

  // Original mock implementation (commented out)
  /*
  const handlePublish = () => {
    // Save the survey to localStorage
    const surveys = JSON.parse(localStorage.getItem("surveys") || "[]")
    const surveyIndex = surveys.findIndex((s: any) => s.id === params.id)
    
    if (surveyIndex !== -1) {
      surveys[surveyIndex] = {
        ...surveys[surveyIndex],
        status: "active",
        published_at: new Date().toISOString()
      }
      localStorage.setItem("surveys", JSON.stringify(surveys))
      router.push("/surveys")
    }
  }
  */

  if (isLoading) {
    return <div>Loading survey...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!survey) {
    return <div>Survey not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handlePublish}>
            Publish Survey
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Question Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {survey.questions.map((question) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  onChange={(updatedQuestion) => {
                    const updatedQuestions = survey.questions.map((q) =>
                      q.id === updatedQuestion.id ? updatedQuestion : q
                    )
                    handleUpdateSurvey({ questions: updatedQuestions })
                  }}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Bank</CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionBank
                onAddQuestion={(question) => {
                  handleUpdateSurvey({
                    questions: [...survey.questions, question]
                  })
                }}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <SurveyPreview
              title={survey.title}
              description={survey.description}
              questions={survey.questions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 