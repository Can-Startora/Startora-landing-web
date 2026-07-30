import { useState, useEffect } from 'react';

export function TypewriterHeading({ line1, line2, speed = 40 }) {
  const [displayedLine1, setDisplayedLine1] = useState('');
  const [displayedLine2, setDisplayedLine2] = useState('');
  const [isLine1Done, setIsLine1Done] = useState(false);
  const [isLine2Done, setIsLine2Done] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval1 = setInterval(() => {
      if (index <= line1.length) {
        setDisplayedLine1(line1.slice(0, index));
        index++;
      } else {
        clearInterval(interval1);
        setIsLine1Done(true);
      }
    }, speed);
    return () => clearInterval(interval1);
  }, [line1, speed]);

  useEffect(() => {
    if (!isLine1Done) return;
    let index = 0;
    const interval2 = setInterval(() => {
      if (index <= line2.length) {
        setDisplayedLine2(line2.slice(0, index));
        index++;
      } else {
        clearInterval(interval2);
        setIsLine2Done(true);
      }
    }, speed);
    return () => clearInterval(interval2);
  }, [isLine1Done, line2, speed]);

  return (
    <h1 className="hero-title" style={{ textAlign: 'center' }}>
      {displayedLine1}
      {!isLine1Done && <span className="typewriter-cursor">|</span>}
      {isLine1Done && <br />}
      {isLine1Done && (
        <span className="text-gradient">
          {displayedLine2}
          {!isLine2Done && <span className="typewriter-cursor">|</span>}
        </span>
      )}
    </h1>
  );
}

export function TypewriterParagraph({ text, speed = 18, delay = 1500 }) {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <p className="hero-description" style={{ textAlign: 'center', margin: '0 auto 36px' }}>
      {displayedText}
      {started && displayedText.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </p>
  );
}
