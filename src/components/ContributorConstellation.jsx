import { useEffect, useRef, useState } from 'react';
import { 
  Users, 
  GitFork, 
  Star, 
  GitPullRequest, 
  Code2, 
  AlertCircle, 
  ArrowUpRight, 
  HelpCircle,
  Cpu,
  Layers,
  Settings,
  Database,
  Sparkles
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const INITIAL_CONTRIBUTORS = [
  { id: 1, name: "Manvi Kamboz", role: "Lead Architect", handle: "Manvikamboz", university: "Founder & Lead", avatar: "https://avatars.githubusercontent.com/u/178479748?v=4", xPercent: 50, yPercent: 45, radius: 14, color: "#06b6d4" }
];

const FALLBACK_ISSUES = [
  {
    number: 1,
    title: "Optimize landing page animations performance",
    url: "https://github.com/Manvikamboz/Startora/issues",
    labels: ["performance", "animation"]
  },
  {
    number: 2,
    title: "Add unit tests for Mongoose schemas fallback handler",
    url: "https://github.com/Manvikamboz/Startora/issues",
    labels: ["testing", "backend"]
  },
  {
    number: 3,
    title: "Implement zero-knowledge proof verification demo",
    url: "https://github.com/Manvikamboz/Startora/issues",
    labels: ["web3", "feature"]
  }
];

export default function ContributorConstellation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ stargazers: 0, forks: 0, contributors: 1 });
  const [openIssuesList, setOpenIssuesList] = useState([]);

  const hoveredNodeRef = useRef(null);
  const nodesRef = useRef([]);
  const contributorsRef = useRef(INITIAL_CONTRIBUTORS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      nodesRef.current = contributorsRef.current.map((c, index) => {
        const existing = nodesRef.current[index];
        return {
          ...c,
          x: existing ? (existing.x / canvas.width) * canvas.width : (c.xPercent / 100) * canvas.width,
          y: existing ? (existing.y / canvas.height) * canvas.height : (c.yPercent / 100) * canvas.height,
          vx: existing ? existing.vx : (Math.random() - 0.5) * 0.4,
          vy: existing ? existing.vy : (Math.random() - 0.5) * 0.4,
          targetRadius: c.radius,
          currentRadius: existing ? existing.currentRadius : c.radius
        };
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fetchRepoStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/repo-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            stargazers: data.stargazers,
            forks: data.forks,
            contributors: data.contributorsCount
          });
          
          setOpenIssuesList(data.openIssuesList || []);

          if (data.contributors && data.contributors.length > 0) {
            const mergedList = INITIAL_CONTRIBUTORS.map((node, index) => {
              if (index < data.contributors.length) {
                const gitUser = data.contributors[index];
                if (index === 0) {
                  return {
                    ...node,
                    avatar: gitUser.avatar_url || node.avatar,
                    handle: gitUser.login || node.handle,
                  };
                }
                return {
                  ...node,
                  name: gitUser.login,
                  handle: gitUser.login,
                  avatar: gitUser.avatar_url,
                  role: `Contributor (${gitUser.contributions} commits)`,
                  university: 'GitHub Builder'
                };
              }
              return node;
            });
            contributorsRef.current = mergedList;
            
            nodesRef.current = nodesRef.current.map((node, index) => {
              if (index < mergedList.length) {
                return {
                  ...node,
                  ...mergedList[index]
                };
              }
              return node;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching repo stats in UI:', err);
        setOpenIssuesList(FALLBACK_ISSUES);
      }
    };

    fetchRepoStats();

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      let foundHover = null;
      nodesRef.current.forEach((node) => {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius + 15) {
          foundHover = node;
        }
      });

      if (foundHover) {
        if (hoveredNodeRef.current?.id !== foundHover.id) {
          hoveredNodeRef.current = foundHover;
          setHoveredNode(foundHover);
        }
        setTooltipPos({ x: foundHover.x, y: foundHover.y - foundHover.radius - 20 });
      } else {
        if (hoveredNodeRef.current !== null) {
          hoveredNodeRef.current = null;
          setHoveredNode(null);
        }
      }
    };

    const handleMouseLeave = () => {
      mouse = { x: null, y: null };
      hoveredNodeRef.current = null;
      setHoveredNode(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let isIntersecting = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextIntersecting = entry.isIntersecting;
        if (nextIntersecting !== isIntersecting) {
          isIntersecting = nextIntersecting;
          if (isIntersecting) {
            if (!animationFrameId) {
              draw();
            }
          } else {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }
          }
        }
      },
      { threshold: 0.05 }
    );

    if (canvas) {
      observer.observe(canvas);
    }

    const draw = () => {
      if (!isIntersecting) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 280) {
            const alpha = (1 - dist / 280) * 0.15;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x !== null) {
        nodes.forEach((node) => {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.25;
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        const padding = 50;
        if (node.x < padding || node.x > canvas.width - padding) node.vx *= -1;
        if (node.y < padding || node.y > canvas.height - padding) node.vy *= -1;

        const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === node.id;
        node.targetRadius = isHovered ? node.radius * 1.3 : node.radius;
        node.currentRadius += (node.targetRadius - node.currentRadius) * 0.15;

        ctx.shadowBlur = isHovered ? 20 : 8;
        ctx.shadowColor = node.color;
        ctx.fillStyle = isHovered ? '#fff' : node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.currentRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.currentRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.55)';
        ctx.font = isHovered ? 'bold 11px var(--font-display)' : '10px var(--font-body)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.currentRadius + 16);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        observer.unobserve(canvas);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Constellation Map with Animated Glow Border Wrapper */}
      <div className="constellation-glow-container">
        <div className="constellation-glow-inner">
          <div className="constellation-container" ref={containerRef} style={{ position: 'relative', width: '100%', height: '480px', overflow: 'hidden' }}>
            {/* Interactive Canvas */}
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />

            {/* GitHub Repo stats overlay */}
            <div className="repo-stats-header" style={{ position: 'absolute', top: '24px', left: '24px', display: 'flex', gap: '16px', zIndex: 10 }}>
              <div className="repo-stat-pill" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)' }}>
                <Star className="w-4 h-4 text-yellow-400" />
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Stars: <strong style={{ color: '#fff' }}>{stats.stargazers}</strong>
                </span>
              </div>
              <div className="repo-stat-pill" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)' }}>
                <GitFork className="w-4 h-4 text-cyan-400" />
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Forks: <strong style={{ color: '#fff' }}>{stats.forks}</strong>
                </span>
              </div>
              <div className="repo-stat-pill" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(8px)' }}>
                <Users className="w-4 h-4 text-violet-400" />
                <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Builders: <strong style={{ color: '#fff' }}>{stats.contributors}</strong>
                </span>
              </div>
            </div>

            {/* Interactive Glassmorphic Tooltip Card */}
            {hoveredNode && (
              <div
                className="constellation-tooltip glass"
                style={{
                  position: 'absolute',
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: 'translate(-50%, -100%)',
                  padding: '16px',
                  width: '240px',
                  pointerEvents: 'none',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={hoveredNode.avatar}
                    alt={hoveredNode.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: `2px solid ${hoveredNode.color}`, objectFit: 'cover' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{hoveredNode.name}</h4>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>@{hoveredNode.handle}</p>
                  </div>
                </div>
                <div style={{ width: '100%', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', textAlign: 'left' }}>
                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Role</span>
                    <p style={{ margin: 0, fontWeight: '600', color: hoveredNode.color }}>{hoveredNode.role}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Chapter</span>
                    <p style={{ margin: 0, fontWeight: '600', color: '#fff' }}>{hoveredNode.university}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Tech Stack Row */}
      <div className="tech-stack-row">
        <div className="tech-badge">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>React 18</span>
        </div>
        <div className="tech-badge">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>Vite + Node.js</span>
        </div>
        <div className="tech-badge">
          <Settings className="w-3.5 h-3.5 text-yellow-400" />
          <span>Solidity (Ethers)</span>
        </div>
        <div className="tech-badge">
          <Database className="w-3.5 h-3.5 text-green-400" />
          <span>MongoDB / JSON</span>
        </div>
        <div className="tech-badge">
          <Layers className="w-3.5 h-3.5 text-pink-400" />
          <span>Three.js Physics</span>
        </div>
        <div className="tech-badge">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Framer Motion</span>
        </div>
      </div>

      {/* 3. Contributor Info & Open Issues Grid */}
      <div className="contrib-grid">
        {/* How to Contribute steps */}
        <div className="contrib-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Quick Contribution Guide
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, lineHeight: 1.5 }}>
            Startora is a decentralized startup sandbox built collectively by engineers, researchers, and builders. Follow these steps to submit your first enhancement:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <span className="step-title">Fork the Repository</span>
                <span className="step-desc">
                  Create a copy of Startora under your own GitHub account. Click the 
                  <a href="https://github.com/Manvikamboz/Startora" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--neon-teal)', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}>
                    Fork button
                  </a> on our repository landing page.
                </span>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <span className="step-title">Clone & Install Dependencies</span>
                <span className="step-desc">
                  Pull your fork locally and run <span className="step-code">npm install</span> to establish all compiler hooks.
                </span>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <span className="step-title">Run the Startup Sandbox</span>
                <span className="step-desc">
                  Spin up the local node and hot reload using <span className="step-code">npm run dev</span>. Make your code adjustments.
                </span>
              </div>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <span className="step-title">Push & Create Pull Request</span>
                <span className="step-desc">
                  Push to your branch and click "Compare & pull request" on GitHub. We will review and auto-render your name in the contributor constellation!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Open Issues Feed */}
        <div className="contrib-card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <AlertCircle className="w-4 h-4 text-violet-400" />
            Good First Issues
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, lineHeight: 1.5 }}>
            Pick up an active task from our GitHub repository to kickstart your journey:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {openIssuesList.length > 0 ? (
              openIssuesList.map((issue, index) => (
                <a 
                  key={index} 
                  href={issue.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="issue-item"
                >
                  <div className="issue-title-row">
                    <span className="issue-title">#{issue.number}: {issue.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rgba(255,255,255,0.3) flex-shrink-0" />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {issue.labels && issue.labels.map((lbl, idx) => (
                      <span key={idx} className="issue-label">
                        {lbl}
                      </span>
                    ))}
                  </div>
                </a>
              ))
            ) : (
              <div style={{
                padding: '24px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                fontSize: '13px',
                lineHeight: 1.5
              }}>
                All caught up! No active open issues at the moment. Feel free to suggest an feature or bugfix on GitHub.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
