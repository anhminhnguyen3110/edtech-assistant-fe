import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  Snackbar,
  Stack,
  Alert,
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import api from '@/lib/api'
import { useRouter } from 'next/router'
import MessageBox from '@/components/box/messageBox'
import ButtonComponent from '@/components/button/buttonComponent'
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CommonIssueList from '@/components/classAssignmentPage/commonIssueList'
import LessonList from '@/components/classAssignmentPage/lessonList'
import QuizList from '@/components/classAssignmentPage/quizList'
import NotificationSnackbar from '@/components/snackBar/notificationSnackbar'
import GenerateQuizModal from '@/components/classAssignmentPage/generateQuizModal'
import GenerateLessonModal from '@/components/classAssignmentPage/generateLessonModal'
import QuestionMarkIcon from '@mui/icons-material/QuestionMark'
import { useAuth } from '@/context/authContext'
import { io } from 'socket.io-client'
import FeatureModal from '@/components/classAssignmentPage/FeatureModal'

const ClassAssignmentDetail = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('info')
  const [snackbarNotif, setSnackbarNotifMessage] = useState('')
  const [snackbarNotifSeverity, setSnackbarNotifSeverity] = useState('')
  const [snackbarNotifOpen, setSnackbarNotifOpen] = useState(false)
  const [reloadQuiz, setReloadQuiz] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [classAssignment, setClassAssignment] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const [openGenerateQuizModal, setOpenGenerateQuizModal] = useState(false)
  const [openGenerateLessonModal, setOpenGenerateLessonModal] = useState(false)
  const router = useRouter()
  const { assignmentId, classAssignmentId } = router.query
  const { accessToken } = useAuth()
  const socket = useRef(null)
  const [isOpenFeatureModal, setIsOpenFeatureModal] = useState(false)

  const handleOpenFeatureModal = () => {
    setIsOpenFeatureModal(true)
  }

  const handleCloseFeatureModal = () => {
    setIsOpenFeatureModal(false)
  }

  const handleBackClick = () => {
    router.push(`/assignment/${assignmentId}`)
  }

  useEffect(() => {
    if (assignmentId && classAssignmentId && !initialized) {
      fetchClassAssessment(classAssignmentId)
      setInitialized(true)
    }
  }, [assignmentId, classAssignmentId, initialized])

  const fetchClassAssessment = async (id) => {
    setLoading(true)
    setError(false)
    try {
      const response = await api.get(`/classAssignments/${id}`, { authRequired: true })
      const classAssignmentData = response.data
      console.log('Class Assignment data:', classAssignmentData)
      setClassAssignment(classAssignmentData)
    } catch (error) {
      console.error('Error fetching assignment data:', error)
      setError(true)
      const message = error.response?.data?.message || 'Failed to fetch assignment data.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseQuizModal = () => {
    setOpenGenerateQuizModal(false)
  }

  const handleOpenQuizModal = () => {
    setOpenGenerateQuizModal(true)
  }

  const handleCloseLessonModal = () => {
    setOpenGenerateLessonModal(false)
  }

  const handleOpenLessonModal = () => {
    setOpenGenerateLessonModal(true)
  }

  const handleGenerateQuiz = async (prompt, multipleChoice, trueFalse, multipleAnswer) => {
    try {
      const response = await api.post(
        `/quizzes/generate`,
        {
          classAssignmentId: parseInt(classAssignmentId),
          prompt: prompt,
          numberOfMultipleChoiceQuestions: multipleChoice,
          numberOfTrueFalseQuestions: trueFalse,
          numberOfMultipleAnswerQuestions: multipleAnswer,
        },
        { authRequired: true }
      )
      if (response.status === 201) {
        const message = response.data.message
        setSnackbarNotifMessage(message)
        setSnackbarNotifSeverity('info')
        setSnackbarNotifOpen(true)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate quiz.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }
  const handleGenerateLesson = async (name, prompt) => {
    console.log('Generating lesson...')
    console.log('Name:', name)
    console.log('Prompt:', prompt)
    try {
      const response = await api.post(
        `/lessons`,
        {
          classAssignmentId: parseInt(classAssignmentId),
          name: name,
          prompt: prompt,
        },
        { authRequired: true }
      )
      if (response.status === 200) {
        const message = response.data.message
        setSnackbarNotifMessage(message)
        setSnackbarNotifSeverity('info')
        setSnackbarNotifOpen(true)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate lesson.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handelExtractIssue = async () => {
    const classAssignmentIdInt = parseInt(classAssignmentId)

    // Check if the request was made recently by retrieving the stored data from localStorage
    const storedData = localStorage.getItem(`extractIssue_${classAssignmentIdInt}`)
    const currentTime = new Date().getTime() // Get current time in milliseconds

    if (storedData) {
      const { timestamp } = JSON.parse(storedData)
      const elapsedTime = (currentTime - timestamp) / (1000 * 60) // Convert elapsed time to minutes

      // If the request was made less than 10 minutes ago, set an error and return
      if (elapsedTime < 10) {
        setSnackbarNotifMessage('Extracting is in progress try again after 10 minutes.')
        setSnackbarNotifSeverity('error')
        setSnackbarNotifOpen(true)
        return
      }
    }

    try {
      const response = await api.post(
        `/issues/extract-issues`,
        {
          classAssignmentId: classAssignmentIdInt,
        },
        { authRequired: true }
      )

      if (response.status === 200) {
        const extractIssue = response?.data || {} // Ensure response and response.data are both defined
        console.log('Extract Issue:', extractIssue)
        const message =
          response?.data?.message || 'Request successfully sent. Please wait for the result.'

        // Store the classAssignmentId and current timestamp in localStorage
        localStorage.setItem(
          `extractIssue_${classAssignmentIdInt}`,
          JSON.stringify({ timestamp: currentTime, classAssignmentId: classAssignmentIdInt })
        )

        setSnackbarNotifMessage(message)
        setSnackbarNotifSeverity('info')
        setSnackbarNotifOpen(true)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to extract issue.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handleEditIssue = async (editedIssue) => {
    console.log('Edited issue:', editedIssue)
    const { studentRate, ...issueWithoutStudentRate } = editedIssue

    try {
      const response = await api.put(`/issues/${editedIssue.id}`, issueWithoutStudentRate, {
        authRequired: true,
      })
      if (response.status === 200) {
        const updatedIssue = response.data
        setClassAssignment((prev) => ({
          ...prev,
          issues: prev.issues.map((issue) =>
            issue.id === editedIssue.id
              ? { ...updatedIssue, studentRate: updatedIssue.studentRate }
              : issue
          ),
        }))
        setSnackbarNotifMessage('Issue updated successfully!')
        setSnackbarNotifSeverity('success')
        setSnackbarNotifOpen(true)
      }
    } catch (error) {
      console.error('Failed to update the issue:', error)
      setSnackbarNotifMessage('Error while updating the issue!')
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  useEffect(() => {
    if (!accessToken) {
      return
    }

    socket.current = io(process.env.NEXT_PUBLIC_NOTIFICATION_WEB_SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: `${accessToken}`,
      },
    })

    socket.current.on('connect', () => {
      console.log('Socket connected successfully')
    })

    socket.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    socket.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
    })

    const successEventTypes = [
      'EXTRACT_ISSUE_SUCCESS',
      'GENERATE_LESSON_SUCCESS',
      'GENERATE_QUIZ_SUCCESS',
    ]

    successEventTypes.forEach((eventType) => {
      socket.current.on(eventType, (data) => {
        if (data.classAssignmentId !== parseInt(classAssignmentId)) {
          return
        }
        console.log(`Received event: ${eventType}`, data)
        if (eventType === 'GENERATE_LESSON_SUCCESS' || eventType === 'EXTRACT_ISSUE_SUCCESS') {
          fetchClassAssessment(classAssignmentId)
        }
        if (eventType === 'GENERATE_QUIZ_SUCCESS') {
          setReloadQuiz(true)
          return
        }
      })
    })

    return () => {
      successEventTypes.forEach((eventType) => {
        socket.current.off(eventType)
      })
      socket.current.disconnect()
    }
  }, [accessToken, classAssignmentId])

  const handleDeleteIssue = async (issueId) => {
    try {
      const response = await api.delete(`/issues/${issueId}`, { authRequired: true })
      if (response.status === 200) {
        setClassAssignment((prev) => ({
          ...prev,
          issues: prev.issues.filter((issue) => issue.id !== issueId),
        }))
        setSnackbarNotifMessage('Deleted issue successfully!')
        setSnackbarNotifSeverity('success')
        setSnackbarNotifOpen(true)
      }
    } catch (error) {
      console.error('Failed to delete the issue:', error)
      setSnackbarNotifMessage('Fail to delete the issue!')
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handleEditLesson = async (editedLesson) => {
    console.log('Edited lesson:', editedLesson)

    try {
      const response = await api.put(
        `/lessons/${editedLesson.id}`,
        {
          name: editedLesson.name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          authRequired: true,
        }
      )

      if (response.status === 200) {
        editedLesson.fileUrl = response.data.fileUrl
        setClassAssignment((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) =>
            lesson.id === editedLesson.id ? editedLesson : lesson
          ),
        }))
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update lesson.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    console.log('Delete lesson:', lessonId)
    try {
      const response = await api.delete(`/lessons/${lessonId}`, { authRequired: true })
      if (response.status === 200) {
        setClassAssignment((prev) => ({
          ...prev,
          lessons: prev.lessons.filter((lesson) => lesson.id !== lessonId),
        }))
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete lesson.'
      setSnackbarNotifMessage(message)
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handleAddIssue = async (newIssue) => {
    newIssue.classAssignmentId = parseInt(classAssignmentId)
    console.log('New issue:', newIssue)
    try {
      const response = await api.post(`/issues`, newIssue, { authRequired: true })
      if (response.status === 201) {
        const createdIssue = response.data
        setClassAssignment((prev) => ({
          ...prev,
          issues: [...prev.issues, createdIssue],
        }))
      }
    } catch (error) {
      if (error.response.status === 400) {
        setSnackbarNotifMessage(error.response.data.message)
        setSnackbarNotifSeverity('error')
        setSnackbarNotifOpen(true)
        return
      }
      console.error('Failed to add the issue:', error)
      setSnackbarNotifMessage('Failed to add the issue!')
      setSnackbarNotifSeverity('error')
      setSnackbarNotifOpen(true)
    }
  }

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarOpen(false)
  }

  const handleCloseNotifSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setSnackbarNotifOpen(false)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs="auto">
            <IconButton sx={{ mr: 1 }} onClick={handleBackClick}>
              <ArrowBackIosIcon />
            </IconButton>
          </Grid>
          <Grid item xs>
            <Typography
              variant="h6" // Use a smaller variant for better text scaling on small screens
              component="h1"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
            >
              Class {classAssignment ? classAssignment.name : 'Assignment Details'}
            </Typography>
          </Grid>
          {classAssignment && classAssignment.issues.length > 0 && (
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' }, // Stack buttons vertically on small screens
                  justifyContent: { xs: 'center', sm: 'flex-start' }, // Center buttons on small screens
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: { xs: 'center', sm: 'left' }, // Center text on small screens
                }}
              >
                <ButtonComponent
                  onClick={handleOpenQuizModal}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <VideogameAssetIcon />
                  Generate Quiz
                </ButtonComponent>
                <ButtonComponent
                  onClick={handleOpenLessonModal}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <AutoAwesomeIcon />
                  Generate Lesson
                </ButtonComponent>
              </Box>
            </Grid>
          )}
          {classAssignment && classAssignment.issues.length === 0 && (
            <Grid item xs={12} sm="auto">
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' }, // Stack buttons vertically on small screens
                  justifyContent: { xs: 'center', sm: 'flex-start' }, // Center buttons on small screens
                  alignItems: 'center',
                  gap: '10px',
                  textAlign: { xs: 'center', sm: 'left' }, // Center text on small screens
                }}
              >
                <ButtonComponent
                  onClick={handelExtractIssue}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <AutoAwesomeIcon />
                  Extract Issue
                </ButtonComponent>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <MessageBox message="No class assignment found." />
      ) : (
        <Box>
          <Stack display="column" spacing={5}>
            <CommonIssueList
              issues={classAssignment.issues}
              maxAssignments={classAssignment.totalAssessment}
              onEditIssue={handleEditIssue}
              onDeleteIssue={handleDeleteIssue}
              onAddIssue={handleAddIssue}
            />
            <LessonList
              lessons={classAssignment.lessons}
              onEditLesson={handleEditLesson}
              onDeleteLesson={handleDeleteLesson}
            />
            <QuizList
              classAssignmentId={classAssignmentId}
              reload={reloadQuiz}
              setReload={setReloadQuiz}
            />
          </Stack>
        </Box>
      )}
      <GenerateQuizModal
        open={openGenerateQuizModal}
        handleClose={handleCloseQuizModal}
        generateQuiz={handleGenerateQuiz}
      />
      <GenerateLessonModal
        open={openGenerateLessonModal}
        handleClose={handleCloseLessonModal}
        generateLesson={handleGenerateLesson}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ bottom: '400px', zIndex: 1400 }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <NotificationSnackbar
        open={snackbarNotifOpen}
        message={snackbarNotif}
        type={snackbarNotifSeverity}
        onClose={handleCloseNotifSnackbar}
      />
      <FeatureModal open={isOpenFeatureModal} handleClose={handleCloseFeatureModal} />
      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: 'background.paper',
          boxShadow: 3,
          padding: 1.4,
          '&:hover': {
            bgcolor: 'background.paper', // Keeps the background color the same on hover
          },
        }}
        onClick={() => {
          handleOpenFeatureModal()
        }}
      >
        <QuestionMarkIcon sx={{ fontSize: '2rem' }} />
      </IconButton>
    </Box>
  )
}

export default ClassAssignmentDetail
