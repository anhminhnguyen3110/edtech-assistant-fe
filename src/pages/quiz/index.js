// pages/quiz/index.js
import SimpleLayout from '../../components/layout/simpleLayout'
import AuthorizedLayout from '@/components/layout/AuthorizedLayout'
import { QuizPage } from './client'
export default function Quiz() {
  return (
    <AuthorizedLayout>
      <QuizPage />
    </AuthorizedLayout>
  )
}
