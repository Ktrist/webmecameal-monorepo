export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https://*.supabase.co'],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'editor.ckeditor.com',
            'cdn.ckeditor.com' // <-- AJOUTÉ
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'editor.ckeditor.com',
            'cdn.ckeditor.com' // <-- AJOUTÉ
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'storage.googleapis.com',
            'cdn.ckeditor.com' // <-- AJOUTÉ
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'storage.googleapis.com',
            'cdn.ckeditor.com' // <-- AJOUTÉ
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
        config: {
          // On autorise localhost ET 127.0.0.1 ET le port 3000
          origin: ['http://localhost:5173', 'http://127.0.0.1:3000', 'http://localhost:3000'],
          headers: '*',
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];