import { useState, useRef, useEffect } from 'react';
import { Terminal, Send, GitCommit, GitBranch, Clock } from 'lucide-react';

const STATIC_CONTRACTS_RESPONSE = [
  'Checking deployed smart contracts on local testnet...',
  '---------------------------------------------------',
  '  Contract:   IdeaOwnership.sol',
  '  Network:    Localhost Hardhat Testnet (chainId: 31337)',
  '  Address:    0x5FbDB2315678afecb367f032d93F642f64180aa3',
  '  ABI:        Verified & Indexed',
  '  Status:     Online & Accepting Handshakes'
];

const STATIC_HELP_RESPONSE = [
  'Available commands:',
  '  /stats          Show GitHub repository statistics',
  '  /contributors   List active core builders',
  '  /contracts      Show deployed smart contract details',
  '  /clear          Clear terminal command history'
];

export default function TerminalSimulator() {
  const [history, setHistory] = useState([
    { text: 'Welcome to Launchpad Labs Developer Console v1.0.4', type: 'system' },
    { text: "Type '/help' to inspect available console parameters.", type: 'system' },
    { text: '', type: 'spacer' }
  ]);
  const [input, setInput] = useState('');
  const [commits, setCommits] = useState([]);
  const [loadingCommits, setLoadingCommits] = useState(true);
  const [stats, setStats] = useState({
    stargazers: 0,
    forks: 0,
    openIssues: 0,
    commitsCount: 6,
    contributors: [
      { name: "Manvi Kamboz", handle: "Manvikamboz", role: "Lead Architect" }
    ]
  });

  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/repo-stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            stargazers: data.stargazers,
            forks: data.forks,
            openIssues: data.openIssues,
            commitsCount: data.commitsCount,
            contributors: data.contributors || []
          });
          if (data.recentCommits && data.recentCommits.length > 0) {
            setCommits(data.recentCommits);
          }
        }
      } catch (err) {
        console.error('Error loading terminal repository stats:', err);
      } finally {
        setLoadingCommits(false);
      }
    };
    fetchStats();
  }, []);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newHistory = [...history, { text: `dev-guest:~$ ${input}`, type: 'input' }];

    if (cmd === '/clear') {
      setHistory([]);
      setInput('');
      return;
    }

    if (cmd === '/help') {
      STATIC_HELP_RESPONSE.forEach((line) => {
        newHistory.push({ text: line, type: 'output' });
      });
    } else if (cmd === '/stats') {
      const statsLines = [
        'Fetching Launchpad Labs repo statistics...',
        '-----------------------------------------',
        `  Stars:         ★ ${stats.stargazers} stargazers`,
        `  Forks:         ⑂ ${stats.forks} forks`,
        `  Commits:       ➔ ${stats.commitsCount} commits (main branch)`,
        `  Open Issues:   ✓ ${stats.openIssues} active issues`,
        '  License:       ■ MIT Open Source'
      ];
      statsLines.forEach((line) => {
        newHistory.push({ text: line, type: 'output' });
      });
    } else if (cmd === '/contributors') {
      const contribsLines = [
        'Active Open-Source Contributors:',
        '-----------------------------------------',
        ...stats.contributors.map(c => `  • @${c.handle} (${c.role})`)
      ];
      contribsLines.forEach((line) => {
        newHistory.push({ text: line, type: 'output' });
      });
    } else if (cmd === '/contracts') {
      STATIC_CONTRACTS_RESPONSE.forEach((line) => {
        newHistory.push({ text: line, type: 'output' });
      });
    } else {
      newHistory.push({ text: `bash: command parameters not recognized: '${input}'. Type '/help' for active commands.`, type: 'error' });
    }

    newHistory.push({ text: '', type: 'spacer' });
    setHistory(newHistory);
    setInput('');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (typeof dateStr === 'string' && dateStr.includes('ago')) return dateStr;
    try {
      const d = new Date(dateStr);
      const diff = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return dateStr;
    }
  };

  const normalizeAuthor = (author) => {
    if (author === 'Manvi Kamboz' || author === 'Manvi176') return 'Manvikamboz';
    return author;
  };

  return (
    <div className="terminal-sim-grid">
      {/* Interactive Command Console */}
      <div className="terminal-box glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>git@startora: ~</span>
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        <div className="terminal-body" style={{ flex: 1, padding: '20px', overflowY: 'auto', textAlign: 'left', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6' }}>
          {history.map((line, idx) => {
            if (line.type === 'spacer') return <div key={idx} style={{ height: '8px' }} />;
            let color = 'rgba(255, 255, 255, 0.85)';
            if (line.type === 'input') color = 'var(--neon-teal)';
            if (line.type === 'system') color = 'rgba(255,255,255,0.4)';
            if (line.type === 'error') color = '#f87171';
            return (
              <div key={idx} style={{ color, whiteSpace: 'pre-wrap' }}>
                {line.text}
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>

        <form onSubmit={handleCommandSubmit} style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)', padding: '10px 16px' }}>
          <span style={{ color: 'var(--neon-teal)', fontFamily: 'monospace', fontSize: '12px', marginRight: '8px', display: 'flex', alignItems: 'center' }}>dev-guest:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type /help..."
            style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <button type="submit" className="cursor-target" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            <Send className="w-4 h-4 hover:text-cyan-400 transition-colors" />
          </button>
        </form>
      </div>

      {/* Live Commit Feed */}
      <div className="terminal-live-feed glass">
        {/* Header */}
        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f', display: 'inline-block', boxShadow: '0 0 8px #27c93f' }} />
          Live Repository Activity
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          <GitBranch style={{ width: '11px', height: '11px', color: 'rgba(6,182,212,0.7)' }} />
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>
            Manvikamboz/Startora · main · {stats.commitsCount} commits
          </span>
        </div>

        {/* Commit cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '340px' }}>
          {loadingCommits && (
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', padding: '8px 0' }}>
              Fetching commits...
            </div>
          )}

          {!loadingCommits && commits.length === 0 && (
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', padding: '8px 0' }}>
              No commits found.
            </div>
          )}

          {commits.map((commit, idx) => (
            <div
              key={idx}
              className="glass"
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                animation: `scaleUp 0.3s ease-out ${idx * 60}ms both`
              }}
            >
              {/* SHA + timestamp row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GitCommit style={{ width: '12px', height: '12px', color: '#06b6d4', flexShrink: 0 }} />
                <code style={{
                  fontSize: '10px',
                  background: 'rgba(6,182,212,0.12)',
                  color: '#06b6d4',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  border: '1px solid rgba(6,182,212,0.2)'
                }}>
                  {commit.sha}
                </code>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock style={{ width: '9px', height: '9px' }} />
                  {formatDate(commit.date)}
                </span>
              </div>

              {/* Commit message */}
              <p style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.82)',
                margin: 0,
                lineHeight: '1.45',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {commit.message}
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>by</span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#8b5cf6', fontWeight: '600' }}>
                  @{normalizeAuthor(commit.author)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
