import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const messages = [
  "You're amazing, Cho Zin Win! Keep shining bright like you always do.",
  "Life feels so much better when you're around. Thanks for being you!",
  "Hey Cho Zin Win, remember: even the smallest steps forward still move you ahead.",
  "The stars in the sky aren't as bright as your future—seriously!",
  "Spread happiness wherever you go—it's your superpower!",
  "You know what? You're loved more than words can ever express.",
  "Stay positive, Cho Zin Win. Every day is a chance to make magic happen.",
  "Let's celebrate this magical year ahead—it's gonna be YOURS!",
  "Sometimes life gets tough, but you've got this. Always have.",
  "Cho Zin Win, you're one of those people who makes the world brighter just by being here.",
  "Dream big, dream bold. You're capable of anything you set your mind to.",
  "Even on hard days, your strength inspires everyone around you.",
  "You don't need to be perfect to be incredible—you already are.",
  "There's no one else quite like you, Cho Zin Win. That's a fact.",
  "When things get messy, take a deep breath—you're stronger than you think.",
  "Your kindness has a way of making people feel seen and valued.",
  "Every laugh you share adds a little sparkle to someone's day.",
  "It's okay to slow down and take care of yourself—you deserve it.",
  "No matter what happens, you've always got a whole team cheering for you.",
  "Keep chasing those dreams—they're closer than they seem!",
  "On tough days, remind yourself how far you've come. It's further than you think.",
  "You're allowed to rest. Being strong doesn't mean never stopping.",
  "Sometimes, just showing up is the bravest thing you can do—and you do it every day.",
  "You're building a story worth telling, Cho Zin Win. Keep writing it!",
  "Being different isn't a flaw—it's what makes you extraordinary.",
  "Mistakes happen, but they don't define you. What defines you is how far you bounce back.",
  "Your presence alone can turn an ordinary moment into something beautiful.",
  "Cho Zin Win, you have this incredible ability to see the good in everything.",
  "The way you care for others shows the depth of your beautiful heart.",
  "Every challenge you face only makes you more resilient and amazing.",
  "You bring light to dark days and joy to every room you enter.",
  "Your smile has the power to brighten even the cloudiest of days.",
  "Cho Zin Win, you're not just surviving—you're thriving and inspiring others.",
  "The world is a better place because you're in it, and that's the truth.",
  "Your courage to be yourself is one of the most beautiful things about you.",
  "You have a gift for making everyone around you feel special and important.",
  "Cho Zin Win, your energy is contagious in the best possible way.",
  "The way you handle difficult situations with grace is truly admirable.",
  "You're a reminder that kindness and strength can coexist beautifully.",
  "Your laughter is like music—it makes everything better instantly.",
  "Cho Zin Win, you have this rare ability to find beauty in the simplest moments.",
  "The way you support others shows what a wonderful friend you are.",
  "You're proof that one person can make a huge difference in the world.",
  "Your optimism is like a beacon of hope for everyone who knows you.",
  "Cho Zin Win, you have the heart of a warrior and the soul of an artist.",
  "The way you love and care for people is genuinely inspiring.",
  "You're creating a legacy of kindness that will touch countless lives.",
  "Your determination to keep going, even when it's hard, is remarkable.",
  "Cho Zin Win, you're a beautiful blend of strength and gentleness.",
  "The way you celebrate others' successes shows your generous spirit.",
  "You have this amazing ability to turn setbacks into comebacks.",
  "Your authenticity is refreshing and makes you incredibly special.",
  "Cho Zin Win, you're a masterpiece in progress, and it's beautiful to watch.",
  "The way you spread positivity is like planting seeds of happiness everywhere.",
  "You're not just living life—you're embracing it with open arms and an open heart."
]

function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function Home() {
  const navigate = useNavigate()
  const [showGame, setShowGame] = useState(false)
  const [unlockedCount, setUnlockedCount] = useState(0)
  const [shuffledMessages] = useState(() => shuffleArray(messages).slice(0, 6))
  const [flippedCards, setFlippedCards] = useState(new Set())

  const handleCardClick = (index) => {
    if (flippedCards.has(index)) return
    setFlippedCards(prev => new Set([...prev, index]))
    setUnlockedCount(prev => prev + 1)
  }

  const progress = (unlockedCount / 6) * 100

  return (
    <div className="home-container">
      {!showGame ? (
        <div className="intro-screen">
          <div className="intro-content">
            <h1 className="intro-title">Happy Birthday</h1>
            <h2 className="intro-name">Cho Zin Win</h2>
            <p className="intro-text">Tap "Begin" to start your special journey</p>
            <div className="button-group">
              <button className="btn-primary" onClick={() => setShowGame(true)}>
                Begin
              </button>
              <button className="btn-secondary" onClick={() => navigate('/adventure')}>
                Adventure
              </button>
              <button className="btn-secondary" onClick={() => navigate('/puzzle')}>
                Puzzle
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="game-screen">
          <h2 className="game-title">Unlock the Magic</h2>
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-text">{unlockedCount} / 6</span>
          </div>
          <div className="cards-grid">
            {shuffledMessages.map((message, index) => (
              <div
                key={index}
                className={`card ${flippedCards.has(index) ? 'flipped' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <span className="card-icon">✨</span>
                  </div>
                  <div className="card-back">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {unlockedCount === 6 && (
            <button className="btn-primary next-btn" onClick={() => navigate('/celebration')}>
              Continue →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Home

