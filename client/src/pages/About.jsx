import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Waves from '../components/ui/waves-background'
import { GlowingEffectDemo } from '../components/ui/glowing-effect-demo'
import ParallaxFadeIn from '../components/ui/parallax-fadein'
import ContactSection from '../components/ui/ContactSection';

export default function About() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#contact") {
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);
  return (
    <div className='pt-0 px-0 w-full'>
      <ParallaxFadeIn y={60}>
        <div className="relative w-full h-[300px] mb-10 rounded-none overflow-hidden">
          <Waves
            lineColor="#000"
            backgroundColor="transparent"
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />
        </div>
      </ParallaxFadeIn>
      <div className='max-w-6xl mx-auto px-4'>
        <ParallaxFadeIn y={40} delay={0.05}>
          <h1 className='text-3xl font-bold mb-4 text-slate-800'>About CasaConnect</h1>
        </ParallaxFadeIn>
        <ParallaxFadeIn y={40} delay={0.1}>
          <p className='mb-4 text-slate-700'>CasaConnect is a leading real estate agency that specializes in helping clients buy, sell, and rent properties in the most desirable neighborhoods. Our team of experienced agents is dedicated to providing exceptional service and making the buying and selling process as smooth as possible.</p>
        </ParallaxFadeIn>
        <ParallaxFadeIn y={40} delay={0.15}>
          <p className='mb-4 text-slate-700'>
            Our mission is to help our clients achieve their real estate goals by providing expert advice, personalized service, and a deep understanding of the local market. Whether you are looking to buy, sell, or rent a property, we are here to help you every step of the way.
          </p>
        </ParallaxFadeIn>
        <ParallaxFadeIn y={40} delay={0.2}>
          <p className='mb-4 text-slate-700'>Our team of agents has a wealth of experience and knowledge in the real estate industry, and we are committed to providing the highest level of service to our clients. We believe that buying or selling a property should be an exciting and rewarding experience, and we are dedicated to making that a reality for each and every one of our clients.</p>
        </ParallaxFadeIn>
        <ParallaxFadeIn y={40} delay={0.3}>
          <div className="mt-12">
            <GlowingEffectDemo />
          </div>
        </ParallaxFadeIn>
        <div id="contact" className="mt-16">
          <ContactSection />
        </div>
      </div>
    </div>
  )
}
