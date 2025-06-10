
import { DesignItem } from '@/types';

export const designItems: DesignItem[] = [
  {
    id: 'business-card',
    name: 'Business Card',
    category: 'Print',
    sizes: ['Standard'],
    creditsPerCreative: 2,
    description: 'Professional business card design'
  },
  {
    id: 'brochure',
    name: 'Brochure',
    category: 'Print',
    sizes: ['Bi-fold A4/A5 4 pages', 'Tri-fold A4/A5 6 pages'],
    creditsPerCreative: 5,
    description: 'Marketing brochure design'
  },
  {
    id: 'flyer',
    name: 'Flyer',
    category: 'Print',
    sizes: ['A4', 'A5', 'Letter'],
    creditsPerCreative: 3,
    description: 'Promotional flyer design'
  },
  {
    id: 'poster',
    name: 'Poster',
    category: 'Print',
    sizes: ['A3', 'A2', 'A1'],
    creditsPerCreative: 4,
    description: 'Event or promotional poster'
  },
  {
    id: 'logo',
    name: 'Logo Design',
    category: 'Branding',
    sizes: ['Standard Package'],
    creditsPerCreative: 8,
    description: 'Professional logo design with variations'
  },
  {
    id: 'social-media',
    name: 'Social Media Graphics',
    category: 'Digital',
    sizes: ['Instagram Post', 'Facebook Cover', 'Twitter Header'],
    creditsPerCreative: 2,
    description: 'Social media graphics and posts'
  },
  {
    id: 'presentation',
    name: 'Presentation Design',
    category: 'Digital',
    sizes: ['Up to 10 slides', 'Up to 20 slides'],
    creditsPerCreative: 6,
    description: 'Professional presentation template'
  },
  {
    id: 'banner',
    name: 'Web Banner',
    category: 'Digital',
    sizes: ['Leaderboard', 'Rectangle', 'Skyscraper'],
    creditsPerCreative: 3,
    description: 'Web advertising banner'
  }
];
