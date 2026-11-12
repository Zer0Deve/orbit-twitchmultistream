import { useEffect, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from '@firebase/auth'
import { auth, isFirebaseConfigured } from './firebase'
import './App.css'

const initialSpaces = [
  { id: 1, title: 'Main stage', channel: 'riotgames', accent: 'violet', category: 'VALORANT Champions Tour' },
  { id: 2, title: 'Side quest', channel: 'lirik', accent: 'blue', category: 'Just Chatting' },
  { id: 3, title: 'Late night', channel: 'lofigirl', accent: 'pink', category: 'Music' },
]

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8.3 8.3 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8.3 8.3 0 0 1-1.7-1l-1.7.7-1.4-2.4L7.3 15a8.4 8.4 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8.3 8.3 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8.3 8.3 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a8.4 8.4 0 0 1-.1 2Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    play: <path d="m9 6 10 6-10 6V6Z" />,
    volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
    volumeOff: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m17 9 5 6m0-6-5 6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    expand: <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" /></>,
    google: <><path fill="#4285F4" stroke="none" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.39a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.97-4.33 2.97-7.37Z" /><path fill="#34A853" stroke="none" d="M12 22c2.7 0 4.96-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" stroke="none" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.48H3.05a10 10 0 0 0 0 9.04l3.35-2.6Z" /><path fill="#EA4335" stroke="none" d="M12 5.96c1.47 0 2.79.5 3.83 1.53l2.87-2.88C16.95 2.97 14.7 2 12 2a10 10 0 0 0-8.95 5.48l3.35 2.6C7.19 7.72 9.4 5.96 12 5.96Z" /></>,
    twitch: <><path d="M4 3h18v13l-5 5h-4l-3 3v-3H6V7l-2-4Z" /><path d="M9 8v5m6-5v5" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function App() {
  const [spaces, setSpaces] = useState(initialSpaces)
  const [modal, setModal] = useState(null)
  const [isMuted, setIsMuted] = useState(true)
  const [columns, setColumns] = useState(3)
  const [newChannel, setNewChannel] = useState('')
  const [channelError, setChannelError] = useState('')
  const [user, setUser] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!auth) return undefined

    return onAuthStateChanged(
      auth,
      setUser,
      (error) => setAuthError(`Could not restore your sign-in: ${error.message}`),
    )
  }, [])

  const handleGoogleSignIn = async () => {
    setAuthError('')
    if (!auth || !isFirebaseConfigured) {
      setAuthError('Google sign-in is not configured. Add the Firebase web app values and enable Google in Firebase Authentication.')
      return
    }

    setAuthBusy(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return

      const message = error.code === 'auth/unauthorized-domain'
        ? 'This site is not authorized in Firebase. Add its hostname under Authentication → Settings → Authorized domains.'
        : error.code === 'auth/operation-not-allowed'
          ? 'Google sign-in is not enabled for this Firebase project.'
          : error.code === 'auth/popup-blocked'
            ? 'Your browser blocked the Google sign-in popup. Allow popups for this site and try again.'
            : `Google sign-in failed: ${error.message}`
      setAuthError(message)
    } finally {
      setAuthBusy(false)
    }
  }

  const handleSignOut = async () => {
    if (!auth) return

    setAuthError('')
    try {
      await signOut(auth)
    } catch (error) {
      setAuthError(`Could not sign out: ${error.message}`)
    }
  }

  const addSpace = (event) => {
    event.preventDefault()
    const channel = newChannel.trim().replace(/^@/, '')
    if (!/^[a-zA-Z0-9_]{1,25}$/.test(channel)) {
      setChannelError('Enter a valid Twitch channel name.')
      return
    }

    setSpaces((current) => [
      ...current,
      {
        id: Date.now(),
        title: `Space ${String(current.length + 1).padStart(2, '0')}`,
        channel,
        accent: ['violet', 'blue', 'pink'][current.length % 3],
        category: 'Twitch channel',
      },
    ])
    setNewChannel('')
    setChannelError('')
    setModal(null)
  }

  const removeSpace = (id) => {
    setSpaces((current) => current.filter((space) => space.id !== id))
  }

  const parentDomain = window.location.hostname || 'localhost'

  return (
    <div className="app-shell min-h-screen">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Orbit home">
          <span className="brand-mark"><span /></span>
          <span>orbit<span className="brand-period">.</span></span>
        </a>

        <div className="workspace-picker">
          <div className="workspace-avatar">S</div>
          <div className="workspace-copy">
            <span className="eyebrow">WORKSPACE</span>
            <strong>Stream room</strong>
          </div>
          <span className="picker-dots">•••</span>
        </div>

        <span className="nav-label">WORKSPACE</span>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#spaces"><Icon name="grid" /> Overview</a>
          <button className="nav-item" type="button" onClick={() => setModal({ type: 'accounts' })}>
            <Icon name="layers" /> Accounts <span className="nav-count">0</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-orb" />
            <strong>Make room for more</strong>
            <p>Your next favorite stream is one click away.</p>
            <button type="button" onClick={() => setModal({ type: 'add' })}>
              Add a space <Icon name="arrow" size={14} />
            </button>
          </div>
          <button className="nav-item settings-link" type="button" onClick={() => setModal({ type: 'setup' })}>
            <Icon name="settings" /> Settings
          </button>
          <div className="sidebar-footer">
            {user?.photoURL
              ? <img className="avatar avatar-small" src={user.photoURL} alt="" referrerPolicy="no-referrer" />
              : <span className="avatar avatar-small">{(user?.displayName || user?.email || 'J').slice(0, 1).toUpperCase()}</span>}
            <div><strong>{user?.displayName || user?.email || 'Jamie Parker'}</strong><span>{user ? 'Google account' : 'Free plan'}</span></div>
            <Icon name="more" size={19} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><Icon name="chevron" size={14} /><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="connection-status"><span /> {user ? 'Signed in with Google' : 'Workspace preview'}</span>
            <button
              className="signin-button"
              type="button"
              disabled={authBusy}
              onClick={user ? handleSignOut : handleGoogleSignIn}
            >
              {user?.photoURL && <img className="signin-avatar" src={user.photoURL} alt="" referrerPolicy="no-referrer" />}
              {!user && <Icon name="google" size={18} />}
              {authBusy ? 'Connecting…' : user ? 'Sign out' : 'Sign in with Google'}
              {user && <Icon name="logout" size={15} />}
            </button>
          </div>
        </header>
        {authError && (
          <div className="auth-alert" role="alert">
            <span>{authError}</span>
            <button className="icon-button" type="button" aria-label="Dismiss sign-in error" onClick={() => setAuthError('')}><Icon name="close" size={15} /></button>
          </div>
        )}

        <div className="page-content">
          <section className="welcome-panel">
            <div className="welcome-copy">
              <span className="welcome-kicker"><span className="sparkle">✳</span> YOUR PERSONAL STREAMING DESK</span>
              <h1>Every stream.<br /><span>One orbit.</span></h1>
              <p>Your own little corner of the internet, with all your favorite streams playing nicely together.</p>
              <div className="welcome-actions">
                <button className="primary-button" type="button" onClick={() => setModal({ type: 'add' })}>
                  <Icon name="plus" size={17} /> Create a space
                </button>
                <div className="avatar-stack" aria-hidden="true">
                  <span className="stack-avatar stack-one">✦</span>
                  <span className="stack-avatar stack-two">◉</span>
                  <span className="stack-avatar stack-three">♫</span>
                  <small>Make it yours</small>
                </div>
              </div>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <span className="planet planet-large" /><span className="planet planet-small" />
              <span className="floating-star star-a">✳</span><span className="floating-star star-b">✦</span>
              <div className="art-card art-card-back"><span>LIVE NOW</span><i /></div>
              <div className="art-card art-card-front"><span className="art-play"><Icon name="play" size={15} /></span><span>in your own orbit</span></div>
              <span className="art-caption">a little space, just for you <span>↗</span></span>
            </div>
            <span className="welcome-grain" />
          </section>

          <section className="spaces-section" id="spaces">
            <div className="section-heading">
              <div>
                <div className="section-title-row"><h2>Your spaces</h2><span className="space-count">{String(spaces.length).padStart(2, '0')}</span></div>
                <p className="section-subtitle">A different vibe for every window.</p>
              </div>
              <div className="section-tools">
                <button className={`tool-button ${isMuted ? '' : 'tool-active'}`} type="button" onClick={() => setIsMuted((muted) => !muted)}>
                  <Icon name={isMuted ? 'volumeOff' : 'volume'} size={16} /> {isMuted ? 'Muted' : 'Sound on'}
                </button>
                <div className="view-toggle" aria-label="Number of columns">
                  <button type="button" className={columns === 2 ? 'selected' : ''} aria-label="Two columns" onClick={() => setColumns(2)}><span className="view-icon two-col" /></button>
                  <button type="button" className={columns === 3 ? 'selected' : ''} aria-label="Three columns" onClick={() => setColumns(3)}><span className="view-icon three-col" /></button>
                </div>
                <button className="add-button" type="button" onClick={() => setModal({ type: 'add' })}><Icon name="plus" size={16} /> Add space</button>
              </div>
            </div>

            {spaces.length > 0 ? (
              <div className="space-grid" style={{ '--columns': columns }}>
                {spaces.map((space, index) => (
                  <article className={`space-card accent-${space.accent}`} key={space.id}>
                    <div className="card-heading">
                      <div className="space-identity">
                        <span className="space-icon"><Icon name="twitch" size={16} /></span>
                        <div><strong>{space.title}</strong><span>Personal view · {String(index + 1).padStart(2, '0')}</span></div>
                      </div>
                      <button className="icon-button card-menu" type="button" aria-label={`Remove ${space.title}`} onClick={() => removeSpace(space.id)}><Icon name="close" size={16} /></button>
                    </div>
                    <div className="player-frame">
                      <iframe
                        title={`${space.title}: ${space.channel} Twitch stream`}
                        src={`https://player.twitch.tv/?channel=${encodeURIComponent(space.channel)}&parent=${encodeURIComponent(parentDomain)}&autoplay=false&muted=${isMuted}`}
                        allow="autoplay"
                        allowFullScreen
                      />
                      <span className="live-pill"><i /> TWITCH</span>
                    </div>
                    <div className="stream-details">
                      <div className="stream-title-row"><strong>{space.category}</strong><span className="viewer-count"><i /> Channel</span></div>
                      <span className="channel-name"><span className="channel-avatar">{space.channel.slice(0, 1).toUpperCase()}</span> {space.channel}</span>
                    </div>
                    <div className="card-footer">
                      <span className="account-status"><span className="status-dot" /> Account not connected</span>
                      <button type="button" onClick={() => setModal({ type: 'twitch', space: space.title })}>Connect Twitch <Icon name="chevron" size={13} /></button>
                    </div>
                    <span className="resize-hint"><Icon name="expand" size={12} /> drag corner to resize</span>
                  </article>
                ))}
                <button className="new-space-card" type="button" onClick={() => setModal({ type: 'add' })}>
                  <span className="new-space-icon"><Icon name="plus" size={21} /></span>
                  <strong>There's room for one more</strong>
                  <span>Create a new viewing space</span>
                </button>
              </div>
            ) : (
              <div className="empty-spaces">
                <span className="empty-orbit">✳</span>
                <h3>Your orbit is looking a little quiet.</h3>
                <p>Add a Twitch channel to start a new viewing space.</p>
                <button className="primary-button" type="button" onClick={() => setModal({ type: 'add' })}><Icon name="plus" size={17} /> Create a space</button>
              </div>
            )}
            <div className="space-note"><Icon name="check" size={14} /> Each space has its own layout and channel. Twitch sign-in is shared by your browser.</div>
          </section>
          <footer className="page-footer"><span>Made for your kind of internet <span className="footer-heart">✳</span></span><span>Orbit preview <span className="footer-dot">·</span> v0.1</span></footer>
        </div>
      </main>

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModal(null)
        }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close icon-button" type="button" aria-label="Close dialog" onClick={() => setModal(null)}><Icon name="close" /></button>
            <span className="modal-orb"><Icon name="twitch" size={22} /></span>
            {modal.type === 'add' ? (
              <>
                <span className="modal-kicker">MAKE SOME SPACE</span>
                <h2 id="modal-title">Add a Twitch channel</h2>
                <p>Each space gets its own player and layout. Choose a channel to tune into.</p>
                <form className="modal-form" onSubmit={addSpace}>
                  <label htmlFor="twitch-channel">Twitch channel name</label>
                  <div className="input-wrap"><span>twitch.tv/</span><input id="twitch-channel" autoFocus value={newChannel} onChange={(event) => { setNewChannel(event.target.value); setChannelError('') }} placeholder="channelname" /></div>
                  {channelError && <span className="form-error">{channelError}</span>}
                  <button className="primary-button modal-submit" type="submit"><Icon name="plus" size={16} /> Create viewing space</button>
                </form>
              </>
            ) : (
              <>
                <span className="modal-kicker">{modal.type === 'accounts' ? 'ACCOUNT CONNECTIONS' : 'COMING UP NEXT'}</span>
                <h2 id="modal-title">{modal.type === 'twitch' ? `Connect ${modal.space}.` : modal.type === 'accounts' ? 'Your accounts, your space.' : 'Make it your own.'}</h2>
                <p>{modal.type === 'twitch'
                  ? 'Twitch account linking needs a secure OAuth flow. Twitch embeds currently use the browser’s shared Twitch login, not separate accounts per space.'
                  : modal.type === 'accounts'
                    ? 'Google sign-in is available from the top of the page. Twitch account linking is not active yet.'
                    : 'Workspace settings and account preferences will live here.'}</p>
                <div className="integration-note"><span className="note-icon"><Icon name="check" size={15} /></span><span><strong>Google sign-in</strong><small>Your Google session is managed by Firebase Authentication.</small></span></div>
                <button className="primary-button modal-submit" type="button" onClick={() => setModal(null)}>Got it</button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
