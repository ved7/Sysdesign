import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { ArrowRight, Book } from 'lucide-react';

const getBadgeClass = (difficulty) => {
  const key = difficulty.toLowerCase();
  if (key.includes('basic')) return 'badge basic';
  if (key.includes('intermediate')) return 'badge intermediate';
  return 'badge advanced';
};

const Topics = () => {
  return (
    <div className="container page-shell">
      <header className="page-header">
        <h1 className="page-title">
          Structured <span className="text-gradient">Curriculum</span>
        </h1>
        <p className="page-subtitle">
          Learn from first principles to distributed systems tradeoffs with a clear, module-based path.
        </p>
      </header>

      {curriculum.map((module, sectionIndex) => (
        <motion.section
          key={module.id}
          className="module-block"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
        >
          <h2 className="module-title">{module.title}</h2>
          <p className="module-subtitle">
            {module.description} {module.topics.length} structured topics.
          </p>
          <div className="grid topics">
            {module.topics.map((topic) => (
              <Link key={topic.id} to={`/topics/${topic.id}`} className="card">
                <div className="card-top">
                  <span className="icon-chip">
                    <Book size={17} />
                  </span>
                  <span className={getBadgeClass(topic.difficulty)}>{topic.difficulty}</span>
                </div>
                <h3 className="card-title">{topic.title}</h3>
                <p className="card-text">{topic.description}</p>
                <div className="card-footer section-link" style={{ marginTop: '1rem', borderTop: '1px solid rgba(95, 68, 42, 0.2)' }}>
                  Start lesson
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
};

export default Topics;
