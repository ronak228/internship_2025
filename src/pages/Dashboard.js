import React from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // const { user, logout } = useAuth();

  // const handleLogout = () => {
  //   logout();
  // };

  return (
    <div className="dashboard">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-code"></i> Full Stack Portfolio
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#projects">
                  <i className="fas fa-folder"></i> Projects
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#features">
                  <i className="fas fa-star"></i> Features
                </a>
              </li>
                             {/* {user ? (
                 <li className="nav-item">
                   <button className="nav-link btn-link" onClick={handleLogout}>
                     <i className="fas fa-sign-out-alt"></i> Logout
                   </button>
                 </li>
               ) : (
                 <li className="nav-item">
                   <Link className="nav-link" to="/login">
                     <i className="fas fa-sign-in-alt"></i> Login
                   </Link>
                 </li>
               )} */}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Full Stack Web Development</h1>
          <p className="hero-subtitle">
            Professional web applications built with modern technologies
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects" className="container">
                 <div className="row">
                       <div className="col-lg-4 col-md-6 mb-4">
              <div className="project-card text-center">
                <div className="project-icon">
                  <i className="fab fa-bitcoin"></i>
                </div>
                <h3 className="project-title">CryptoPulse</h3>
                <p className="project-description">
                  Real-time cryptocurrency tracker with live prices, market data, interactive charts, and detailed coin information.
                </p>
                <div className="mb-3">
                  <span className="tech-badge">HTML5</span>
                  <span className="tech-badge">CSS3</span>
                  <span className="tech-badge">JavaScript</span>
                  <span className="tech-badge">jQuery</span>
                  <span className="tech-badge">Chart.js</span>
                  <span className="tech-badge">API</span>
                </div>
                <Link to="/crypto" className="project-btn">
                  <i className="fas fa-external-link-alt"></i> View Project
                </Link>
              </div>
            </div>

            {/* Weather Dashboard */}
            {/* <div className="col-lg-4 col-md-6 mb-4">
              <div className="project-card text-center">
                <div className="project-icon">
                  <i className="fas fa-cloud-sun"></i>
                </div>
                <h3 className="project-title">Weather Dashboard</h3>
                <p className="project-description">
                  Real-time weather application with location-based forecasts, interactive charts, and beautiful UI design.
                </p>
                <div className="mb-3">
                  <span className="tech-badge">HTML5</span>
                  <span className="tech-badge">CSS3</span>
                  <span className="tech-badge">JavaScript</span>
                  <span className="tech-badge">jQuery</span>
                  <span className="tech-badge">API</span>
                  <span className="tech-badge">Charts</span>
                </div>
                <Link to="/weather" className="project-btn">
                  <i className="fas fa-external-link-alt"></i> View Project
                </Link>
              </div>
            </div> */}

           {/* Real-Time Chat */}
           <div className="col-lg-4 col-md-6 mb-4">
             <div className="project-card text-center">
               <div className="project-icon">
                 <i className="fas fa-comments"></i>
               </div>
               <h3 className="project-title">Real-Time Chat</h3>
               <p className="project-description">
                 Live chat application with real-time messaging, user presence, typing indicators, and modern UI design.
               </p>
               <div className="mb-3">
                 <span className="tech-badge">React</span>
                 <span className="tech-badge">Socket.IO</span>
                 <span className="tech-badge">Real-time</span>
                 <span className="tech-badge">WebSocket</span>
                 <span className="tech-badge">Live Chat</span>
                 <span className="tech-badge">UI/UX</span>
               </div>
               <Link to="/chat" className="project-btn">
                 <i className="fas fa-external-link-alt"></i> View Project
               </Link>
             </div>
           </div>

           {/* Document Editor */}
           <div className="col-lg-4 col-md-6 mb-4">
             <div className="project-card text-center">
               <div className="project-icon">
                 <i className="fas fa-file-alt"></i>
               </div>
               <h3 className="project-title">Document Editor</h3>
               <p className="project-description">
                 Professional document editor with rich text formatting, auto-save, export options, and document management system.
               </p>
               <div className="mb-3">
                 <span className="tech-badge">HTML5</span>
                 <span className="tech-badge">CSS3</span>
                 <span className="tech-badge">JavaScript</span>
                 <span className="tech-badge">jQuery</span>
                 <span className="tech-badge">Rich Text</span>
                 <span className="tech-badge">Export</span>
               </div>
               <Link to="/editor" className="project-btn">
                 <i className="fas fa-external-link-alt"></i> View Project
               </Link>
             </div>
           </div>

           {/* Blog Management System */}
           <div className="col-lg-4 col-md-6 mb-4">
             <div className="project-card text-center">
               <div className="project-icon">
                 <i className="fas fa-blog"></i>
               </div>
               <h3 className="project-title">Blog Management System</h3>
               <p className="project-description">
                 Complete blog platform with post creation, categories, tags, and content management features.
               </p>
               <div className="mb-3">
                 <span className="tech-badge">HTML5</span>
                 <span className="tech-badge">CSS3</span>
                 <span className="tech-badge">JavaScript</span>
                 <span className="tech-badge">jQuery</span>
                 <span className="tech-badge">Local Storage</span>
                 <span className="tech-badge">CRUD</span>
               </div>
               <Link to="/blog" className="project-btn">
                 <i className="fas fa-external-link-alt"></i> View Project
               </Link>
             </div>
           </div>
        </div>

        {/* Features Section */}
        <div id="features" className="row mt-5">
          <div className="col-12">
            <div className="project-card">
              <h2 className="text-center mb-4">
                <i className="fas fa-rocket"></i> Key Features
              </h2>
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <h4>Responsive Design</h4>
                  <p>All applications are fully responsive and work perfectly on all devices.</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-database"></i>
                  </div>
                  <h4>Data Management</h4>
                  <p>Local storage integration for persistent data across sessions.</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h4>Interactive Charts</h4>
                  <p>Dynamic data visualization with Chart.js integration.</p>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <h4>Form Validation</h4>
                  <p>Comprehensive client-side validation for all user inputs.</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-palette"></i>
                  </div>
                  <h4>Modern UI</h4>
                  <p>Beautiful glass-morphism design with smooth animations.</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <div className="feature-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <h4>Fast Performance</h4>
                  <p>Optimized code for quick loading and smooth user experience.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
