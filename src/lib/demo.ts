import { Platform } from 'react-native';
import type { Plant } from './types';

/**
 * Web demo mode: open the app with `?demo=1` to explore with sample plants. Nothing is saved,
 * so visitors can see the app before committing, and site screenshots come from real screens.
 * The flag sticks for the browser tab (navigation drops the query string).
 */
const KEY = 'happyleafy.demo';

export function isDemo(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  try {
    const param = new URLSearchParams(window.location.search).get('demo');
    if (param === '0') sessionStorage.removeItem(KEY);
    else if (param !== null) sessionStorage.setItem(KEY, '1');
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

/** Leave demo mode and reload into the user's own (empty or saved) collection. */
export function exitDemo() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.location.href = '/';
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
let seq = 0;
const ev = (type: Plant['history'][number]['type'], n: number, note?: string) => ({ id: `demo-e${seq++}`, type, at: daysAgo(n), note });
const waterings = (every: number, count: number, start: number) => Array.from({ length: count }, (_, i) => ev('water', start + i * every));

export function demoPlants(): Plant[] {
  return [
    {
      id: 'demo-monty',
      nickname: 'Monty',
      species: 'Monstera deliciosa',
      refPhoto: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Monstera_deliciosa2.jpg/500px-Monstera_deliciosa2.jpg', credit: 'Wikipedia' },
      commonName: 'Swiss cheese plant',
      location: 'Living room',
      createdAt: daysAgo(60),
      waterEveryDays: 7,
      fertilizeEveryDays: 30,
      potSize: 'medium',
      potMaterial: 'plastic',
      lightAtLocation: 'bright-indirect',
      lastWatered: daysAgo(8),
      lastFertilized: daysAgo(20),
      history: [...waterings(7, 7, 8), ev('fertilize', 20)],
      savedAdvice: [
        {
          id: 'demo-a1',
          at: daysAgo(5),
          source: 'chat',
          question: 'Why are the new leaves not splitting?',
          answer:
            'Young Monsteras grow solid leaves first. Splits (fenestrations) come with maturity and more light.\n• Move it closer to a bright window, out of direct midday sun.\n• Give it a moss pole to climb; climbing triggers bigger, split leaves.\n• Keep feeding monthly in spring and summer.',
          followUp: { dueAt: daysAgo(0), lookFor: 'Is the newest leaf bigger, or starting to show splits?' },
        },
      ],
    },
    {
      id: 'demo-fern',
      nickname: 'Fernanda',
      species: 'Nephrolepis exaltata',
      refPhoto: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Boston_Fern_%282873392811%29.png/500px-Boston_Fern_%282873392811%29.png', credit: 'Wikipedia' },
      commonName: 'Boston fern',
      location: 'Bathroom',
      createdAt: daysAgo(40),
      waterEveryDays: 3,
      fertilizeEveryDays: 30,
      potSize: 'small',
      lightAtLocation: 'medium',
      lastWatered: daysAgo(1),
      lastFertilized: daysAgo(12),
      history: [...waterings(3, 10, 1), ev('mist', 3)],
    },
    {
      id: 'demo-spike',
      nickname: 'Spike',
      species: 'Sansevieria trifasciata',
      refPhoto: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg/500px-Snake_Plant_%28Sansevieria_trifasciata_%27Laurentii%27%29.jpg', credit: 'Wikipedia' },
      commonName: 'Snake plant',
      location: 'Bedroom',
      createdAt: daysAgo(90),
      waterEveryDays: 18,
      fertilizeEveryDays: 60,
      potSize: 'medium',
      potMaterial: 'terracotta',
      lastWatered: daysAgo(10),
      lastFertilized: daysAgo(30),
      history: waterings(18, 4, 10),
    },
    {
      id: 'demo-basil',
      nickname: 'Basil',
      species: 'Ocimum basilicum',
      refPhoto: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Ocimum_basilicum_8zz.jpg/500px-Ocimum_basilicum_8zz.jpg', credit: 'Wikipedia' },
      commonName: 'Sweet basil',
      location: 'Kitchen',
      createdAt: daysAgo(25),
      waterEveryDays: 2,
      fertilizeEveryDays: 14,
      potSize: 'small',
      lightAtLocation: 'direct',
      lastWatered: daysAgo(3),
      lastFertilized: daysAgo(14),
      history: waterings(2, 8, 3),
    },
  ];
}
