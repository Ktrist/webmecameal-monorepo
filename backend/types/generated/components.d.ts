import type { Schema, Struct } from '@strapi/strapi';

export interface BlocsPageAvis extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_avis';
  info: {
    displayName: 'avis';
  };
  attributes: {
    nom: Schema.Attribute.String;
    note: Schema.Attribute.Integer;
    photo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    poste: Schema.Attribute.String;
    texte: Schema.Attribute.Text;
  };
}

export interface BlocsPageContentBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_content_blocks';
  info: {
    displayName: 'content_block';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    inverse: Schema.Attribute.Boolean;
    texte: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTQ4NzM1OTksImp0aSI6ImU5Y2FiN2I2LTVlZTYtNDZmMC1hZjEyLTQzODZiN2FhZGQyOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJiMGRkMmQ3NCJ9._FgL4N6ste_QZTA3-xIDP5Hh1xuQe_izfv7mAiwew1mdbA5JbZ1QBXDnbL2O9FFopXIUCGLgTtaAHwrzbrQsBg';
          output: 'HTML';
          preset: 'rich';
        }
      >;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_faq_sections';
  info: {
    displayName: 'faq_section';
  };
  attributes: {
    faq_item: Schema.Attribute.Component<'blocs-page.questions', true>;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageFeatures extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_features';
  info: {
    displayName: 'features';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icone: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageFeaturesList extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_features_lists';
  info: {
    displayName: 'features_list';
  };
  attributes: {
    feature_item: Schema.Attribute.Component<'blocs-page.features', true>;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageGrilleMenus extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_grille_menus';
  info: {
    displayName: 'grille_menus';
  };
  attributes: {
    fiche_recettes: Schema.Attribute.Relation<
      'oneToMany',
      'api::fiche-recette.fiche-recette'
    >;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageHero extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    image_fond: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    sous_titre: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTQ4NzM1OTksImp0aSI6ImU5Y2FiN2I2LTVlZTYtNDZmMC1hZjEyLTQzODZiN2FhZGQyOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJiMGRkMmQ3NCJ9._FgL4N6ste_QZTA3-xIDP5Hh1xuQe_izfv7mAiwew1mdbA5JbZ1QBXDnbL2O9FFopXIUCGLgTtaAHwrzbrQsBg';
          output: 'HTML';
          preset: 'standard';
        }
      >;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPagePricingGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_pricing_grids';
  info: {
    displayName: 'pricing_grid';
  };
  attributes: {
    offers: Schema.Attribute.Component<'elements.offer-card', true>;
    sous_titre: Schema.Attribute.String;
    titre: Schema.Attribute.String;
  };
}

export interface BlocsPageQuestions extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_questions';
  info: {
    displayName: 'questions';
  };
  attributes: {
    question: Schema.Attribute.String;
    reponse: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTQ4NzM1OTksImp0aSI6ImU5Y2FiN2I2LTVlZTYtNDZmMC1hZjEyLTQzODZiN2FhZGQyOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJiMGRkMmQ3NCJ9._FgL4N6ste_QZTA3-xIDP5Hh1xuQe_izfv7mAiwew1mdbA5JbZ1QBXDnbL2O9FFopXIUCGLgTtaAHwrzbrQsBg';
          output: 'HTML';
          preset: 'rich';
        }
      >;
  };
}

export interface BlocsPageTestimonialsGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocs_page_testimonials_grids';
  info: {
    displayName: 'testimonials_grid';
  };
  attributes: {
    testimonial_card: Schema.Attribute.Component<'blocs-page.avis', true>;
    titre: Schema.Attribute.String;
  };
}

export interface ElementsLien extends Struct.ComponentSchema {
  collectionName: 'components_elements_liens';
  info: {
    displayName: 'lien';
  };
  attributes: {
    label: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface ElementsOfferCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_offer_cards';
  info: {
    displayName: 'offer_card';
  };
  attributes: {
    features: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor.CKEditor',
        {
          licenseKey: 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3OTQ4NzM1OTksImp0aSI6ImU5Y2FiN2I2LTVlZTYtNDZmMC1hZjEyLTQzODZiN2FhZGQyOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCIsIkUyUCIsIkUyVyJdLCJyZW1vdmVGZWF0dXJlcyI6WyJQQiIsIlJGIiwiU0NIIiwiVENQIiwiVEwiLCJUQ1IiLCJJUiIsIlNVQSIsIkI2NEEiLCJMUCIsIkhFIiwiUkVEIiwiUEZPIiwiV0MiLCJGQVIiLCJCS00iLCJGUEgiLCJNUkUiXSwidmMiOiJiMGRkMmQ3NCJ9._FgL4N6ste_QZTA3-xIDP5Hh1xuQe_izfv7mAiwew1mdbA5JbZ1QBXDnbL2O9FFopXIUCGLgTtaAHwrzbrQsBg';
          output: 'HTML';
          preset: 'rich';
        }
      >;
    is_popular: Schema.Attribute.Boolean;
    price_per_meal: Schema.Attribute.String;
    titre: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocs-page.avis': BlocsPageAvis;
      'blocs-page.content-block': BlocsPageContentBlock;
      'blocs-page.faq-section': BlocsPageFaqSection;
      'blocs-page.features': BlocsPageFeatures;
      'blocs-page.features-list': BlocsPageFeaturesList;
      'blocs-page.grille-menus': BlocsPageGrilleMenus;
      'blocs-page.hero': BlocsPageHero;
      'blocs-page.pricing-grid': BlocsPagePricingGrid;
      'blocs-page.questions': BlocsPageQuestions;
      'blocs-page.testimonials-grid': BlocsPageTestimonialsGrid;
      'elements.lien': ElementsLien;
      'elements.offer-card': ElementsOfferCard;
    }
  }
}
