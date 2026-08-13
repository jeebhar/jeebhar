/**
 * Seed content used the first time the database is read.
 *
 * This is the one file to edit for copy changes before go-live; afterwards the
 * live content lives in MongoDB and is edited through /admin.
 */

/**
 * Photo helper for the Unsplash CDN.
 *
 * Each id below was verified against its Unsplash page description so the photo
 * genuinely depicts the cuisine on the card. These are free-licence placeholders
 * — replace them with real client photography as it becomes available.
 *
 * @param {string} id Unsplash photo id, e.g. `photo-1741376509680-9517d487689f`.
 */
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Reel helper.
 *
 * `thumbnailUrl` points at a self-hosted cover under `client/public/reels/`,
 * named after the reel's Instagram shortcode. Instagram does not expose covers
 * to third parties, so until a file is dropped in the card renders a branded
 * tile — see `client/public/reels/README.md`.
 *
 * @param {string} shortcode Instagram reel shortcode, e.g. `DQWG611DCCr`.
 * @param {string} title Card title.
 */
const reel = (shortcode, title) => ({
  title,
  thumbnailUrl: `/reels/${shortcode}.jpg`,
  instagramUrl: `https://www.instagram.com/reel/${shortcode}/`,
});

export const defaultContent = {
  brandName: 'Jeebhar',
  heroEyebrow: 'For restaurants and food brands',
  heroHeading: "Reimagine your restaurant's digital story and turn every scroll into footfall.",
  heroSubheading:
    'Jeebhar helps restaurants and food brands build an unforgettable social presence through strategy, content and performance campaigns.',
  mediaKitUrl: '/brand/media-kit.pdf',

  services: [
    {
      title: 'Brand Management',
      shortDescription: 'Build a memorable identity customers trust.',
      longDescription:
        'We shape your brand voice, visual identity and communication strategy so every post, reel and campaign reinforces the same positioning.',
    },
    {
      title: 'Social Media Management',
      shortDescription: 'Consistent publishing and growth-focused execution.',
      longDescription:
        'From content calendars to community engagement and analytics, we run your channels end to end with a growth mindset.',
    },
    {
      title: 'Content Creation',
      shortDescription: 'High-converting visuals and narratives.',
      longDescription:
        'We produce scroll-stopping photo, video and copy crafted specifically for restaurants and the people who love eating at them.',
    },
    {
      title: 'Social Media Advertising',
      shortDescription: 'Paid campaigns built for ROI.',
      longDescription:
        'We design and optimise ad funnels for awareness, bookings, online orders and repeat customers with data-backed targeting.',
    },
  ],

  // Cuisines we produce content for. Swap `photo(...)` for real client imagery.
  work: [
    {
      title: 'South Indian',
      imageUrl: photo('photo-1741376509680-9517d487689f'),
      description: 'Dosa, idli and thali storytelling that makes the filter coffee run cold.',
    },
    {
      title: 'Nepali Momo House',
      imageUrl: photo('photo-1534422298391-e4f8c172dddb'),
      description: 'Steam, chilli dip and the first bite — momos shot the way regulars order them.',
    },
    {
      title: 'Georgian Restaurant',
      imageUrl: photo('photo-1746185601009-3ddac4b23121'),
      description:
        'Khachapuri and khinkali framed for a cuisine most diners meet for the first time.',
    },
    {
      title: 'Mexican Grill House',
      imageUrl: photo('photo-1648437595587-e6a8b0cdf1f9'),
      description: 'Grill smoke, lime and salsa colour — high-energy creatives for a loud room.',
    },
    {
      title: 'North Indian',
      imageUrl: photo('photo-1742599361498-79824d24e355'),
      description: 'Butter chicken, tandoor char and fresh naan, styled for delivery-app appetite.',
    },
    {
      title: 'Italian Pizzeria',
      imageUrl: photo('photo-1622880833523-7cf1c0bd4296'),
      description:
        'The cheese pull, the leopard-spotted crust, the table everyone wants to sit at.',
    },
    {
      title: 'German Brauhaus',
      imageUrl: photo('photo-1745827223757-c98bc93108d2'),
      description:
        'Sausage, sauerkraut and beer-hall warmth translated into a social-first calendar.',
    },
    {
      title: 'Vietnamese Cuisine',
      imageUrl: photo('photo-1766050586763-723571af4dde'),
      description:
        'Broth steam, herbs and noodles — quiet, fresh frames that still stop the scroll.',
    },
  ],

  // Food vlogs and paid ad creatives.
  // Titles are placeholders — rename them from /admin to match each campaign.
  reels: [
    reel('DQWG611DCCr', 'Food reel 01'),
    reel('DPqOeoIjLh_', 'Food reel 02'),
    reel('DYhR4-mM0BV', 'Food reel 03'),
    reel('Dbu8-CPgzk3', 'Food reel 04'),
    reel('DXPCTb4jF2x', 'Food reel 05'),
    reel('DR4cFZFiAsH', 'Food reel 06'),
    reel('DP3J4VADCvy', 'Food reel 07'),
    reel('DPLYUGoDJ9U', 'Food reel 08'),
  ],

  // Travel reels.
  travelReels: [
    reel('DaiErQFgKyc', 'Travel reel 01'),
    reel('DTdFmqADE_Z', 'Travel reel 02'),
    reel('DRz0ai4jE-p', 'Travel reel 03'),
    reel('DOQW7hWDOtA', 'Travel reel 04'),
    reel('DNYF1KLsFEq', 'Travel reel 05'),
    reel('DNFUxQyoo2F', 'Travel reel 06'),
  ],

  mediaKitMetrics: [
    { label: 'Followers reached', value: '250K+' },
    { label: 'Monthly interactions', value: '1.8M+' },
    { label: 'Campaigns delivered', value: '120+' },
    { label: 'Cuisines covered', value: '8+' },
  ],

  contact: {
    address: 'Your Office Address, City, Country',
    email: 'hello@jeebhar.com',
    phone: '+91-90000-00000',
    facebookUrl: 'https://www.facebook.com/',
    youtubeUrl: 'https://www.youtube.com/',
    instagramUrl: 'https://www.instagram.com/',
    tiktokUrl: 'https://www.tiktok.com/',
  },
};
