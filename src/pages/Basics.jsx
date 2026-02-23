import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { basicsSections } from '../data/basics';

const Basics = () => {
  let globalIndex = 0;

  return (
    <div className="container page-shell">
      <header className="page-header">
        <h1 className="page-title">
          System Design <span className="text-gradient">Basics</span>
        </h1>
        <p className="page-subtitle">
          A structured, sequential guide from fundamentals to interview approach. Follow the cards in order to build a solid foundation.
        </p>
      </header>

      {basicsSections.map((section, sectionIndex) => {
        const startIndex = globalIndex;
        return (
          <motion.section
            key={section.id}
            className="module-block basics-module"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.06 }}
          >
            <h2 className="module-title">{section.title}</h2>
            <p className="module-subtitle">
              {section.cards.length} cards — follow in sequence.
            </p>
            <div className="grid basics-grid">
              {section.cards.map((card, cardIndex) => {
                const stepNum = startIndex + cardIndex + 1;
                globalIndex++;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: sectionIndex * 0.06 + cardIndex * 0.04 }}
                  >
                    <Link to={`/basics/${card.id}`} className="card basics-card">
                      <div className="card-top">
                        <span className="step-badge">#{stepNum}</span>
                        <span className="icon-chip">
                          <BookOpen size={16} />
                        </span>
                      </div>
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-text">{card.description}</p>
                      <div className="card-footer section-link">
                        Learn more
                        <ArrowRight size={15} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default Basics;
