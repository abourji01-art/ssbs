import { useSearchParams } from 'react-router-dom'
import Navbar      from '../components/Navbar'
import Hero        from '../components/Hero'
import Features    from '../components/Features'
import HowItWorks  from '../components/HowItWorks'
import Schedule    from '../components/Schedule'
import WhoWeAre    from '../components/WhoWeAre'
import AuthSection from '../components/AuthSection'
import Footer      from '../components/Footer'

export default function Landing() {
  const [searchParams] = useSearchParams()
  const authError = searchParams.get('error') === 'auth_failed'
    ? 'Sign-in could not be completed. Please try again.'
    : null

  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Schedule />
      <WhoWeAre />
      <AuthSection initialError={authError} />
      <Footer />
    </>
  )
}
