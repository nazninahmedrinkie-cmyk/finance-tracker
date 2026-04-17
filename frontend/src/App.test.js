import { render, screen } from '@testing-library/react';
import App from './App';

test('App loads homepage', () => {
  render(<App />);
  
  const element = screen.getByText(/FinTrack/i);
  expect(element).toBeInTheDocument();
});