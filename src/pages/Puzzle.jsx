import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import './Puzzle.css'

const levels = [
  {
    phrase: "MOHINGA",
    instructions: "The superhero of Myanmar breakfast, saving mornings since forever!",
    message: "Perfect! You've unlocked mohinga!"
  },
  {
    phrase: "THOKE",
    instructions: "The mix-everything-and-hope-it's-amazing snack (and it always is)!",
    message: "Excellent! You've solved thoke!"
  },
  {
    phrase: "NGAN",
    instructions: "The flavor that sneaks in and says, 'Surprise! I'm strong!'",
    message: "Wonderful! You've found ngan!"
  },
  {
    phrase: "THADIN",
    instructions: "The smart-energy boost your brain gets without coffee.",
    message: "Amazing! You've discovered thadin!"
  },
  {
    phrase: "THURA",
    instructions: "The hidden power inside you… like a built-in superpower.",
    message: "Congratulations! You've unlocked thura!"
  }
]

function Puzzle() {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [showStartPopup, setShowStartPopup] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showFinalPopup, setShowFinalPopup] = useState(false)
  const [showLoveLetter, setShowLoveLetter] = useState(false)
  const [letters, setLetters] = useState([])
  const [dropZones, setDropZones] = useState([])
  const [placedLetters, setPlacedLetters] = useState({})
  const [isSolved, setIsSolved] = useState(false)
  const [history, setHistory] = useState([])
  const [draggedLetter, setDraggedLetter] = useState(null)
  const [draggedLetterId, setDraggedLetterId] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  const lastPlacedRef = useRef({ letterId: null, timestamp: 0 })

  useEffect(() => {
    initLevel(currentLevel)
  }, [currentLevel])

  const triggerCelebration = () => {
    const duration = 2000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 }

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
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#d4a5c4', '#c99bb0', '#e8a4b8', '#f5e6f0', '#ffb3d9']
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#d4a5c4', '#c99bb0', '#e8a4b8', '#f5e6f0', '#ffb3d9']
      })
    }, 250)

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4a5c4', '#c99bb0', '#e8a4b8', '#f5e6f0', '#ffb3d9']
    })
  }

  useEffect(() => {
    if (dropZones.length === 0 || isSolved) return
    
    const level = levels[currentLevel]
    const allFilled = dropZones.every(zone => zone.letter !== null)
    
    if (allFilled) {
      const userPhrase = dropZones.map(zone => zone.letter || '').join('').toUpperCase()
      
      if (userPhrase === level.phrase) {
        setIsSolved(true)
        triggerCelebration()
        
        setTimeout(() => {
          if (currentLevel === levels.length - 1) {
            setShowFinalPopup(true)
          } else {
            setShowPopup(true)
          }
        }, 500)
      }
    }
  }, [dropZones, currentLevel, isSolved])

  const saveState = () => {
    setHistory(prev => [...prev, {
      letters: JSON.parse(JSON.stringify(letters)),
      dropZones: JSON.parse(JSON.stringify(dropZones))
    }])
  }

  const undo = () => {
    if (history.length === 0) return
    
    const lastState = history[history.length - 1]
    setLetters(lastState.letters)
    setDropZones(lastState.dropZones)
    
    const newPlacedLetters = {}
    lastState.dropZones.forEach((zone, idx) => {
      if (zone.letter) {
        newPlacedLetters[idx] = zone.letter
      }
    })
    setPlacedLetters(newPlacedLetters)
    setIsSolved(false)
    
    setHistory(prev => prev.slice(0, -1))
  }

  const initLevel = (levelIndex) => {
    const level = levels[levelIndex]
    const phrase = level.phrase
    const scrambled = phrase.split('').sort(() => Math.random() - 0.5)
    
    const initialLetters = scrambled.map((letter, idx) => ({ id: idx, letter, used: false }))
    const initialDropZones = Array(phrase.length).fill(null).map((_, idx) => ({ id: idx, letter: null }))
    
    setLetters(initialLetters)
    setDropZones(initialDropZones)
    setPlacedLetters({})
    setIsSolved(false)
    setHistory([{ letters: initialLetters, dropZones: initialDropZones }])
  }

  const placeLetter = (letter, letterId, zoneId) => {
    if (dropZones[zoneId]?.letter) return
    if (zoneId === null || zoneId === undefined) return

    saveState()

    setDropZones(prev => {
      const updated = [...prev]
      updated[zoneId] = { ...updated[zoneId], letter }
      return updated
    })

    setLetters(prev => prev.map(l => l.id === letterId ? { ...l, used: true } : l))
    setPlacedLetters(prev => ({ ...prev, [zoneId]: letter }))
  }

  const handleLetterClick = (e, letter, letterId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const now = Date.now()
    if (lastPlacedRef.current.letterId === letterId && 
        now - lastPlacedRef.current.timestamp < 300) {
      return
    }
    
    const letterItem = letters.find(l => l.id === letterId)
    if (!letterItem || letterItem.used) {
      return
    }
    
    const firstEmptyZoneIndex = dropZones.findIndex(zone => !zone.letter)
    if (firstEmptyZoneIndex !== -1) {
      lastPlacedRef.current = { letterId, timestamp: now }
      placeLetter(letter, letterId, firstEmptyZoneIndex)
    }
  }

  const handleDragStart = (e, letter, letterId) => {
    e.dataTransfer.setData('letter', letter)
    e.dataTransfer.setData('letterId', letterId.toString())
    e.dataTransfer.effectAllowed = 'move'
    setDraggedLetter(letter)
    setDraggedLetterId(letterId)
    setDraggedElement(e.target)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, zoneId) => {
    e.preventDefault()
    e.stopPropagation()
    
    const letter = e.dataTransfer.getData('letter')
    const letterId = parseInt(e.dataTransfer.getData('letterId'))
    
    if (letter && !isNaN(letterId)) {
      placeLetter(letter, letterId, zoneId)
    }
    
    setDraggedLetter(null)
    setDraggedLetterId(null)
    setDraggedElement(null)
  }

  const handleTouchStart = (e, letter, letterId) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggedLetter(letter)
    setDraggedLetterId(letterId)
    setDraggedElement(e.currentTarget)
    e.currentTarget.style.opacity = '0.5'
    
    const moveHandler = (moveEvent) => {
      moveEvent.preventDefault()
      const touch = moveEvent.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      
      document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over')
      })
      
      if (element) {
        const dropZone = element.closest('.drop-zone')
        if (dropZone) {
          dropZone.classList.add('drag-over')
        }
      }
    }
    
    const endHandler = (endEvent) => {
      endEvent.preventDefault()
      endEvent.stopPropagation()
      const touch = endEvent.changedTouches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      
      if (element) {
        const dropZone = element.closest('.drop-zone')
        if (dropZone) {
          const zoneId = parseInt(dropZone.dataset.zoneId)
          if (!isNaN(zoneId)) {
            placeLetter(letter, letterId, zoneId)
          }
        }
      }
      
      document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over')
      })
      
      if (e.currentTarget) {
        e.currentTarget.style.opacity = '1'
      }
      
      setDraggedLetter(null)
      setDraggedLetterId(null)
      setDraggedElement(null)
      
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', endHandler)
    }
    
    document.addEventListener('touchmove', moveHandler, { passive: false })
    document.addEventListener('touchend', endHandler, { once: true })
  }

  const nextLevel = () => {
    setShowPopup(false)
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(prev => prev + 1)
    }
  }

  const skipLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(prev => prev + 1)
    }
  }

  const revealMessage = () => {
    setShowFinalPopup(false)
    setShowLoveLetter(true)
  }

  const startGame = () => {
    setShowStartPopup(false)
    setShowInstructions(true)
  }

  const level = levels[currentLevel]

  return (
    <div className="puzzle-container">
      {showStartPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h1>Welcome to Puzzle Quest</h1>
            <p>Drag and drop the scrambled letters into the correct order to solve each puzzle. Complete all levels to unlock a special message!</p>
            <button className="btn-primary" onClick={startGame}>
              Let's Play
            </button>
          </div>
        </div>
      )}

      <button className="home-btn" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Home
      </button>

      {showInstructions && (
        <div className="puzzle-content">
          <div className="level-indicator">Level {currentLevel + 1} of {levels.length}</div>
          
          <div className="instructions-box">
            <p>{level.instructions}</p>
          </div>

          <div className="puzzle-controls">
            <button 
              className="btn-control" 
              onClick={undo} 
              disabled={history.length <= 1}
              title="Undo last move"
            >
              ↶ Undo
            </button>
          </div>

          <div className="puzzle-area">
            <div className="letters-section">
              <h3>Letters</h3>
              <div className="letters-grid">
                {letters.map((item) => (
                  !item.used && (
                    <div
                      key={item.id}
                      className="letter clickable"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.letter, item.id)}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleLetterClick(e, item.letter, item.id)
                      }}
                      onClick={(e) => {
                        if (e.type === 'click' && e.detail === 0) {
                          return
                        }
                        handleLetterClick(e, item.letter, item.id)
                      }}
                      data-letter-id={item.id}
                    >
                      {item.letter}
                    </div>
                  )
                ))}
              </div>
            </div>

            <div className="drop-zones-section">
              <h3>Arrange Here</h3>
              <div className="drop-zones-grid">
                {dropZones.map((zone, idx) => (
                  <div
                    key={zone.id}
                    className={`drop-zone ${zone.letter ? 'filled' : ''} ${isSolved ? 'solved' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    data-zone-id={idx}
                  >
                    {zone.letter}
                  </div>
                ))}
              </div>
              {isSolved && (
                <div className="solved-indicator">
                  <span className="sparkle">✨</span>
                  <span>Solved!</span>
                  <span className="sparkle">✨</span>
                </div>
              )}
            </div>
          </div>

          <button className="btn-secondary skip-btn" onClick={currentLevel === levels.length - 1 ? revealMessage : skipLevel}>
            {currentLevel === levels.length - 1 ? 'Reveal Message' : 'Skip Level'}
          </button>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-card celebration-popup">
            <div className="celebration-content">
              <div className="sparkle-burst">✨</div>
              <h1>Congratulations!</h1>
              <p>{level.message}</p>
              <button className="btn-primary" onClick={nextLevel}>
                Next Level →
              </button>
            </div>
          </div>
        </div>
      )}

      {showFinalPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h1>Amazing!</h1>
            <p>You've completed all puzzles! Ready to see your special message?</p>
            <button className="btn-primary" onClick={revealMessage}>
              Reveal Message
            </button>
          </div>
        </div>
      )}

      {showLoveLetter && (
        <div className="popup-overlay">
          <div className="popup-card love-letter">
            <h1>A Special Message for You</h1>
            <div className="letter-content">
              <p>
                Dear Cho Zin Win,<br/><br/>
                Happy Birthday! 🎉<br/><br/>
                From the moment we met, life has been brighter, funnier, and more meaningful. You have a rare gift for turning ordinary moments into beautiful memories and for making everyone around you feel seen and valued.<br/><br/>
                Your kindness, your laughter, your strength—all of it makes you truly special. I hope today reminds you of how loved and appreciated you are.<br/><br/>
                Here's to more wonderful moments, exciting adventures, and all the joy you bring to the world.<br/><br/>
                With love,<br/>
                Your friend
              </p>
            </div>
            <div className="button-group">
              <button className="btn-primary" onClick={() => navigate('/')}>
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Puzzle

