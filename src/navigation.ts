import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Find Help',
      links: [
        {
          text: 'Resource Directory',
          href: getPermalink('/directory'),
        },
        {
          text: 'Grants & Assistance',
          href: getPermalink('/grants'),
        },
        {
          text: 'Technology Access',
          href: getPermalink('/technology-access'),
        },
      ],
    },
    {
      text: 'About',
      links: [
        {
          text: 'Our Purpose',
          href: getPermalink('/purpose'),
        },
        {
          text: 'About Us',
          href: getPermalink('/about'),
        },
        {
          text: 'Partners',
          href: getPermalink('/partners'),
        },
      ],
    },
    {
      text: 'Programs',
      links: [
        {
          text: 'Programs',
          href: getPermalink('/programs'),
        },
        {
          text: 'Events',
          href: getPermalink('/events'),
        },
        {
          text: 'Volunteer',
          href: getPermalink('/volunteer'),
        },
      ],
    },
    {
      text: 'Contact',
      links: [
        {
          text: 'Contact Us',
          href: getPermalink('/contact'),
        },
        {
          text: 'Donate',
          href: getPermalink('/donate'),
        },
      ],
    },
  ],
  actions: [
    {
      text: 'Call 211',
      href: 'tel:211',
      variant: 'primary',
      icon: 'tabler:phone',
    },
  ],
};

export const footerData = {
  links: [
    {
      title: 'Resources',
      links: [
        { text: 'Resource Directory', href: getPermalink('/directory') },
        { text: 'Grants', href: getPermalink('/grants') },
        { text: 'Technology Help', href: getPermalink('/technology-access') },
        { text: 'Programs', href: getPermalink('/programs') },
      ],
    },
    {
      title: 'Organization',
      links: [
        { text: 'Purpose', href: getPermalink('/purpose') },
        { text: 'About Us', href: getPermalink('/about') },
        { text: 'Partners', href: getPermalink('/partners') },
        { text: 'Financials', href: getPermalink('/financials') },
      ],
    },
    {
      title: 'Get Involved',
      links: [
        { text: 'Volunteer', href: getPermalink('/volunteer') },
        { text: 'Donate', href: getPermalink('/donate') },
        { text: 'Events', href: getPermalink('/events') },
        { text: 'Contact', href: getPermalink('/contact') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
    { text: 'Terms of Service', href: getPermalink('/terms') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/baseimpact' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/baseimpact' },
  ],
  footNote: `
    Base Impact is a Florida nonprofit, pending 501(c)(3) approval. · 
    <a class="text-blue-600 underline dark:text-muted" href="mailto:info@baseimpact.org">info@baseimpact.org</a>
  `,
};

