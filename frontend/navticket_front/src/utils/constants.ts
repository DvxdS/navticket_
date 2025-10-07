// Ivorian Cities
export const IVORIAN_CITIES = [
    { id: 1, name: 'Abidjan', region: 'Lagunes' },
    { id: 2, name: 'Yamoussoukro', region: 'Lacs' },
    { id: 3, name: 'Bouaké', region: 'Vallée du Bandama' },
    { id: 4, name: 'Daloa', region: 'Sassandra-Marahoué' },
    { id: 5, name: 'San-Pédro', region: 'Bas-Sassandra' },
    { id: 6, name: 'Korhogo', region: 'Savanes' },
    { id: 7, name: 'Man', region: 'Montagnes' },
    { id: 8, name: 'Divo', region: 'Lôh-Djiboua' },
    { id: 9, name: 'Gagnoa', region: 'Gôh-Djiboua' },
    { id: 10, name: 'Abengourou', region: 'Comoé' },
    { id: 11, name: 'Soubré', region: 'Bas-Sassandra' },
    { id: 12, name: 'Odienné', region: 'Denguélé' },
  ] as const;
  
  // App Configuration
  export const APP_NAME = 'Navticket';
  export const APP_TAGLINE = 'Voyagez facilement en Côte d\'Ivoire';
  
  // API Configuration
  export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  // Brand Colors
  export const COLORS = {
    primary: '#73C8D2',    // Cyan
    secondary: '#FF9013',  // Orange
    accent: '#0046FF',     // Blue
  } as const;
  
  // Popular Routes (for landing page)
  export const POPULAR_ROUTES = [
    {
      id: 1,
      from: 'Abidjan',
      to: 'Yamoussoukro',
      duration: '3h',
      price: '5000',
      companies: 3,
    },
    {
      id: 2,
      from: 'Abidjan',
      to: 'Bouaké',
      duration: '4h',
      price: '7000',
      companies: 5,
    },
    {
      id: 3,
      from: 'Abidjan',
      to: 'San-Pédro',
      duration: '5h',
      price: '8000',
      companies: 4,
    },
    {
      id: 4,
      from: 'Abidjan',
      to: 'Korhogo',
      duration: '8h',
      price: '12000',
      companies: 2,
    },
  ] as const;
  
  // Trust Badges (for hero section)
  export const TRUST_BADGES = [
    {
      id: 1,
      icon: 'check',
      title: '1000+ Voyages',
      description: 'Réservés avec succès',
    },
    {
      id: 2,
      icon: 'shield',
      title: 'Paiement sécurisé',
      description: '100% protégé',
    },
    {
      id: 3,
      icon: 'clock',
      title: 'Support 24/7',
      description: 'Toujours disponible',
    },
    {
      id: 4,
      icon: 'star',
      title: '4.8/5 étoiles',
      description: 'Note moyenne',
    },
  ] as const;