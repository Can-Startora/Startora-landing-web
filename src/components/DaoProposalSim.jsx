import { useState, useEffect } from 'react';
import { Vote, Plus, Award, CheckCircle, XCircle, Loader2, Calendar, User, FileText } from 'lucide-react';

const PRESET_VOTERS = [
  { name: '@Manvikamboz', weight: 45.2, vote: 'YES' },
  { name: '@alex-chen-mit', weight: 24.5, vote: 'YES' },
  { name: '@yuki-tanaka-todai', weight: 19.8, vote: 'YES' },
  { name: '@sarahj-stanford', weight: 14.1, vote: 'NO' },
  { name: '@david-kim-snu', weight: 12.6, vote: 'YES' },
  { name: '@emily-sec-ox', weight: 8.5, vote: 'NO' }
];

export default function DaoProposalSim() {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');
  const [proposedBy, setProposedBy] = useState('');
  
  const [activeProposal, setActiveProposal] = useState(null);
  const [votingState, setVotingState] = useState('idle'); // idle, voting, ended
  const [votesYes, setVotesYes] = useState(0);
  const [votesNo, setVotesNo] = useState(0);
  const [voteLogs, setVoteLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch suggestions from backend API
  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/suggestions');
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleStartProposal = async (e) => {
    e.preventDefault();
    if (!proposalTitle.trim() || !proposalDesc.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: proposalTitle,
          description: proposalDesc,
          proposedBy: proposedBy.trim() || '@anonymous'
        })
      });
      if (res.ok) {
        setProposalTitle('');
        setProposalDesc('');
        setProposedBy('');
        await fetchSuggestions();
      }
    } catch (err) {
      console.error('Error creating suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startVoting = (suggestion) => {
    setActiveProposal(suggestion);
    setVotingState('voting');
    setVotesYes(0);
    setVotesNo(0);
    setVoteLogs([]);

    // Run simulated voting sequence
    let voterIndex = 0;
    const runSim = () => {
      if (voterIndex >= PRESET_VOTERS.length) {
        setVotingState('ended');
        return;
      }

      const voter = PRESET_VOTERS[voterIndex];
      setTimeout(() => {
        let yesVal = 0;
        let noVal = 0;
        if (voter.vote === 'YES') {
          yesVal = voter.weight;
          setVotesYes((prev) => prev + voter.weight);
        } else {
          noVal = voter.weight;
          setVotesNo((prev) => prev + voter.weight);
        }

        const newLog = `Voter ${voter.name} voted ${voter.vote} (voting power: ${voter.weight.toFixed(1)} voting weight)`;
        setVoteLogs((prev) => [newLog, ...prev]);

        voterIndex++;
        runSim();
      }, 800);
    };

    runSim();
  };

  // Persist vote results back to backend once voting simulation ends
  useEffect(() => {
    if (votingState === 'ended' && activeProposal) {
      const saveVoteResult = async () => {
        const total = votesYes + votesNo;
        const yesPercent = total > 0 ? (votesYes / total) * 100 : 0;
        const finalStatus = yesPercent > 50 ? 'passed' : 'rejected';
        
        try {
          await fetch(`/api/suggestions/${activeProposal.id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              votesYes,
              votesNo,
              status: finalStatus,
              voteLogs: [...voteLogs]
            })
          });
          fetchSuggestions();
        } catch (err) {
          console.error('Error saving vote results:', err);
        }
      };
      saveVoteResult();
    }
  }, [votingState]);

  const totalVotes = votesYes + votesNo;
  const yesPercent = totalVotes > 0 ? (votesYes / totalVotes) * 100 : 0;
  const noPercent = totalVotes > 0 ? (votesNo / totalVotes) * 100 : 0;

  return (
    <div className="dao-sim-container glass" style={{ minHeight: '480px' }}>
      
      {/* Left Panel: Suggestion List */}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', borderRight: '1px solid rgba(255, 255, 255, 0.06)', paddingRight: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', color: 'var(--neon-violet)', padding: '4px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', alignSelf: 'flex-start' }}>
          <Vote className="w-3.5 h-3.5" /> Open-Source Roadmap Suggestions
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Developer Suggestions</h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5', marginBottom: '20px' }}>
          Read, submit, and vote on community improvements. Persisted live in the Startora JSON database.
        </p>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '6px' }}>
            {suggestions.map((item) => (
              <div key={item.id} className="suggestion-card glass" style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User className="w-3 h-3 text-cyan-400" /> {item.proposedBy}
                  </span>
                  <span style={{ 
                    fontSize: '9px', 
                    fontWeight: '700', 
                    textTransform: 'uppercase', 
                    padding: '2px 8px', 
                    borderRadius: '99px',
                    background: item.status === 'passed' ? 'rgba(97,220,163,0.1)' : item.status === 'rejected' ? 'rgba(236,72,153,0.1)' : 'rgba(139,92,246,0.1)',
                    color: item.status === 'passed' ? 'var(--neon-teal)' : item.status === 'rejected' ? 'var(--neon-pink)' : 'var(--neon-violet)',
                    border: `1px solid ${item.status === 'passed' ? 'rgba(97,220,163,0.2)' : item.status === 'rejected' ? 'rgba(236,72,153,0.2)' : 'rgba(139,92,246,0.2)'}`
                  }}>
                    {item.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>{item.description}</p>
                
                {item.status === 'active' && votingState === 'idle' && (
                  <button 
                    onClick={() => startVoting(item)}
                    className="btn-primary cursor-target"
                    style={{ padding: '8px 12px', fontSize: '11px', marginTop: '6px', alignSelf: 'flex-start' }}
                  >
                    Start Voting Simulation
                  </button>
                )}

                {item.status !== 'active' && (
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    <span>YES: {item.votesYes?.toFixed(1) || 0}</span>
                    <span>NO: {item.votesNo?.toFixed(1) || 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel: Voting Process OR Suggestion Submission Form */}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', justifyContent: 'flex-start', paddingLeft: '10px' }}>
        {votingState !== 'idle' && activeProposal ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <div className="proposal-active-details glass" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consensus Session Active</span>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '4px', marginBottom: '8px' }}>{activeProposal.title}</h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>{activeProposal.description}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--neon-teal)', fontWeight: '600' }}>YES: {votesYes.toFixed(1)} weight</span>
                  <span style={{ color: 'var(--neon-pink)', fontWeight: '600' }}>NO: {votesNo.toFixed(1)} weight</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${yesPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-teal), #61dca3)', transition: 'width 0.3s ease' }} />
                  <div style={{ width: `${noPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--neon-pink), #ec4899)', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              {votingState === 'ended' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '12px', borderRadius: '10px', background: yesPercent > 50 ? 'rgba(97,220,163,0.08)' : 'rgba(236,72,153,0.08)', border: yesPercent > 50 ? '1px solid rgba(97,220,163,0.2)' : '1px solid rgba(236,72,153,0.2)' }}>
                  {yesPercent > 50 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: '600' }}>Proposal Passed! Stored in roadmap database.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-pink-400" />
                      <span style={{ fontSize: '12px', color: '#fbcfe8', fontWeight: '600' }}>Proposal Rejected. Insufficient vote weights.</span>
                    </>
                  )}
                  <button onClick={() => setVotingState('idle')} className="cursor-target" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer' }}>Close</button>
                </div>
              )}
            </div>

            {/* Voting logs stream */}
            <div className="dao-vote-stream glass" style={{ border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', background: '#0a0b10', padding: '16px', display: 'flex', flexDirection: 'column', height: '220px', overflowY: 'hidden' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award className="w-3.5 h-3.5 text-violet-400" /> Live Consensus Logs
              </h4>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {voteLogs.map((log, idx) => (
                  <div key={idx} style={{ fontSize: '10px', fontFamily: 'monospace', color: log.includes('YES') ? '#61dca3' : '#f472b6', animation: 'scaleUp 0.3s ease-out forwards' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartProposal} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus className="w-5 h-5 text-violet-400" /> Suggest an Open-Source Feature
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>YOUR GITHUB / USERNAME</label>
              <input
                type="text"
                value={proposedBy}
                onChange={(e) => setProposedBy(e.target.value)}
                placeholder="e.g. @dev-builder"
                className="waitlist-input"
                style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>FEATURE / UPGRADE TITLE</label>
              <input
                type="text"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                placeholder="e.g. Add Solana Web3 wallet support"
                required
                className="waitlist-input"
                style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>DETAILED DESCRIPTION</label>
              <textarea
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Explain the proposed architecture and benefit to the student ecosystem..."
                required
                rows={4}
                className="waitlist-input"
                style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '13px', resize: 'vertical', fontFamily: 'sans-serif' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary cursor-target" 
              style={{ padding: '12px 20px', fontSize: '13px', alignSelf: 'flex-start', marginTop: '6px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Proposal'} <Plus className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
