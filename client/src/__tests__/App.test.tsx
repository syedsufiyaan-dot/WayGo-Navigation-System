import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.js';
import { ThemeProvider } from '../context/ThemeContext.js';
import { ToastProvider } from '../components/UI/Toast.js';
import { AuthPage } from '../pages/AuthPage.js';

describe('WayGo Client Component Tests', () => {
  it('renders WayGo full-screen authentication portal with title and tabs', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AuthPage />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    // Verify Title & Tagline
    expect(screen.getByText('WayGo')).toBeDefined();
    expect(screen.getByText(/Compare routes. Save time. Travel smart./i)).toBeDefined();

    // Verify Sign In & Create Account Tabs
    expect(screen.getByRole('tab', { name: /Sign In/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Create Account/i })).toBeDefined();

    // Verify 1-click Demo Explorer button
    expect(screen.getByText(/Explore Demo/i)).toBeDefined();
  });
});
