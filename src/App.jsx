import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Topics from './pages/Topics';
import TopicDetail from './pages/TopicDetail';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import Home from './pages/Home';
import Basics from './pages/Basics';
import BasicDetail from './pages/BasicDetail';
import RealtimePractice from './pages/RealtimePractice';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="site-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/basics" element={<Basics />} />
          <Route path="/basics/:cardId" element={<BasicDetail />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/topics/:topicId" element={<TopicDetail />} />
          <Route path="/practice" element={<Questions />} />
          <Route path="/practice/live" element={<RealtimePractice />} />
          <Route path="/practice/:questionId" element={<QuestionDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
