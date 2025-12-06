import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import './Celebration.css'

function Celebration() {
  const navigate = useNavigate()
  const [confettiFired, setConfettiFired] = useState(false)

  useEffect(() => {
    if (!confettiFired) {
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      setConfettiFired(true)

      return () => clearInterval(interval)
    }
  }, [confettiFired])

  return (
    <div className="celebration-container">
      <div className="celebration-content">
        <h1 className="celebration-title">Happy Birthday</h1>
        <h2 className="celebration-name">Cho Zin Win</h2>
        
        <div className="message-box">
          <p className="message-text">
            From your friend,<br/><br/>
            
            How are you managing to get more wonderful every year? Today is YOUR day, and I hope you feel as loved, appreciated, and celebrated as you truly are. You're not just someone who exists in people's lives—you make an actual difference. You bring joy, kindness, and a beautiful mix of warmth and wisdom wherever you go.<br/><br/>
            
            Cho Zin Win, please remember you don't have to carry the whole world on your shoulders all the time. You're allowed to rest. You're allowed to say "not today" and just take care of yourself. Stress is sneaky, but you're stronger—and you deserve peace just as much as you deserve happiness. So please take care of yourself, even on the days when it feels like you have to do everything. You don't. We're here for you.<br/><br/>
            
            You've unlocked something truly magical today! This is just the beginning of an incredible journey filled with endless possibilities. Every step you take brings you closer to your dreams, and every moment you share adds a little sparkle to the world. Remember, life is a beautiful adventure, and you're the star of your own story. Keep shining bright, spreading happiness wherever you go, and embracing every challenge with courage and grace.<br/><br/>
            
            The future is yours to shape, and we can't wait to see all the amazing things you'll accomplish. Here's to a year full of joy, laughter, love, and unforgettable memories! May your heart be filled with gratitude for the past, excitement for the present, and hope for the future. You are loved beyond measure, and your kindness makes the world a better place. So go ahead, dream big, and let your light shine!<br/><br/>
            
            Happy birthday, Cho Zin Win! 🎂✨
          </p>
        </div>

        <button className="btn-primary" onClick={() => navigate('/')}>
          Start Over
        </button>
      </div>
    </div>
  )
}

export default Celebration

