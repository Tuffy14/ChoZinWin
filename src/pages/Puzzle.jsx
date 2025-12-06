import { useState, useEffect, useCallback } from 'react'
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
    instructions: "The mix-everything-and-hope-it-is-amazing snack (and it always is)!",
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

// State to store the history of moves for the Undo button
let moveHistory = []

function Puzzle() {
  const navigate = useNavigate()
  const [currentLevel, setCurrentLevel] = useState(0)
  const [showStartPopup, setShowStartPopup] = useState(true)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [showFinalPopup, setShowFinalPopup] = useState(false)
  const [showLoveLetter, setShowLoveLetter] = useState(false)
  
  // Game State
  const [letters, setLetters] = useState([])
  const [dropZones, setDropZones] = useState([])
  const [isSolved, setIsSolved] = useState(false)

  // Use useCallback for stable function references
  const initLevel = useCallback((levelIndex) => {
    const level = levels[levelIndex]
    const phrase = level.phrase
    // Create letter objects with unique IDs
    const scrambled = phrase.split('')
      .map((letter, idx) => ({ id: idx, letter, used: false }))
      .sort(() => Math.random() - 0.5)
    
    setLetters(scrambled)
    // Dropzones track the letter's content and its unique sourceId
    setDropZones(Array(phrase.length).fill(null).map((_, idx) => ({ id: idx, letter: null, sourceId: null })))
    setIsSolved(false)
    moveHistory = [] // Reset history for new level
    setShowErrorPopup(false)
    setShowSuccessPopup(false)
  }, [])

  useEffect(() => {
    initLevel(currentLevel)
  }, [currentLevel, initLevel])

  // --- Move Management ---
  const recordMove = (type, zoneId, letterId, letter) => {
    moveHistory.push({ type, zoneId, letterId, letter })
  }

  const undoLastMove = () => {
    if (moveHistory.length === 0) return

    const lastMove = moveHistory.pop()
    setShowErrorPopup(false) // Hide error popup if undoing a wrong attempt

    if (lastMove.type === 'place') {
      // 1. Mark the letter as unused in the pool
      setLetters(prev => prev.map(l => 
        l.id === lastMove.letterId ? { ...l, used: false } : l
      ))

      // 2. Clear the drop zone
      setDropZones(prev => {
        const updated = [...prev]
        updated[lastMove.zoneId] = { ...updated[lastMove.zoneId], letter: null, sourceId: null }
        return updated
      })
    }
  }

  const placeLetterInZone = (letter, letterId, zoneId) => {
    const sourceLetter = letters.find(l => l.id === letterId)
    if (sourceLetter && sourceLetter.used) return // Prevent placing an already used letter

    if (dropZones[zoneId].letter) return // Zone already full

    // Record the move BEFORE applying it
    recordMove('place', zoneId, letterId, letter)

    // 1. Update Drop Zone
    setDropZones(prev => {
      const updated = [...prev]
      updated[zoneId] = { ...updated[zoneId], letter, sourceId: letterId }
      return updated
    })

    // 2. Mark Letter as Used
    setLetters(prev => prev.map(l => 
      l.id === letterId ? { ...l, used: true } : l
    ))
  }

  // --- Interaction Handlers ---
  const handleDragStart = (e, letter, letterId) => {
    e.dataTransfer.setData('letter', letter)
    e.dataTransfer.setData('letterId', letterId.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e, zoneId) => {
    e.preventDefault()
    const letter = e.dataTransfer.getData('letter')
    const letterId = parseInt(e.dataTransfer.getData('letterId'))

    placeLetterInZone(letter, letterId, zoneId)
  }

  const handleLetterClick = (letter, letterId) => {
    // Find first empty zone
    const firstEmptyIndex = dropZones.findIndex(z => z.letter === null)
    if (firstEmptyIndex !== -1) {
      placeLetterInZone(letter, letterId, firstEmptyIndex)
    }
  }

  // --- Win/Lose Condition Check ---
  useEffect(() => {
    if (dropZones.length === 0 || isSolved) return
    
    const allFilled = dropZones.every(zone => zone.letter !== null)
    
    if (allFilled) {
      const userPhrase = dropZones.map(zone => zone.letter || '').join('').toUpperCase()
      const level = levels[currentLevel]
      
      if (userPhrase === level.phrase) {
        // Correct Answer (Win)
        setIsSolved(true)
        triggerCelebration()
        
        setTimeout(() => {
          if (currentLevel === levels.length - 1) {
            setShowFinalPopup(true)
          } else {
            setShowSuccessPopup(true)
          }
        }, 1000)
      } else {
        // Incorrect Answer (New Funny Error)
        setShowErrorPopup(true)
      }
    }
  }, [dropZones, currentLevel, isSolved])

  // --- Celebration Logic ---
  const triggerCelebration = () => {
    const duration = 2000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)
      const particleCount = 50 * (timeLeft / duration)

      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#d4a5c4', '#c99bb0', '#e8a4b8', '#f5e6f0', '#ffb3d9'] })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#d4a5c4', '#c99bb0', '#e8a4b8', '#f5e6f0', '#ffb3d9'] })
    }, 250)
  }

  // --- Navigation Logic ---
  const nextLevel = () => {
    setShowSuccessPopup(false)
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
      {/* Start Popup */}
      {showStartPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h1>Welcome to Puzzle Quest</h1>
            <p>Drag the letters (on PC) or tap the letters (on mobile) to solve the puzzle!</p>
            <button className="btn-primary" onClick={startGame}>Let's Play</button>
          </div>
        </div>
      )}

      {/* Home Button */}
      <button className="home-btn" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        Home
      </button>

      {/* Main Game Content */}
      {showInstructions && (
        <div className="puzzle-content">
          <div className="level-indicator">Level {currentLevel + 1} of {levels.length}</div>
          
          <div className="instructions-box">
            <p>{level.instructions}</p>
          </div>

          <div className="puzzle-area">
            {/* Letters Pool */}
            <div className="letters-section">
              <h3>Letters (Tap or Drag)</h3>
              <div className="letters-grid">
                {letters.map((item) => (
                  <div
                    key={item.id}
                    className={`letter ${item.used ? 'invisible' : ''}`}
                    draggable={!item.used}
                    onDragStart={(e) => handleDragStart(e, item.letter, item.id)}
                    onClick={() => !item.used && handleLetterClick(item.letter, item.id)}
                    style={{ cursor: item.used ? 'default' : 'pointer' }}
                  >
                    {item.letter}
                  </div>
                ))}
              </div>
            </div>

            {/* Answer Zones */}
            <div className="drop-zones-section">
              <h3>Arrange Here</h3>
              <div className="drop-zones-grid">
                {dropZones.map((zone, idx) => (
                  <div
                    key={zone.id}
                    className={`drop-zone ${zone.letter ? 'filled' : ''} ${isSolved ? 'solved' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    // Click to remove functionality is disabled since we added a dedicated Undo button for better UX
                    style={{ cursor: 'default' }} 
                  >
                    {zone.letter}
                  </div>
                ))}
              </div>
              {isSolved && (
                <div className="solved-indicator">
                  <span className="sparkle">✨</span>Solved!<span className="sparkle">✨</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="puzzle-controls">
             {/* New Undo Button */}
             <button 
                className={`btn-secondary undo-btn ${moveHistory.length === 0 ? 'disabled' : ''}`} 
                onClick={undoLastMove}
                disabled={moveHistory.length === 0 || isSolved}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                </svg>
                Undo Last Move
              </button>

              <button className="btn-secondary skip-btn" onClick={currentLevel === levels.length - 1 ? revealMessage : skipLevel}>
                {currentLevel === levels.length - 1 ? 'Reveal Message' : 'Skip Level'}
              </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-card celebration-popup">
            <div className="celebration-content">
              <div className="sparkle-burst">✨</div>
              <h1>Congratulations!</h1>
              <p>{level.message}</p>
              <button className="btn-primary" onClick={nextLevel}>Next Level →</button>
            </div>
          </div>
        </div>
      )}

      {/* New Error Popup */}
      {showErrorPopup && (
        <div className="popup-overlay">
          <div className="popup-card error-popup">
            <h1>Oops! Wrong Answer 😅</h1>
            <p>
              That word isn't quite right. It looks like the letters tried their best, but they got a little tangled! 
              <br/>
              Use the **Undo** button to move the last letter, or click a letter in the **bank** to shuffle things around!
            </p>
            <button className="btn-primary" onClick={() => setShowErrorPopup(false)}>Try Again</button>
          </div>
        </div>
      )}

      {/* Final Popup */}
      {showFinalPopup && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h1>Amazing!</h1>
            <p>You've completed all puzzles! Ready to see your special message?</p>
            <button className="btn-primary" onClick={revealMessage}>Reveal Message</button>
          </div>
        </div>
      )}

      {/* Love Letter Popup */}
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
              <button className="btn-primary" onClick={() => navigate('/')}>Home</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Puzzle