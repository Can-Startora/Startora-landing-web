import React, { useState, useEffect } from 'react';
import { X, Send, User, Folder, Calendar, Sparkles, Lightbulb } from 'lucide-react';
import '../styles/ExploreModal.css';

export default function ExploreModal({ category, onClose }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    proposedBy: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch existing ideas for this category
  useEffect(() => {
    let active = true;
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/ideas?category=${encodeURIComponent(category.title)}`);
        if (!res.ok) throw new Error('Failed to fetch ideas');
        const data = await res.json();
        if (active) {
          setIdeas(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching ideas:', err);
        if (active) setLoading(false);
      }
    };

    fetchIdeas();
    return () => {
      active = false;
    };
  }, [category.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.title.trim()) {
      setError('Please provide a name/title for your startup idea.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please provide a pitch or description of your startup idea.');
      return;
    }
    if (!form.proposedBy.trim()) {
      setError('Please specify the founder name or GitHub handle.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:3001/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          category: category.title,
          title: form.title,
          description: form.description,
          proposedBy: form.proposedBy.startsWith('@') ? form.proposedBy : `@${form.proposedBy}`
        })
      });

      if (!res.ok) throw new Error('Submission failed');
      const newIdea = await res.json();

      setIdeas(prev => [newIdea, ...prev]);
      setForm({ title: '', description: '', proposedBy: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError('Failed to submit your startup idea. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('explore-modal-overlay')) {
      onClose();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="explore-modal-overlay animate-fadeIn" onClick={handleOverlayClick}>
      <div className="explore-modal-container glass animate-scaleUp">
        {/* Close Button */}
        <button className="explore-close-btn" onClick={onClose} aria-label="Close modal">
          <X className="w-5 h-5" />
        </button>

        <div className="explore-modal-layout">
          {/* Left Pane: Category Details & Form */}
          <div className="explore-left-pane">
            <div className="explore-category-header">
              <div className="explore-category-badge">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>STARTUP SECTOR</span>
              </div>
              <h2 className="explore-category-title">{category.title}</h2>
              <p className="explore-category-desc">{category.description}</p>
            </div>

            <div className="explore-form-container">
              <div className="explore-form-header">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h3>Pitch Your Startup Idea</h3>
              </div>

              <form onSubmit={handleSubmit} className="explore-submit-form">
                <div className="explore-form-group">
                  <label htmlFor="idea-title">Idea / Project Name</label>
                  <input
                    id="idea-title"
                    type="text"
                    placeholder="e.g. AgriSensor IoT"
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    className="explore-input"
                  />
                </div>

                <div className="explore-form-group">
                  <label htmlFor="idea-founder">Founder Name / GitHub Handle</label>
                  <div className="explore-input-with-icon">
                    <User className="w-4 h-4 text-gray-500" />
                    <input
                      id="idea-founder"
                      type="text"
                      placeholder="e.g. Manvikamboz"
                      value={form.proposedBy}
                      onChange={e => setForm(prev => ({ ...prev, proposedBy: e.target.value }))}
                      className="explore-input"
                    />
                  </div>
                </div>

                <div className="explore-form-group">
                  <label htmlFor="idea-description">Elevator Pitch & Features</label>
                  <textarea
                    id="idea-description"
                    rows="4"
                    placeholder="Describe how it works, what problem it solves, and the tech stack you'll use..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="explore-textarea"
                  />
                </div>

                {error && <div className="explore-form-error">{error}</div>}
                {success && (
                  <div className="explore-form-success">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Idea registered successfully on-chain sandbox!</span>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="explore-submit-btn">
                  <span>{submitting ? 'Registering...' : 'Register Startup Idea'}</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Pane: Live Idea Feed */}
          <div className="explore-right-pane">
            <div className="explore-feed-header">
              <div className="explore-feed-badge">
                <span className="feed-pulse"></span>
                <span>LIVE FEED</span>
              </div>
              <h3>Active Sandbox Submissions</h3>
            </div>

            <div className="explore-feed-list">
              {loading ? (
                <div className="explore-feed-loading">
                  <div className="explore-spinner"></div>
                  <p>Retrieving active ideas...</p>
                </div>
              ) : ideas.length === 0 ? (
                <div className="explore-feed-empty glass">
                  <Lightbulb className="w-10 h-10 text-cyan-400/40" />
                  <h4>No Startup Ideas Yet</h4>
                  <p>Be the very first builder to register an idea in this category!</p>
                </div>
              ) : (
                ideas.map((idea) => (
                  <div key={idea.id} className="explore-idea-card glass animate-scaleUp">
                    <div className="explore-idea-card-header">
                      <h4 className="explore-idea-card-title">{idea.title}</h4>
                      <span className="explore-idea-card-date">
                        <Calendar className="w-3 h-3" />
                        {formatDate(idea.createdAt)}
                      </span>
                    </div>
                    <p className="explore-idea-card-desc">{idea.description}</p>
                    <div className="explore-idea-card-footer">
                      <div className="explore-idea-founder">
                        <span className="founder-label">Founder:</span>
                        <a
                          href={`https://github.com/${idea.proposedBy.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="founder-link"
                        >
                          {idea.proposedBy}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
