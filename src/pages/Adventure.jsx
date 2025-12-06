import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Adventure.css'

function Adventure() {
  const navigate = useNavigate()
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [missedHearts, setMissedHearts] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [basketPosition, setBasketPosition] = useState(50)
  const [hearts, setHearts] = useState([])
  const gameContainerRef = useRef(null)
  const basketRef = useRef(null)
  const intervalRef = useRef(null)
  const timerRef = useRef(null)
  const animationRef = useRef(null)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (!gameStarted || gameOver || showMessage) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && basketPosition > 5) {
        setBasketPosition(prev => Math.max(5, prev - 5))
      } else if (e.key === 'ArrowRight' && basketPosition < 90) {
        setBasketPosition(prev => Math.min(90, prev + 5))
      }
    }

    const handleTouchStart = (e) => {
      if (showMessage) return
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
      if (showMessage || touchStartX.current === null) return
      e.preventDefault()
      
      const currentX = e.touches[0].clientX
      const screenWidth = window.innerWidth
      const touchPercent = (currentX / screenWidth) * 100
      
      setBasketPosition(Math.max(5, Math.min(90, touchPercent)))
    }

    const handleTouchEnd = () => {
      touchStartX.current = null
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gameStarted, gameOver, basketPosition, showMessage])

  const endGame = () => {
    setGameOver(true)
    if (timerRef.current) clearInterval(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }

  useEffect(() => {
    if (!gameStarted || gameOver || showMessage) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    intervalRef.current = setInterval(() => {
      setHearts(prev => [...prev, {
        id: Date.now() + Math.random(),
        left: Math.random() * 85 + 5,
        top: -50
      }])
    }, 1500)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [gameStarted, gameOver, showMessage])

  useEffect(() => {
    if (!gameStarted || gameOver || showMessage) return

    let lastTime = performance.now()
    const FALL_SPEED = 2

    const moveHearts = (currentTime) => {
      if (showMessage) return
      
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      const moveDistance = (deltaTime / 16) * FALL_SPEED

      setHearts(prev => {
        const basketRect = basketRef.current?.getBoundingClientRect()
        const updated = []
        let caughtCount = 0
        let missedCount = 0

        for (const heart of prev) {
          const newTop = heart.top + moveDistance
          const heartElement = document.getElementById(`heart-${heart.id}`)
          
          if (heartElement && basketRect) {
            const heartRect = heartElement.getBoundingClientRect()
            if (
              heartRect.left < basketRect.right &&
              heartRect.right > basketRect.left &&
              heartRect.bottom > basketRect.top &&
              heartRect.top < basketRect.bottom
            ) {
              caughtCount++
              continue
            }
          }

          if (newTop > window.innerHeight + 50) {
            missedCount++
            continue
          }

          updated.push({ ...heart, top: newTop })
        }

        if (caughtCount > 0) {
          setScore(s => {
            const newScore = s + caughtCount
            if (newScore >= 21 && !showMessage) {
              setShowMessage(true)
            }
            return newScore
          })
        }

        if (missedCount > 0) {
          setMissedHearts(m => {
            const newMissed = m + missedCount
            if (newMissed >= 3) {
              endGame()
            }
            return newMissed
          })
        }

        return updated
      })

      if (!showMessage) {
        animationRef.current = requestAnimationFrame(moveHearts)
      }
    }

    animationRef.current = requestAnimationFrame(moveHearts)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [gameStarted, gameOver, showMessage])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(60)
    setMissedHearts(0)
    setHearts([])
  }

  const restartGame = () => {
    setGameStarted(false)
    setGameOver(false)
    setScore(0)
    setTimeLeft(60)
    setMissedHearts(0)
    setHearts([])
    setShowMessage(false)
  }

  return (
    <div className="adventure-container">
      {!gameStarted && !gameOver && (
        <div className="start-popup">
          <div className="popup-card">
            <h1>Welcome to Heart Collection</h1>
            <p>
              Collect as many hearts as possible before time runs out or you miss 3 hearts.
              Use arrow keys (desktop) or swipe left/right (mobile) to move the basket and catch the falling hearts.
            </p>
            <button className="btn-primary" onClick={startGame}>
              Let's Begin
            </button>
          </div>
        </div>
      )}

      {gameStarted && (
        <>
          <button className="home-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </button>

          <div className="game-stats">
            <div className="stat">Score: {score}</div>
            <div className="stat">Time: {timeLeft}s</div>
          </div>

          <div className="game-area" ref={gameContainerRef}>
            <div
              ref={basketRef}
              className="basket"
              style={{ left: `${basketPosition}%` }}
            >
              <svg width="120" height="60" viewBox="0 0 120 60">
                <path d="M10 50 Q10 10 60 10 Q110 10 110 50 L110 55 Q110 60 105 60 L15 60 Q10 60 10 55 Z" fill="#d4a5c4" stroke="#c99bb0" strokeWidth="2"/>
                <path d="M15 50 L105 50" stroke="#c99bb0" strokeWidth="2"/>
              </svg>
            </div>

            {hearts.map(heart => (
              <div
                key={heart.id}
                id={`heart-${heart.id}`}
                className="heart"
                style={{
                  left: `${heart.left}%`,
                  top: `${heart.top}px`
                }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#e8a4b8">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            ))}
          </div>
        </>
      )}

      {gameOver && (
        <div className="game-over-popup">
          <div className="popup-card">
            <h1>Game Over</h1>
            <p>Your Score: {score}</p>
            <div className="button-group">
              <button className="btn-primary" onClick={restartGame}>
                Play Again
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessage && (
        <div 
          className="message-popup"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMessage(false)
            }
          }}
        >
          <div 
            className="popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h1>Congratulations!</h1>
            <p>
              Happy Birthday, Cho Zin Win! 🎂<br/><br/>
              Those hearts you collected weren't just points—they represent the appreciation from people whose days you've brightened. Your smile, your kindness, your presence—it all matters more than you know.<br/><br/>
              I hope today brings you all your favorite things—good food, wonderful surprises, and people who remind you how loved you are. You deserve every bit of it, and more.
            </p>
            <button 
              className="btn-primary" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMessage(false)
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Adventure

