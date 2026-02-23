import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, BookOpen, PenTool, Home, GraduationCap, Radar } from 'lucide-react';

const Navbar = () => {
  const getLinkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <nav className="site-nav">
      <NavLink to="/" className="nav-brand" aria-label="SysDesign home">
        <Layers size={20} color="var(--accent-deep)" />
        <span className="text-gradient">SysDesign</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" className={getLinkClass}>
          <Home size={16} />
          Home
        </NavLink>
        <NavLink to="/basics" className={getLinkClass}>
          <GraduationCap size={16} />
          Basics
        </NavLink>
        <NavLink to="/topics" className={getLinkClass}>
          <BookOpen size={16} />
          Topics
        </NavLink>
        <NavLink to="/practice" end className={getLinkClass}>
          <PenTool size={16} />
          Practice
        </NavLink>
        <NavLink to="/practice/live" className={getLinkClass}>
          <Radar size={16} />
          Real-Time
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
