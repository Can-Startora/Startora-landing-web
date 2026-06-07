import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Send, User, Calendar, PlusCircle, ArrowDown } from 'lucide-react';
import '../styles/CommunityQA.css';

export default function CommunityQA() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ text: '', askedBy: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Track which question IDs have the reply form open
  const [replyingTo, setReplyingTo] = useState({});
  // Track input for each answer form by question ID
  const [answerForms, setAnswerForms] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/questions');
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.text.trim()) {
      setError('Please type your question.');
      return;
    }
    if (!form.askedBy.trim()) {
      setError('Please enter your name or GitHub handle.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: form.text,
          askedBy: form.askedBy.startsWith('@') ? form.askedBy : `@${form.askedBy}`
        })
      });

      if (!res.ok) throw new Error('Question submission failed');
      const newQuestion = await res.json();

      setQuestions(prev => [newQuestion, ...prev]);
      setForm({ text: '', askedBy: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to post question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (e, questionId) => {
    e.preventDefault();
    const answerForm = answerForms[questionId] || { text: '', answeredBy: '' };

    if (!answerForm.text.trim()) return;
    if (!answerForm.answeredBy.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: answerForm.text,
          answeredBy: answerForm.answeredBy.startsWith('@') ? answerForm.answeredBy : `@${answerForm.answeredBy}`
        })
      });

      if (!res.ok) throw new Error('Answer submission failed');
      const updatedQuestion = await res.json();

      // Update local state
      setQuestions(prev => prev.map(q => q.id === questionId ? updatedQuestion : q));
      
      // Reset answer form
      setAnswerForms(prev => ({
        ...prev,
        [questionId]: { text: '', answeredBy: '' }
      }));
      // Close reply state
      setReplyingTo(prev => ({ ...prev, [questionId]: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReplyForm = (questionId) => {
    setReplyingTo(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    if (!answerForms[questionId]) {
      setAnswerForms(prev => ({
        ...prev,
        [questionId]: { text: '', answeredBy: '' }
      }));
    }
  };

  const handleAnswerChange = (questionId, field, value) => {
    setAnswerForms(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section id="qa-section" className="qa-section">
      <div className="section-header">
        <div className="qa-badge animate-float">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Q&A</span>
        </div>
        <h2 className="section-title">Ask the Community</h2>
        <p className="section-description">
          Have questions about the sandbox, developer tokens, or IP registry? Drop them below and co-builders will answer.
        </p>
      </div>

      <div className="qa-layout">
        {/* Ask Question Form */}
        <div className="qa-form-card glass">
          <div className="qa-card-header">
            <PlusCircle className="w-5 h-5 text-cyan-400" />
            <h3>Ask a New Question</h3>
          </div>
          <form onSubmit={handleAskSubmit} className="qa-ask-form">
            <div className="qa-form-group">
              <label htmlFor="qa-author">Name / GitHub Handle</label>
              <div className="qa-input-wrapper">
                <User className="w-4 h-4 text-cyan-400/50" />
                <input
                  id="qa-author"
                  type="text"
                  placeholder="e.g. Manvikamboz"
                  value={form.askedBy}
                  onChange={e => setForm(prev => ({ ...prev, askedBy: e.target.value }))}
                  className="qa-input"
                />
              </div>
            </div>

            <div className="qa-form-group">
              <label htmlFor="qa-text">Your Question</label>
              <textarea
                id="qa-text"
                rows="4"
                placeholder="What would you like to know about Startora?"
                value={form.text}
                onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
                className="qa-textarea"
              />
            </div>

            {error && <p className="qa-error-msg">{error}</p>}

            <button type="submit" disabled={submitting} className="qa-submit-btn">
              <span>{submitting ? 'Submitting...' : 'Post Question'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Questions Feed */}
        <div className="qa-feed-card glass">
          <div className="qa-card-header">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3>Community Discussions</h3>
          </div>

          <div className="qa-feed-list">
            {loading ? (
              <div className="qa-loading">
                <div className="qa-spinner"></div>
                <p>Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="qa-empty">
                <HelpCircle className="w-10 h-10 text-cyan-400/30" />
                <h4>No Questions Yet</h4>
                <p>Be the first to ask something about the platform!</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="qa-question-item glass animate-fadeIn">
                  <div className="qa-q-meta">
                    <span className="qa-q-author">{q.askedBy}</span>
                    <span className="qa-q-date">
                      <Calendar className="w-3 h-3" />
                      {formatDate(q.createdAt)}
                    </span>
                  </div>
                  <p className="qa-q-text">{q.text}</p>

                  {/* Answers Section */}
                  <div className="qa-answers-box">
                    {q.answers && q.answers.length > 0 && (
                      <div className="qa-answers-list">
                        {q.answers.map(ans => (
                          <div key={ans.id} className="qa-answer-item">
                            <div className="qa-a-meta">
                              <span className="qa-a-author">{ans.answeredBy}</span>
                              <span className="qa-a-date">{formatDate(ans.createdAt)}</span>
                            </div>
                            <p className="qa-a-text">{ans.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline reply action button */}
                    <div className="qa-action-row">
                      <button
                        onClick={() => toggleReplyForm(q.id)}
                        className={`qa-reply-toggle-btn ${replyingTo[q.id] ? 'active' : ''}`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{replyingTo[q.id] ? 'Cancel' : 'Answer Question'}</span>
                      </button>
                    </div>

                    {/* Inline Answer Form */}
                    {replyingTo[q.id] && (
                      <form
                        onSubmit={(e) => handleAnswerSubmit(e, q.id)}
                        className="qa-answer-form animate-fadeIn"
                      >
                        <div className="qa-inline-group">
                          <input
                            type="text"
                            placeholder="Name / Handle"
                            value={(answerForms[q.id] || {}).answeredBy || ''}
                            onChange={e => handleAnswerChange(q.id, 'answeredBy', e.target.value)}
                            className="qa-input-sm"
                            required
                          />
                          <input
                            type="text"
                            placeholder="Type your answer here..."
                            value={(answerForms[q.id] || {}).text || ''}
                            onChange={e => handleAnswerChange(q.id, 'text', e.target.value)}
                            className="qa-input-sm flex-grow"
                            required
                          />
                          <button type="submit" className="qa-send-btn">
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
