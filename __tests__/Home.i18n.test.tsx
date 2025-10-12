/**
 * Basic unit test for root-localized hero using React Testing Library.
 * Requires jest + @testing-library/react + @testing-library/jest-dom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageProvider } from '@/components/LanguageProvider';
import HeroLocalized from '@/components/HeroLocalized';

function renderWithProvider(lang?: string) {
  if (lang) {
    // set query param simulation by writing location.search (JSDOM)
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = new URL(`http://localhost/?lang=${lang}`) as any;
  }

  return render(
    <LanguageProvider>
      <HeroLocalized />
    </LanguageProvider>
  );
}

test('renders English hero by default', async () => {
  renderWithProvider('en');
  await waitFor(() => expect(screen.getByText(/Smart Farming/)).toBeInTheDocument());
  expect(document.documentElement.lang).toMatch(/en/);
  expect(document.documentElement.dir).toBe('ltr');
});

test('renders French hero when lang=fr', async () => {
  renderWithProvider('fr');
  await waitFor(() => expect(screen.getByText(/Résultats réels|Agriculture intelligente/)).toBeInTheDocument());
  expect(document.documentElement.lang).toMatch(/fr/);
  expect(document.documentElement.dir).toBe('ltr');
});

test('renders Arabic hero and sets RTL', async () => {
  renderWithProvider('ar');
  await waitFor(() => expect(screen.getByText(/نتائج حقيقية|الزراعة الذكية/)).toBeInTheDocument());
  expect(document.documentElement.lang).toMatch(/ar/);
  expect(document.documentElement.dir).toBe('rtl');
});
