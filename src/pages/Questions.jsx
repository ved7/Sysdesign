import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { questions } from '../data/questions';
import { PenTool, ArrowRight } from 'lucide-react';

const getBadgeClass = (difficulty) => {
  const key = difficulty.toLowerCase();
  if (key.includes('easy')) return 'badge easy';
  if (key.includes('hard')) return 'badge hard';
  return 'badge intermediate';
};

const Questions = () => {
  return (
    <div className="container page-shell">
      <header className="page-header">
        <h1 className="page-title">
          Real Interview <span className="text-gradient">Prompts</span>
        </h1>
        <p className="page-subtitle">
          Practice realistic prompts with system boundaries, load assumptions, and implementation tradeoffs.
        </p>
        <div style={{ marginTop: '1.15rem' }}>
          <Link to="/practice/live" className="btn-secondary">
            Open Real-Time Practice Studio
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="grid questions">
        {questions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link to={`/practice/${question.id}`} className="card">
              <div className="card-top">
                <span className={getBadgeClass(question.difficulty)}>{question.difficulty}</span>
                <PenTool size={18} color="var(--accent-deep)" />
              </div>

              <h3 className="card-title">{question.title}</h3>
              <p className="card-text">{question.summary}</p>

              <div className="card-footer">
                Includes architecture sketching and scale assumptions.
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Questions;
