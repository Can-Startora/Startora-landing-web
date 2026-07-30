// One-shot XSS cleanup script — run with: node backend/scripts/cleanXss.js
import 'dotenv/config';
import mongoose from 'mongoose';

const XSS_PATTERNS = [
  /<script/i,
  /onerror\s*=/i,
  /javascript:/i,
  /<img/i,
  /alert\s*\(/i,
  /on\w+\s*=/i,
  /xss/i,
];

function looksLikeXss(str) {
  if (!str || typeof str !== 'string') return false;
  const decoded = str
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#x27;/gi, "'").replace(/&#x2F;/gi, '/');
  return XSS_PATTERNS.some(p => p.test(str) || p.test(decoded));
}

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/startora';

try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 6000 });
  console.log('✓ Connected to MongoDB\n');

  const db = mongoose.connection.db;

  // ── Clean Questions collection ──
  const questionsCol = db.collection('questions');
  const allQ = await questionsCol.find({}).toArray();
  let deletedQ = 0;

  for (const q of allQ) {
    if (looksLikeXss(q.text) || looksLikeXss(q.askedBy)) {
      await questionsCol.deleteOne({ _id: q._id });
      console.log(`  ✗ Deleted XSS question: "${String(q.text).slice(0, 80)}"`);
      deletedQ++;
    } else if (q.answers?.length) {
      const clean = q.answers.filter(a => !looksLikeXss(a.text) && !looksLikeXss(a.answeredBy));
      if (clean.length < q.answers.length) {
        await questionsCol.updateOne({ _id: q._id }, { $set: { answers: clean } });
        console.log(`  ✓ Removed ${q.answers.length - clean.length} XSS answer(s) from: "${String(q.text).slice(0, 40)}"`);
      }
    }
  }

  // ── Clean Suggestions collection ──
  const suggestionsCol = db.collection('suggestions');
  const allS = await suggestionsCol.find({}).toArray();
  let deletedS = 0;

  for (const s of allS) {
    if (looksLikeXss(s.title) || looksLikeXss(s.description) || looksLikeXss(s.proposedBy)) {
      await suggestionsCol.deleteOne({ _id: s._id });
      console.log(`  ✗ Deleted XSS suggestion: "${String(s.title).slice(0, 80)}"`);
      deletedS++;
    }
  }

  console.log(`\n✅ Done: removed ${deletedQ} question(s) and ${deletedS} suggestion(s).`);
  await mongoose.disconnect();
} catch (err) {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
}
