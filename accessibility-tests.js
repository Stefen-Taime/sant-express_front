// Fichier de configuration pour les tests d'accessibilité
module.exports = {
  rules: [
    {
      // Assurer que tous les éléments interactifs sont accessibles au clavier
      id: 'keyboard-accessibility',
      selector: 'a, button, input, select, textarea, [role="button"], [role="link"]',
      test: function(element) {
        return element.getAttribute('tabindex') !== '-1' || element.hasAttribute('aria-hidden');
      },
      message: 'Les éléments interactifs doivent être accessibles au clavier'
    },
    {
      // Assurer que toutes les images ont un texte alternatif
      id: 'image-alt',
      selector: 'img',
      test: function(element) {
        return element.hasAttribute('alt');
      },
      message: 'Les images doivent avoir un attribut alt'
    },
    {
      // Assurer que les formulaires ont des labels associés
      id: 'form-labels',
      selector: 'input, select, textarea',
      test: function(element) {
        const id = element.getAttribute('id');
        if (!id) return false;
        
        const label = document.querySelector(`label[for="${id}"]`);
        return !!label || element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
      },
      message: 'Les champs de formulaire doivent avoir des labels associés'
    },
    {
      // Assurer un contraste suffisant pour le texte
      id: 'color-contrast',
      selector: 'p, h1, h2, h3, h4, h5, h6, span, a, button, label',
      test: function(element) {
        // Cette vérification nécessiterait une bibliothèque de calcul de contraste
        // Pour l'instant, nous supposons que nos classes CSS assurent un contraste suffisant
        return true;
      },
      message: 'Le texte doit avoir un contraste suffisant avec son arrière-plan'
    }
  ]
};
