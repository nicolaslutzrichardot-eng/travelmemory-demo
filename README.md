# SwissTravelMemory — V1 testable

Prototype fonctionnel du produit SwissTravelMemory : **Votre mémoire de voyage privée dans le cloud**.

## Tester

1. Décompressez `SwissTravelMemory_V1_testable.zip`.
2. Ouvrez `index.html` dans Chrome, Edge, Safari ou Firefox.
3. Une connexion Internet est nécessaire pour la carte OpenStreetMap et la lecture EXIF via les bibliothèques de démonstration.
4. Cliquez sur **Tester SwissTravelMemory** pour ouvrir l'application.

Pour une expérience plus fiable, vous pouvez aussi lancer un petit serveur local depuis le dossier :

```bash
python3 -m http.server 8080
```

Puis ouvrir `http://localhost:8080`.

## Ce qui fonctionne dans cette V1

- Site de commercialisation responsive.
- Entrée dans une application de démonstration.
- Carte mondiale OpenStreetMap avec voyages existants.
- Création de nouveaux voyages, conservés dans le navigateur via `localStorage`.
- Import local de photos choisies par l'utilisateur.
- Lecture de la date et tentative de lecture GPS EXIF.
- Regroupement simple des photos par mois et proposition de création de voyage.
- Simulation du partage par invitation et rôles.
- Simulation de l'abonnement cloud et de l'espace de stockage.
- Responsive desktop/tablette/mobile.

## Limites volontaires du prototype

- Aucun compte utilisateur réel.
- Aucun upload cloud réel : les photos restent locales dans cette démo.
- Aucun paiement réel.
- Pas encore de backend PostgreSQL/Supabase.
- Pas encore d'applications natives iOS/Android.
- Les voyages créés manuellement ne sont pas géocodés automatiquement dans cette version locale.

## Étape suivante recommandée

Transformer cette démo en architecture de production : authentification, base de données, stockage objet privé, règles d'accès, uploads reprenables, géocodage, abonnements, puis packaging iOS/Android.

## Nouveau : Centre d'importation
La V1 inclut désormais quatre sources : Cet appareil, iCloud Photos, Google Photos et Ordinateur.
- Cet appareil / Ordinateur : sélection locale réelle de fichiers et analyse EXIF dans le navigateur.
- iCloud Photos : utilise le sélecteur système de l'appareil. Sur iPhone/iPad/Mac, les photos disponibles via la photothèque Apple peuvent être proposées selon les réglages et autorisations de l'appareil.
- Google Photos : parcours de connexion et sélection simulé dans cette V1. La connexion réelle nécessitera un projet Google OAuth/Photos Picker et le backend SwissTravelMemory.

Aucun fichier n'est envoyé vers un serveur dans cette version locale.


## SwissTravelMemory V1.1 — Voyages détectés

Cette version ajoute le parcours testable **Photothèque → analyse dates/GPS → voyages proposés → Créer / Modifier / Ignorer**.

- `Sélectionner mes photos` analyse localement jusqu’à 250 images et tente de lire les métadonnées EXIF via exifr.
- Les photos sont regroupées selon les écarts de dates et, quand disponible, la distance GPS.
- `Tester avec des voyages de démonstration` permet de tester l’expérience sans utiliser de photos personnelles.
- Aucun fichier n’est envoyé vers un serveur dans cette démo.
- Sur iPhone/Android, un navigateur ne peut pas scanner librement toute la photothèque : la version native utilisera les permissions système prévues à cet effet.


## V1.1.1 correction
Les cartes de voyages détectés affichent maintenant explicitement le lieu, les villes/étapes, les dates de début/fin et le nombre de jours. Si le GPS manque, SwissTravelMemory l'indique clairement au lieu d'inventer un lieu.


## V1.1.2 — GPS et lieux
- Lecture EXIF renforcée avec exifr.
- Diagnostic visible : nombre de photos avec date et nombre de photos avec GPS accessible.
- Conversion latitude/longitude en ville/pays via OpenStreetMap Nominatim lorsque le GPS est disponible.
- Si Safari/iOS ne fournit pas le GPS dans le fichier choisi, SwissTravelMemory l'indique clairement au lieu d'inventer un lieu.

Important : certaines photos exportées depuis iOS/Google Photos peuvent ne plus contenir les coordonnées GPS selon les réglages de partage ou de confidentialité.


## V1.2 — parcours mobile natif
La démo distingue maintenant clairement :
- Web : analyse uniquement des fichiers explicitement sélectionnés, avec GPS seulement s'il est transmis par le navigateur.
- iOS/Android : futur parcours natif avec autorisation de photothèque, analyse locale date + position, regroupement et validation avant création.
- Un bouton « Simuler l’analyse iPhone / Android » permet de tester dès maintenant l’expérience finale sans prétendre que Safari donne accès à toute la photothèque.

La vraie analyse iOS nécessitera une application signée utilisant PhotoKit et une distribution de test (Xcode/TestFlight). Android utilisera les API/permissions adaptées à la version du système.


## V1.3.1
Correction de la page d’accueil : drapeau suisse visible dans le logo, palette rouge, nom SwissTravelMemory non masqué et carte repositionnée sans chevauchement.


## V1.4 Premium
Nouvelle page d’accueil premium, identité suisse renforcée et communication explicite RGPD + LPD suisse. Une note précise que la conformité juridique définitive dépendra de la mise en production réelle.


## V1.4.1 — affichage des lieux
- Si les photos Web contiennent un GPS, SwissTravelMemory convertit désormais les coordonnées en ville + pays.
- La source du lieu et les coordonnées sont visibles dans le voyage détecté.
- Si Safari/Chrome ne transmet pas le GPS, l'interface l'indique explicitement et propose la correction manuelle via « Modifier ».
- La version iOS/Android native reste la méthode privilégiée pour une détection automatique fiable depuis la photothèque.
