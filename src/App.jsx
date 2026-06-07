import { useState, useEffect } from 'react';
import {
  Rocket,
  Brain,
  ShieldCheck,
  Vote,
  Cpu,
  Sparkles,
  CheckCircle2,
  Database,
  Layers,
  Network,
  ArrowRight,
  Play,
  Globe,
  Send,
  Mail,
  Code2,
  Home
} from 'lucide-react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import './styles/App.css';
import Dock from './components/Dock';
import InfiniteMenu from './components/InfiniteMenu';
import BorderGlow from './components/BorderGlow';
import LetterGlitch from './components/LetterGlitch';
import MagicBento from './components/MagicBento';
import ContributorConstellation from './components/ContributorConstellation';
import TerminalSimulator from './components/TerminalSimulator';
import DaoProposalSim from './components/DaoProposalSim';
import Galaxy from './components/Galaxy';
import ExploreModal from './components/ExploreModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashMounted, setIsSplashMounted] = useState(true);
  const [exploredCategory, setExploredCategory] = useState(null);


  const [communityTab, setCommunityTab] = useState('constellation');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuScale = windowWidth < 480 ? 0.8 : windowWidth < 768 ? 0.95 : windowWidth < 1024 ? 1.15 : 1.4;

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      const timer = setTimeout(() => {
        setIsSplashMounted(false);
      }, 800);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSplash]);


  const networkItems = [
    {
      image: '/sector_agritech.jpg',
      link: '#',
      title: 'Agritech & Plant Science',
      description: 'Smart irrigation, crop health monitoring, and precision agriculture innovations.'
    },
    {
      image: '/sector_electronics.jpg',
      link: '#',
      title: 'Hardware & Electronics',
      description: 'Next-gen microcontrollers, embedded IoT sensors, and high-performance robotics.'
    },
    {
      image: '/sector_trading.jpg',
      link: '#',
      title: 'FinTech & Trading',
      description: 'Decentralized orderbooks, algorithmic micro-trading, and automated smart liquidity.'
    },
    {
      image: '/sector_education.jpg',
      link: '#',
      title: 'EdTech & Digital Learning',
      description: 'AI tutors, peer-to-peer coding sandboxes, and virtual classroom technologies.'
    },
    {
      image: '/sector_biotech.jpg',
      link: '#',
      title: 'Biotech & Health Science',
      description: 'DNA sequencing, digital health sensors, and automated smart diagnostic tools.'
    },
    {
      image: '/sector_energy.jpg',
      link: '#',
      title: 'Clean Energy & Solar',
      description: 'Grid-level solar storage, battery density management, and smart smart-grids.'
    },
    {
      image: '/sector_aerospace.jpg',
      link: '#',
      title: 'Aerospace & Drone Tech',
      description: 'Micro-satellite telemetry, automated delivery drone routing, and avionics controllers.'
    },
    {
      image: '/sector_cybersecurity.jpg',
      link: '#',
      title: 'Cybersecurity & Crypto',
      description: 'Zero-knowledge proofs, hardware-encrypted keys, and automated penetration testing.'
    },
    {
      image: '/sector_ai.jpg',
      link: '#',
      title: 'AI & Machine Learning',
      description: 'Neural networks, autonomous decision models, and generative agent pipelines.'
    },
    {
      image: '/sector_vr.jpg',
      link: '#',
      title: 'AR/VR & Spatial Computing',
      description: 'Virtual immersive workspaces, spatial interface designs, and real-time environment rendering.'
    },
    {
      image: '/sector_robotics.jpg',
      link: '#',
      title: 'Robotics & Automation',
      description: 'Assembly arm controllers, hardware kinematics, and autonomous warehouse fleets.'
    },
    {
      image: '/sector_blockchain.jpg',
      link: '#',
      title: 'Web3 & Decentralized Ledger',
      description: 'Smart contract sandboxes, cross-chain bridge relays, and distributed validator consensus.'
    },
    {
      image: '/sector_ecommerce.jpg',
      link: '#',
      title: 'E-Commerce & Retail',
      description: 'Headless checkout pipelines, augmented reality try-ons, and dynamic inventory matching.'
    },
    {
      image: '/sector_logistics.jpg',
      link: '#',
      title: 'Logistics & Supply Chain',
      description: 'Autonomous freight matching, last-mile drone delivery hubs, and blockchain shipping logs.'
    },
    {
      image: '/sector_foodtech.jpg',
      link: '#',
      title: 'FoodTech & Gastronomy',
      description: 'Alternative protein formulations, smart commercial kitchen systems, and automated supply chains.'
    },
    {
      image: '/sector_mobility.jpg',
      link: '#',
      title: 'Mobility & Smart Cities',
      description: 'Electric vehicle charging grids, urban traffic sensor algorithms, and autonomous ride sharing.'
    },
    {
      image: '/sector_proptech.jpg',
      link: '#',
      title: 'PropTech & Real Estate',
      description: 'Smart building occupancy sensors, decentralized home equity tokens, and automated listing engines.'
    },
    {
      image: '/sector_cretech.jpg',
      link: '#',
      title: 'CreTech & Media',
      description: 'Real-time collaborative video suites, AI music generation tools, and decentralised licensing.'
    },
    {
      image: '/sector_govtech.jpg',
      link: '#',
      title: 'GovTech & Civic Action',
      description: 'Cryptographically secure e-voting, open municipal database nodes, and local citizen hubs.'
    },
    {
      image: '/sector_insuretech.jpg',
      link: '#',
      title: 'InsureTech & Risk',
      description: 'Real-time smart contract parametric insurances, telemetry driving records, and fraud detection.'
    },
    {
      image: '/sector_adtech.jpg',
      link: '#',
      title: 'AdTech & Marketing Tech',
      description: 'Hyper-personalized ad bidding, privacy-safe tracking SDKs, and dynamic creator attribution.'
    },
    {
      image: '/sector_traveltech.jpg',
      link: '#',
      title: 'TravelTech & Hospitality',
      description: 'Generative travel itinerary engines, automated room inventory matching, and smart luggage logs.'
    },
    {
      image: '/sector_pettech.jpg',
      link: '#',
      title: 'PetTech & Veterinary',
      description: 'Smart activity collar monitors, automated vet scheduling, and raw dietary formulating engines.'
    },
    {
      image: '/sector_legaltech.jpg',
      link: '#',
      title: 'LegalTech & Regulatory',
      description: 'Cryptographic document notarization, AI contract compliance checking, and patent audit logs.'
    },
    {
      image: '/sector_hrtech.jpg',
      link: '#',
      title: 'HRTech & Recruiting',
      description: 'Algorithmic matching, virtual remote onboarding sandboxes, and token-weighted referrals.'
    },
    {
      image: '/sector_healthtech.jpg',
      link: '#',
      title: 'HealthTech & Patient Care',
      description: 'Telehealth coordination links, cryptographically sealed medical histories, and diagnostics.'
    },
    {
      image: '/sector_sportstech.jpg',
      link: '#',
      title: 'SportsTech & Athletics',
      description: 'Computer-vision kinematic trackers, wearable sensor relays, and automated athletic stat dashboards.'
    },
    {
      image: '/sector_climatetech.jpg',
      link: '#',
      title: 'ClimateTech & Green Finance',
      description: 'Carbon credit ledger tracking, supply chain emissions estimators, and smart reforestation monitoring.'
    },
    {
      image: '/sector_spacetech.jpg',
      link: '#',
      title: 'SpaceTech & Exploration',
      description: 'Launch telemetry monitors, payload weight allocation systems, and orbit collision avoidance.'
    },
    {
      image: '/sector_nanotech.jpg',
      link: '#',
      title: 'NanoTech & Advanced Materials',
      description: 'Carbon nanotube lattices, molecular design simulations, and automated material strength models.'
    }
  ];

  const dockItems = [
    {
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      onClick: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      label: 'Features',
      icon: <Layers className="w-5 h-5" />,
      onClick: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      label: 'Network',
      icon: <Globe className="w-5 h-5" />,
      onClick: () => document.getElementById('network')?.scrollIntoView({ behavior: 'smooth' })
    },

    {
      label: 'System Flow',
      icon: <Cpu className="w-5 h-5" />,
      onClick: () => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })
    },

    {
      label: 'Open Source',
      icon: <Code2 className="w-5 h-5" />,
      onClick: () => document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' })
    },
  ];




  return (
    <div className="app-container">
      {/* Fixed GitHub CTA — top right */}
      <a
        href="https://github.com/Manvikamboz/Startora"
        target="_blank"
        rel="noopener noreferrer"
        title="Star us on GitHub"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '9px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'var(--font-display)',
          textDecoration: 'none',
          letterSpacing: '0.03em',
          cursor: 'pointer',
          transition: 'background 0.2s, border-color 0.2s, color 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(6,182,212,0.12)';
          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(6,182,212,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <GithubIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        Star on GitHub
      </a>

      {/* Fixed Logo — top left */}
      <button
        onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
        title="Back to top"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          padding: '9px 16px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(12px)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '800',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(6,182,212,0.10)';
          e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(6,182,212,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Rocket style={{ width: '16px', height: '16px', color: '#fff', flexShrink: 0 }} />
        STARTORA
      </button>

      {/* Glassmorphic Splash Screen Overlay */}
      {isSplashMounted && (
        <div className={`splash-overlay ${!showSplash ? 'hidden' : ''}`}>
          <div className="splash-galaxy-bg">
            <Galaxy
              mouseRepulsion={true}
              mouseInteraction={true}
              density={1}
              glowIntensity={0.3}
              saturation={0}
              hueShift={140}
              twinkleIntensity={0.3}
              rotationSpeed={0.1}
              repulsionStrength={2}
              autoCenterRepulsion={0}
              starSpeed={0.5}
              speed={1}
            />
          </div>
          <div className="splash-glow-cyan" />
          <div className="splash-glow-violet" />
          <div className="splash-content">
            <div className="splash-badge animate-float">
              <Sparkles style={{ width: '12px', height: '12px', color: 'var(--neon-teal)', flexShrink: 0 }} />
              <span>Actual Product Out Soon</span>
            </div>
            <h1 className="splash-title">Startora</h1>
            <p className="splash-tagline">Creating Startups before graduation</p>
            <div className="splash-divider" />
            <p className="splash-description">
              The actual product will be out soon! In the meantime, feel free to enter and explore our interactive preview workspace showcasing the platform's features.
            </p>
            <button
              className="splash-coming-soon cursor-target"
              onClick={() => setShowSplash(false)}
            >
              Enter Preview Workspace
            </button>
          </div>
        </div>
      )}

      {/* Ambient Matrix Rain / LetterGlitch Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -10, pointerEvents: 'none', opacity: 0.15 }}>
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth
          colors={["#2b4539", "#61dca3", "#61b3dc"]}
          showCenterVignette
          showOuterVignette={false}
        />
      </div>

      {/* Background spotlights */}
      <div className="glow-spotlight animate-drift" style={{ width: '40vw', height: '40vw', top: '-10%', left: '-10%', background: 'var(--neon-teal)' }}></div>
      <div className="glow-spotlight animate-drift" style={{ width: '40vw', height: '40vw', bottom: '-10%', right: '-10%', background: 'var(--neon-violet)', animationDelay: '-5s' }}></div>



      <section id="hero" className="hero">
        <h1 className="hero-title">
          Student Innovation Meets <span className="text-gradient">Cryptographic</span>
        </h1>
        <p className="hero-description">
          A premium virtual launchpad linking AI Feasibility Analysis, MetaMask Blockchain IP Registries, and DAO Governance to seed tomorrow&apos;s student startups.
        </p>
        <div className="hero-cta">
          <button
            onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary cursor-target"
          >
            Explore Architecture <Play className="w-4 h-4 fill-white" />
          </button>
          <a href="#features" className="btn-secondary cursor-target">
            Explore Features <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Core Features Overview */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2 className="section-title">Built with Cutting-Edge Sandbox Architecture</h2>
          <p className="section-description">A look inside the specialized building blocks enabling student co-founder matches and verified IP tracking.</p>
        </div>

        <div className="grid-showcase">
          {/* Feature 1 */}
          <BorderGlow
            className="feature-card glass-interactive"
            edgeSensitivity={25}
            glowColor="180 100 50"
            backgroundColor="var(--bg-card)"
            borderRadius={24}
            glowRadius={48}
            glowIntensity={1.6}
            coneSpread={28}
            animated={false}
            colors={['#06b6d4', '#3b82f6', '#10b981']}
          >
            <div className="feature-icon-box" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--neon-teal)' }}>
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="feature-title">AI Feasibility grading</h3>
            <p className="feature-text">
              Runs NLP tokenizers to compute feasibility scores, risk ratings, and technical milestones for startup descriptions.
            </p>
          </BorderGlow>

          {/* Feature 2 */}
          <BorderGlow
            className="feature-card glass-interactive"
            edgeSensitivity={25}
            glowColor="260 100 65"
            backgroundColor="var(--bg-card)"
            borderRadius={24}
            glowRadius={48}
            glowIntensity={1.6}
            coneSpread={28}
            animated={false}
            colors={['#8b5cf6', '#d946ef', '#6366f1']}
          >
            <div className="feature-icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--neon-violet)' }}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="feature-title">Blockchain IP Ownership</h3>
            <p className="feature-text">
              Generate SHA-256 fingerprints of startup proposals and post them on-chain with MetaMask to claim timestamped proof of invention.
            </p>
          </BorderGlow>

          {/* Feature 3 */}
          <BorderGlow
            className="feature-card glass-interactive"
            edgeSensitivity={25}
            glowColor="330 100 65"
            backgroundColor="var(--bg-card)"
            borderRadius={24}
            glowRadius={48}
            glowIntensity={1.6}
            coneSpread={28}
            animated={false}
            colors={['#ec4899', '#f43f5e', '#a855f7']}
          >
            <div className="feature-icon-box" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--neon-pink)' }}>
              <Vote className="w-6 h-6" />
            </div>
            <h3 className="feature-title">DAO Democratic Governance</h3>
            <p className="feature-text">
              Propose funding rounds and vote on proposals. Student voting weights are backed by sandbox coins earned from building.
            </p>
          </BorderGlow>
        </div>
      </section>

      {/* Build Global Student Founder Network Section */}
      <section id="network" className="network-section">
        <div className="network-grid">
          <div className="network-content">
            <div className="network-badge animate-float">
              <Sparkles className="w-3 h-3" /> Global Ecosystem
            </div>
            <h2 className="network-title">
              Build your Global <span className="text-gradient-teal">Student Founder Network</span>
            </h2>
            <p className="network-text">
              Launchpad Labs bridges university boundaries, allowing elite student developers, designers, and business operators to unite under a singular decentralized sandbox.
            </p>

          </div>
          <div className="network-visual glass">
            <div className="network-menu-container">
              <InfiniteMenu items={networkItems} scale={menuScale} onExplore={setExploredCategory} />
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="arch-section">
        <div className="section-header">
          <h2 className="section-title">System Architecture</h2>
          <p className="section-description">How frontend inputs integrate with our distributed servers, AI networks, and smart contracts.</p>
        </div>

        <MagicBento
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={true}
          spotlightRadius={400}
          particleCount={12}
          glowColor="139, 92, 246"
          disableAnimations={false}
        />
      </section>


      {/* Open Source Hub Section */}
      <section id="community" className="community-section">
        <div className="section-header">
          <h2 className="section-title text-gradient">Built for the Open-Source Future</h2>
          <p className="section-description">Interact with our codebase constellation, simulated developer activity stream, and community proposal board.</p>
        </div>

        {/* Tab Switch Controls */}
        <div className="community-tab-controls glass">
          <button
            onClick={() => setCommunityTab('constellation')}
            className={`community-tab-btn cursor-target ${communityTab === 'constellation' ? 'active' : ''}`}
          >
            Contributor Constellation
          </button>
          <button
            onClick={() => setCommunityTab('terminal')}
            className={`community-tab-btn cursor-target ${communityTab === 'terminal' ? 'active' : ''}`}
          >
            Live Activity Terminal
          </button>
          <button
            onClick={() => setCommunityTab('dao')}
            className={`community-tab-btn cursor-target ${communityTab === 'dao' ? 'active' : ''}`}
          >
            Governance Proposal Board
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="community-tab-content animate-scaleUp" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
          {communityTab === 'constellation' && <ContributorConstellation />}
          {communityTab === 'terminal' && <TerminalSimulator />}
          {communityTab === 'dao' && <DaoProposalSim />}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <span>STARTORA</span>
        </div>
        <div className="footer-links">
          <a href="#hero" className="footer-link">Home</a>
          <a href="#features" className="footer-link">Features</a>
          <a href="#network" className="footer-link">Network</a>
          <a href="#architecture" className="footer-link">System Flow</a>
          <a href="#community" className="footer-link">Open Source</a>
        </div>

        {/* Social Icons */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '12px 0' }}>
          {/* Instagram */}
          <a
            href="https://www.instagram.com/startora.open?igsh=MWYyZTRiY3ZkZDQ3MQ=="
            target="_blank"
            rel="noopener noreferrer"
            title="Startora on Instagram"
            style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s, filter 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e1306c'; e.currentTarget.style.filter = 'drop-shadow(0 0 6px #e1306c)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.filter = 'none'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

          {/* Discord */}
          <a
            href="https://discord.gg/WsUCXPxnZ"
            target="_blank"
            rel="noopener noreferrer"
            title="Join Startora on Discord"
            style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s, filter 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#5865f2'; e.currentTarget.style.filter = 'drop-shadow(0 0 6px #5865f2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.filter = 'none'; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:hellomanvi006@gmail.com"
            title="Email Startora"
            style={{ color: 'rgba(255,255,255,0.45)', transition: 'color 0.2s, filter 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.filter = 'drop-shadow(0 0 6px #06b6d4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.filter = 'none'; }}
          >
            <Mail style={{ width: '20px', height: '20px' }} />
          </a>
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © 2026 Startora · Built by{' '}
          <a
            href="https://github.com/Manvikamboz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--neon-teal)', textDecoration: 'none' }}
          >
            @Manvikamboz
          </a>
        </p>
      </footer>

      <Dock items={dockItems} />

      {exploredCategory && (
        <ExploreModal
          category={exploredCategory}
          onClose={() => setExploredCategory(null)}
        />
      )}
    </div>
  );
}
