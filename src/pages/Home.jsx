import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Book, PenTool, Sparkles } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { questions } from '../data/questions';
import { basicsSections } from '../data/basics';

const getBadgeClass = (difficulty) => {
  const key = difficulty.toLowerCase();
  if (key.includes('basic')) return 'badge basic';
  if (key.includes('intermediate')) return 'badge intermediate';
  if (key.includes('advanced')) return 'badge advanced';
  if (key.includes('easy')) return 'badge easy';
  if (key.includes('hard')) return 'badge hard';
  return 'badge';
};

const Home = () => {
  const basicSteps = basicsSections[0]?.cards.slice(0, 4) ?? [];
  const featuredTopics = curriculum.slice(1).flatMap((module) => module.topics).slice(0, 6);
  const featuredQuestions = questions.slice(0, 4);

  return (
    <div className="container page-shell">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <Sparkles size={14} />
            System Design Basics
          </span>
          <h1 className="hero-title">
            Learn System Design with
            <span className="text-gradient"> Structure and Depth</span>
          </h1>
          <p className="hero-subtitle">
            Follow a sequenced roadmap from scalability fundamentals to architecture trade-offs, distributed data patterns, caching, and real interview practice.
          </p>
          <div className="hero-actions">
            <Link to="/basics" className="btn-primary">
              Start with Basics
              <ArrowRight size={16} />
            </Link>
            <Link to="/topics" className="btn-secondary">
              Learning Roadmap
            </Link>
            <Link to="/practice" className="btn-secondary">
              Practice Questions
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="section section-structured">
        <div className="section-header">
          <h2 className="section-title">Basics</h2>
          <p className="section-desc">Build your foundation with core concepts before advanced topics.</p>
          <Link to="/basics" className="section-link">
            Explore basics
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid topics start-grid">
          {basicSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link to={`/basics/${step.id}`} className="card step-card">
                <div className="step-index">Basic {index + 1}</div>
                <h3 className="card-title">{step.title}</h3>
                <p className="card-text">{step.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section section-structured">
        <div className="section-header">
          <h2 className="section-title">Next Horizons</h2>
          <p className="section-desc">Explore core trade-offs, traffic management, and data systems.</p>
          <Link to="/topics" className="section-link">
            Browse all structured topics
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid topics">
          {featuredTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link to={`/topics/${topic.id}`} className="card">
                <div className="card-top">
                  <span className="icon-chip">
                    <Book size={17} />
                  </span>
                  <span className={getBadgeClass(topic.difficulty)}>{topic.difficulty}</span>
                </div>
                <h3 className="card-title">{topic.title}</h3>
                <p className="card-text">{topic.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section section-structured">
        <div className="section-header">
          <h2 className="section-title">Interview Practice</h2>
          <p className="section-desc">Apply concepts with real system design problems.</p>
          <Link to="/practice" className="section-link">
            Solve more questions
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid questions">
          {featuredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link to={`/practice/${question.id}`} className="card">
                <div className="card-top">
                  <span className={getBadgeClass(question.difficulty)}>{question.difficulty}</span>
                  <PenTool size={18} color="var(--accent-deep)" />
                </div>
                <h3 className="card-title">{question.title}</h3>
                <p className="card-text">{question.summary}</p>
                <div className="card-footer">Includes requirements, architecture, and trade-off framing.</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
