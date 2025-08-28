import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Terms validation
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      signup({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        gender: formData.gender
      });
      setLoading(false);
      navigate('/');
    }, 2000);
  };

  return (
    <div className="auth-container">
      <div className="signup-container">
        <div className="signup-header text-center">
          <div className="signup-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* Name Fields */}
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-group">
                  <div className="input-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    className={`form-control ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <div className="input-group">
                  <div className="input-icon">
                    <i className="fas fa-user"></i>
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    className={`form-control ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <div className="input-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          {/* Password Fields */}
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <div className="input-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-group">
                  <div className="input-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  id="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                <label htmlFor="male">Male</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  id="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                <label htmlFor="female">Female</label>
              </div>
            </div>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </div>

          {/* Terms and Conditions */}
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I agree to the <a href="#" onClick={(e) => e.preventDefault()}>Terms and Conditions</a>
              </label>
            </div>
            {errors.terms && <div className="error-message">{errors.terms}</div>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="signup-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                Sign Up
              </>
            )}
          </button>

          {/* Sign In Link */}
          <div className="signin-link text-center">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </form>

        {/* Success Notification */}
        {loading && (
          <div className="success-notification">
            <i className="fas fa-check-circle"></i>
            Account created successfully! Redirecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
