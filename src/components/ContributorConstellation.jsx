import { useEffect, useRef, useState } from 'react';
import { Users, GitFork, Star } from 'lucide-react';

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const INITIAL_CONTRIBUTORS = [
  { id: 1, name: "Manvi Kamboz", role: "Lead Architect", handle: "Manvikamboz", university: "Founder & Lead", avatar: "https://avatars.githubusercontent.com/u/178479748?v=4", xPercent: 50, yPercent: 45, radius: 14, color: "#06b6d4" },
  { id: 2, name: "Alex Chen", role: "AI Services Dev", handle: "alex-chen-mit", university: "MIT", avatar: "https://randomuser.me/api/portraits/men/32.jpg", xPercent: 28, yPercent: 25, radius: 10, color: "#8b5cf6" },
  { id: 3, name: "Yuki Tanaka", role: "Web3 Dev", handle: "yuki-tanaka-todai", university: "Tokyo U", avatar: "https://randomuser.me/api/portraits/women/44.jpg", xPercent: 20, yPercent: 65, radius: 10, color: "#8b5cf6" },
  { id: 4, name: "Sarah Jenkins", role: "UI/UX Design", handle: "sarahj-stanford", university: "Stanford", avatar: "https://randomuser.me/api/portraits/women/12.jpg", xPercent: 72, yPercent: 30, radius: 10, color: "#ec4899" },
  { id: 5, name: "David Kim", role: "DAO Sandbox", handle: "david-kim-snu", university: "SNU", avatar: "https://randomuser.me/api/portraits/men/85.jpg", xPercent: 40, yPercent: 80, radius: 10, color: "#06b6d4" },
  { id: 6, name: "Emily Watson", role: "Contract Auditor", handle: "emily-sec-ox", university: "Oxford", avatar: "https://randomuser.me/api/portraits/women/65.jpg", xPercent: 80, yPercent: 70, radius: 10, color: "#eab308" }
];

export default function ContributorConstellation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ stargazers: 0, forks: 0, contributors: 1 });

  const hoveredNodeRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Initialize or scale node coordinates relative to width/height
      nodesRef.current = INITIAL_CONTRIBUTORS.map((c) => ({
        ...c,
        x: (c.xPercent / 100) * canvas.width,
        y: (c.yPercent / 100) * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetRadius: c.radius,
        currentRadius: c.radius
      }));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Fetch live statistics from Express backend
    const fetchRepoStats = async () => {
      try {
        const res = await fetch('/api/repo-stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            stargazers: data.stargazers,
            forks: data.forks,
            contributors: data.contributorsCount
          });

          // Merge live contributors into the nodes array dynamically
          if (data.contributors && data.contributors.length > 0) {
            nodesRef.current = nodesRef.current.map((node, index) => {
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
          }
        }
      } catch (err) {
        console.error('Error fetching repo stats in UI:', err);
      }
    };

    fetchRepoStats();

    // Mouse movement
    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      // Check hover
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

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // 1. Draw Links between nodes
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

      // 2. Draw Links to mouse pointer if active
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

      // 3. Update & Draw Nodes
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

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="constellation-container glass" ref={containerRef} style={{ position: 'relative', width: '100%', height: '480px', borderRadius: '24px', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
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
  );
}
