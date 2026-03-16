import Navbar      from '../components/Navbar'
import Hero        from '../components/Hero'
import Features    from '../components/Features'
import HowItWorks  from '../components/HowItWorks'
import Schedule    from '../components/Schedule'
import WhoWeAre    from '../components/WhoWeAre'
import AuthSection from '../components/AuthSection'
import Footer      from '../components/Footer'

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Schedule />
      <WhoWeAre />
      <AuthSection />
      <Footer />
    </>
  )
}
