export interface MCQQuestion {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface ChapterData {
  id: number;
  name: string;
  quiz: MCQQuestion[];
}

export const FILIERE_QUIZZES: Record<string, ChapterData[]> = {
  informatique: [
    {
      id: 1,
      name: "Introduction à la Programmation",
      quiz: [
        { q: "Quelle structure de données suit le principe LIFO (Last In, First Out) ?", opts: ["Piles", "Files", "Tableaux", "Arbres"], ans: 0, exp: "Une pile (Stack) insère et retire du même côté." },
        { q: "Quel mot-clé définit une constante en JavaScript ?", opts: ["var", "let", "const", "static"], ans: 2, exp: "const permet de déclarer une variable dont la valeur ne peut pas être réassignée." },
        { q: "Quelle est la complexité temporelle moyenne d'une recherche binaire ?", opts: ["O(1)", "O(N)", "O(log N)", "O(N²)"], ans: 2, exp: "La recherche dichotomique divise l'espace de recherche par deux à chaque étape." },
        { q: "Quel opérateur logique représente le ET en Java ?", opts: ["&", "&&", "|", "||"], ans: 1, exp: "&& est l'opérateur ET logique à court-circuit." },
        { q: "Que fait l'opérateur de modulo (%) ?", opts: ["Division entière", "Reste de la division entière", "Multiplication", "Puissance"], ans: 1, exp: "Le modulo donne le reste de la division d'un entier par un autre." }
      ]
    },
    {
      id: 2,
      name: "Algorithmes de Tri",
      quiz: [
        { q: "Quel tri a une complexité de O(N log N) dans le pire des cas ?", opts: ["Tri à bulles", "Tri rapide", "Tri fusion (Merge Sort)", "Tri par sélection"], ans: 2, exp: "Le tri fusion garantit O(N log N) dans tous les cas." },
        { q: "Quel est le pire des cas pour le Tri Rapide (QuickSort) ?", opts: ["Tableau déjà trié", "Tableau mélangé aléatoirement", "Tableau inversé", "Tableau de taille impaire"], ans: 0, exp: "Si le pivot est mal choisi sur un tableau déjà trié, la complexité chute à O(N²)." },
        { q: "Quel tri compare et échange les éléments adjacents de manière répétée ?", opts: ["Tri par insertion", "Tri à bulles (Bubble Sort)", "Tri rapide", "Tri fusion"], ans: 1, exp: "Le tri à bulles fait remonter les plus grands éléments comme des bulles." },
        { q: "Quel tri insère chaque élément à sa place dans une sous-liste triée ?", opts: ["Tri par sélection", "Tri par insertion", "Tri fusion", "Tri rapide"], ans: 1, exp: "Le tri par insertion construit la liste triée un élément à la fois." },
        { q: "Le tri par sélection est-il stable par défaut ?", opts: ["Oui", "Non", "Seulement si optimisé", "Parfois"], ans: 1, exp: "Le tri par sélection échange des éléments non adjacents, ce qui peut modifier l'ordre relatif d'éléments égaux." }
      ]
    },
    {
      id: 3,
      name: "Programmation Orientée Objet",
      quiz: [
        { q: "Qu'est-ce que l'encapsulation ?", opts: ["Masquer les détails internes d'un objet et n'exposer que le nécessaire", "Hériter des méthodes d'une autre classe", "Définir plusieurs méthodes avec le même nom", "Instancier une classe"], ans: 0, exp: "L'encapsulation protège l'état interne d'un objet en restreignant l'accès direct aux attributs." },
        { q: "Quel mot-clé permet d'accéder à la classe parente en Java/C++ ?", opts: ["parent", "super", "this", "base"], ans: 1, exp: "super fait référence au parent direct de la classe courante." },
        { q: "Qu'est-ce que le polymorphisme ?", opts: ["Créer des objets de types différents", "La capacité d'une méthode à se comporter différemment selon l'objet qui l'invoque", "Hériter de plusieurs classes", "Surcharger un constructeur"], ans: 1, exp: "Le polymorphisme permet d'utiliser une même interface pour des types sous-jacents différents." },
        { q: "Qu'est-ce qu'une classe abstraite ?", opts: ["Une classe qui ne peut pas être instanciée directement", "Une classe sans méthode", "Une classe héritant de plusieurs parents", "Une classe finale"], ans: 0, exp: "Une classe abstraite sert de modèle et doit être dérivée pour être instanciée." },
        { q: "En programmation, qu'est-ce qu'une interface ?", opts: ["Un écran utilisateur", "Un contrat définissant des signatures de méthodes sans implémentation", "Une classe concrète", "Un type de variable"], ans: 1, exp: "Une interface spécifie ce qu'une classe doit faire, sans dire comment elle le fait." }
      ]
    },
    {
      id: 4,
      name: "Structures de Données Avancées",
      quiz: [
        { q: "Quelle est la complexité d'insertion dans une table de hachage dans le cas idéal ?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], ans: 0, exp: "Dans le cas idéal (sans collision), l'insertion se fait en temps constant O(1)." },
        { q: "Quel arbre binaire de recherche s'auto-équilibre lors des insertions ?", opts: ["Arbre B", "Arbre AVL", "Arbre Rouge-Noir", "Les deux AVL et Rouge-Noir"], ans: 3, exp: "Les arbres AVL et Rouge-Noir sont tous deux des arbres binaires de recherche auto-équilibrés." },
        { q: "Dans un graphe, quel parcours utilise une file (FIFO) ?", opts: ["Parcours en profondeur (DFS)", "Parcours en largeur (BFS)", "Dijkstra", "Kruskal"], ans: 1, exp: "Le parcours en largeur (Breadth-First Search) visite niveau par niveau à l'aide d'une file." },
        { q: "Quel algorithme trouve le plus court chemin depuis un sommet source ?", opts: ["Kruskal", "Prim", "Dijkstra", "Bellman-Ford pour graphe non pondéré"], ans: 2, exp: "Dijkstra trouve les plus courts chemins dans un graphe à poids positifs." },
        { q: "Qu'est-ce qu'un arbre couvrant de poids minimal (MST) ?", opts: ["Un sous-graphe sans cycle reliant tous les sommets avec le poids total minimal", "Un arbre binaire trié", "Un chemin le plus court", "Un graphe orienté acyclique"], ans: 0, exp: "Un MST relie tous les nœuds avec le coût de câblage le plus faible possible." }
      ]
    },
    {
      id: 5,
      name: "Bases de Données & SQL",
      quiz: [
        { q: "Quelle clause SQL filtre les groupes après agrégation ?", opts: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], ans: 1, exp: "HAVING filtre les groupes générés par GROUP BY, contrairement à WHERE qui filtre les lignes individuelles." },
        { q: "Quelle clé garantit l'intégrité référentielle entre deux tables ?", opts: ["Clé primaire", "Clé étrangère", "Clé candidate", "Clé composite"], ans: 1, exp: "Une clé étrangère lie une colonne d'une table à la clé primaire d'une autre table." },
        { q: "Quelle forme normale élimine les dépendances transitives ?", opts: ["1NF", "2NF", "3NF", "BCNF"], ans: 2, exp: "La 3ème forme normale exige que toutes les colonnes non clés dépendent directement et uniquement de la clé primaire." },
        { q: "Que signifie le 'I' dans ACID pour les transactions ?", opts: ["Intégrité", "Isolation", "Immutabilité", "Indépendance"], ans: 1, exp: "Isolation garantit que les transactions s'exécutent indépendamment les unes des autres sans interférence." },
        { q: "Quel type de jointure SQL retourne toutes les lignes de la table gauche, même sans correspondance ?", opts: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], ans: 1, exp: "LEFT JOIN (ou LEFT OUTER JOIN) conserve toutes les lignes de la table de gauche." }
      ]
    },
    {
      id: 6,
      name: "Réseaux & Protocoles IP",
      quiz: [
        { q: "À quelle couche du modèle OSI appartient le protocole IP ?", opts: ["Liaison de données", "Réseau", "Transport", "Application"], ans: 1, exp: "IP est le protocole de base de la couche 3 (Réseau)." },
        { q: "Quel protocole associe dynamiquement une adresse IP à une adresse MAC ?", opts: ["DNS", "DHCP", "ARP", "ICMP"], ans: 2, exp: "ARP (Address Resolution Protocol) résout les adresses IP en adresses physiques MAC." },
        { q: "Quelle est la taille d'une adresse IPv6 ?", opts: ["32 bits", "64 bits", "128 bits", "256 bits"], ans: 2, exp: "Une adresse IPv6 fait 128 bits, écrite en hexadécimal." },
        { q: "Quel protocole de transport garantit la livraison ordonnée et fiable des paquets ?", opts: ["UDP", "TCP", "SCTP", "ICMP"], ans: 1, exp: "TCP établit une connexion et gère les accusés de réception et le contrôle de flux." },
        { q: "Quel port par défaut est utilisé pour les connexions HTTPS ?", opts: ["80", "21", "443", "22"], ans: 2, exp: "HTTPS utilise le port 443 sécurisé par défaut, tandis que HTTP utilise le port 80." }
      ]
    },
    {
      id: 7,
      name: "Systèmes d'Exploitation",
      quiz: [
        { q: "Qu'est-ce qu'un interblocage (Deadlock) ?", opts: ["Un processus trop lent", "Une situation où plusieurs processus s'attendent mutuellement en bloquant des ressources", "Une panne matérielle", "Une erreur système"], ans: 1, exp: "Un interblocage survient lorsque des processus s'attendent en boucle pour des ressources verrouillées." },
        { q: "Quelle est la différence entre un processus et un thread ?", opts: ["Aucune", "Un processus partage sa mémoire avec d'autres processus", "Un thread est une unité d'exécution au sein d'un processus et partage sa mémoire", "Un processus est plus petit"], ans: 2, exp: "Un thread est un flux d'exécution léger au sein d'un processus parent, partageant son espace mémoire." },
        { q: "Quel mécanisme simule de la mémoire vive supplémentaire à l'aide du disque dur ?", opts: ["RAM virtuelle", "Pagination", "Mémoire Virtuelle (Swap)", "Cache L1"], ans: 2, exp: "La mémoire virtuelle permet de déplacer des pages de code inactives sur le disque dur." },
        { q: "Quel algorithme d'ordonnancement attribue le CPU à chaque processus pendant un temps fixe ?", opts: ["FIFO", "Shortest Job First", "Round Robin (Tourniquet)", "Priorité"], ans: 2, exp: "Round Robin distribue le CPU par tranches de temps (quanta)." },
        { q: "Quel composant matériel gère la traduction des adresses virtuelles en physiques ?", opts: ["CPU", "ALU", "MMU (Memory Management Unit)", "RAM"], ans: 2, exp: "La MMU effectue la traduction d'adresse en temps réel à l'aide de tables de pages." }
      ]
    },
    {
      id: 8,
      name: "Développement Web & DOM",
      quiz: [
        { q: "Quel événement JavaScript se déclenche lorsque la page HTML est complètement chargée et analysée ?", opts: ["load", "click", "DOMContentLoaded", "ready"], ans: 2, exp: "DOMContentLoaded se déclenche lorsque le DOM est prêt, sans attendre les images et feuilles de style." },
        { q: "Quelle méthode sélectionne un élément HTML par son identifiant unique ?", opts: ["getElementByClass", "querySelectorAll", "getElementById", "find"], ans: 2, exp: "document.getElementById('id') retourne l'élément correspondant à cet ID unique." },
        { q: "Que signifie CSS ?", opts: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"], ans: 1, exp: "Cascading Style Sheets définit les styles et la mise en page des pages web." },
        { q: "Quel framework JavaScript utilise un DOM virtuel pour optimiser les rendus ?", opts: ["Angular", "jQuery", "React", "Backbone"], ans: 2, exp: "React utilise un Virtual DOM pour minimiser les manipulations directes et lentes du DOM réel." },
        { q: "Quel code d'état HTTP représente un accès interdit (Forbidden) ?", opts: ["401", "403", "404", "500"], ans: 1, exp: "Le code 403 indique que le client est authentifié mais n'a pas les droits requis pour accéder à la ressource." }
      ]
    },
    {
      id: 9,
      name: "Cybersécurité & Chiffrement",
      quiz: [
        { q: "Quelle attaque consiste à injecter des scripts malveillants dans des pages web visitées par d'autres utilisateurs ?", opts: ["SQL Injection", "XSS (Cross-Site Scripting)", "CSRF", "Phishing"], ans: 1, exp: "XSS exploite la confiance d'un navigateur envers un site web en y injectant du code JS." },
        { q: "Quel algorithme de chiffrement est asymétrique ?", opts: ["AES", "DES", "RSA", "Blowfish"], ans: 2, exp: "RSA utilise une clé publique pour chiffrer et une clé privée pour déchiffrer." },
        { q: "Qu'est-ce que le Salage (Salting) en cryptographie ?", opts: ["Chiffrer deux fois", "Ajouter une chaîne aléatoire au mot de passe avant hachage", "Nettoyer la base de données", "Ralentir le calcul"], ans: 1, exp: "Le sel empêche l'utilisation de tables de hachages précalculées (Rainbow Tables) pour casser les mots de passe." },
        { q: "Quel protocole sécurise les transferts de fichiers en chiffrant la connexion via SSH ?", opts: ["FTP", "FTPS", "SFTP", "TFTP"], ans: 2, exp: "SFTP (SSH File Transfer Protocol) utilise un canal sécurisé SSH." },
        { q: "Quel acronyme désigne le principe de moindre privilège ?", opts: ["CIA", "POLP (Principle of Least Privilege)", "OWASP", "NIST"], ans: 1, exp: "Le principe exige qu'un utilisateur n'ait que les accès strictement requis pour son travail." }
      ]
    },
    {
      id: 10,
      name: "Génie Logiciel de Base",
      quiz: [
        { q: "Quelle commande Git crée une copie locale d'un dépôt distant ?", opts: ["git init", "git clone", "git fork", "git pull"], ans: 1, exp: "git clone télécharge le dépôt distant et configure le suivi des branches." },
        { q: "Qu'est-ce qu'une méthode agile ?", opts: ["Un langage de programmation", "Un cadre de gestion de projet itératif et collaboratif", "Une technique de refactoring", "Un type de base de données"], ans: 1, exp: "Les méthodes agiles (comme Scrum) découpent le projet en itérations courtes centrées sur le client." },
        { q: "Quel test valide le fonctionnement d'un composant de code isolé (comme une fonction) ?", opts: ["Test d'intégration", "Test unitaire", "Test de non-régression", "Test de charge"], ans: 1, exp: "Le test unitaire isole une unité logique de code pour valider son comportement exact." },
        { q: "En méthodologie Scrum, quel rôle représente la voix du client et gère le Backlog ?", opts: ["Scrum Master", "Product Owner", "Développeur principal", "Stakeholder"], ans: 1, exp: "Le Product Owner (PO) définit les fonctionnalités et priorise le Product Backlog." },
        { q: "Que signifie CI/CD ?", opts: ["Code Integration / Code Delivery", "Continuous Integration / Continuous Deployment", "Computer Integration / Cloud Deployment", "Continuous Input / Continuous Output"], ans: 1, exp: "CI/CD automatise l'intégration, les tests et le déploiement du code en production." }
      ]
    }
  ],
  genie_logiciel: [
    {
      id: 1,
      name: "Cycle de vie du logiciel",
      quiz: [
        { q: "Quelle méthode de développement découpe le cycle de vie en sprints courts ?", opts: ["Cascade (Waterfall)", "Cycle en V", "Agile (Scrum)", "RUP"], ans: 2, exp: "La méthodologie Scrum utilise des sprints (itérations) de 1 à 4 semaines." },
        { q: "Dans DevOps, quel principe automatise la livraison du code jusqu'à la production ?", opts: ["Versioning", "Tests unitaires", "Déploiement Continu (CD)", "Planification"], ans: 2, exp: "Le CD (Continuous Deployment) déploie automatiquement le code validé en production." },
        { q: "Quelle phase du cycle en V valide directement la phase de spécifications fonctionnelles ?", opts: ["Tests unitaires", "Tests d'intégration", "Tests de recette", "Codage"], ans: 2, exp: "Les tests de recette (UAT) valident que le système répond aux besoins spécifiés par le client." },
        { q: "Quel est le principal inconvénient du modèle en cascade (Waterfall) ?", opts: ["Difficile de gérer les changements tardifs", "Trop rapide", "Pas de documentation", "Réservé aux petits projets"], ans: 0, exp: "Le modèle en cascade est séquentiel, ce qui rend les modifications de besoins tardives extrêmement coûteuses." },
        { q: "Qu'est-ce qu'un MVP (Minimum Viable Product) ?", opts: ["Un produit parfait sans bug", "La version minimale fonctionnelle d'un produit permettant de récolter des retours", "Une maquette non interactive", "Un document technique"], ans: 1, exp: "Un MVP permet de valider des hypothèses sur le marché avec un effort de développement minimal." }
      ]
    },
    {
      id: 2,
      name: "Gestion de versions (Git)",
      quiz: [
        { q: "Quelle commande fusionne une branche dans la branche courante en créant un commit de merge ?", opts: ["git rebase", "git merge", "git push", "git checkout"], ans: 1, exp: "git merge réunit les historiques en créant un commit de fusion." },
        { q: "Comment annuler des modifications de fichiers non committés en revenant au dernier commit ?", opts: ["git reset --hard", "git revert", "git clean", "git push"], ans: 0, exp: "git reset --hard annule toutes les modifications locales non validées." },
        { q: "Quelle est la différence entre git fetch et git pull ?", opts: ["Aucune", "git pull télécharge les commits sans les fusionner", "git fetch télécharge l'historique sans modifier votre branche locale tandis que git pull fusionne immédiatement", "git fetch pousse le code"], ans: 2, exp: "git pull est l'équivalent de faire git fetch suivi de git merge." },
        { q: "Quel outil de Git permet de sauvegarder temporairement des modifications non committées pour travailler sur autre chose ?", opts: ["git stash", "git commit", "git branch", "git checkout"], ans: 0, exp: "git stash met de côté les modifications de la zone de travail pour retrouver un état propre." },
        { q: "Que fait la commande git rebase ?", opts: ["Supprime l'historique", "Réécrit l'historique en appliquant les commits d'une branche sur la base d'une autre", "Crée une nouvelle branche", "Pousse le code vers le dépôt distant"], ans: 1, exp: "git rebase permet de maintenir un historique linéaire en déplaçant la base d'une branche." }
      ]
    },
    {
      id: 3,
      name: "Principes SOLID",
      quiz: [
        { q: "Que signifie le 'S' dans SOLID ?", opts: ["Single Responsibility Principle (Responsabilité Unique)", "State Pattern", "Software Design", "Static Class"], ans: 0, exp: "Une classe ne doit avoir qu'une seule et unique raison de changer." },
        { q: "Quel principe stipule qu'une classe doit être ouverte à l'extension mais fermée à la modification ?", opts: ["OCP (Open/Closed Principle)", "LSP", "ISP", "DIP"], ans: 0, exp: "OCP permet d'ajouter de nouveaux comportements sans modifier le code existant." },
        { q: "Selon le principe de substitution de Liskov (LSP), que doit-on pouvoir faire avec une sous-classe ?", opts: ["La renommer", "Remplacer la classe parente par la sous-classe sans altérer la correction du programme", "La rendre abstraite", "Supprimer ses méthodes parente"], ans: 1, exp: "Les objets d'une sous-classe doivent se comporter de la même manière que les objets de la classe de base." },
        { q: "Quel principe évite qu'une classe ne dépende de méthodes qu'elle n'utilise pas ?", opts: ["ISP (Interface Segregation Principle)", "SRP", "DIP", "OCP"], ans: 0, exp: "ISP préconise plusieurs interfaces spécifiques plutôt qu'une seule interface générale." },
        { q: "Que préconise le principe d'inversion des dépendances (DIP) ?", opts: ["Dépendre des classes concrètes", "Dépendre des abstractions", "Inverser l'ordre des constructeurs", "Éviter l'héritage"], ans: 1, exp: "DIP stipule que les modules de haut niveau ne doivent pas dépendre des modules de bas niveau, mais d'abstractions." }
      ]
    },
    {
      id: 4,
      name: "Design Patterns de Création",
      quiz: [
        { q: "Quel pattern garantit qu'une classe n'a qu'une seule instance globale ?", opts: ["Factory", "Builder", "Prototype", "Singleton"], ans: 3, exp: "Le Singleton restreint l'instanciation d'une classe à un seul objet accessible globalement." },
        { q: "Quel pattern instancie des objets sans exposer la logique de création au client ?", opts: ["Factory Method (Fabrique)", "Singleton", "Adapter", "Strategy"], ans: 0, exp: "Le pattern Fabrique définit une interface de création d'objets en laissant les sous-classes choisir le type d'objet." },
        { q: "Quel pattern est adapté pour construire un objet complexe étape par étape ?", opts: ["Prototype", "Singleton", "Builder (Monteur)", "Facade"], ans: 2, exp: "Le pattern Builder sépare la construction d'un objet complexe de sa représentation." },
        { q: "Quel pattern duplique des objets existants sans dépendre de leurs classes concrètes ?", opts: ["Prototype", "Factory", "Singleton", "Abstract Factory"], ans: 0, exp: "Prototype déclare une interface clonable pour dupliquer des instances existantes." },
        { q: "Quelle est la fonction du pattern Abstract Factory ?", opts: ["Créer une instance unique", "Fournir une interface pour créer des familles d'objets liés sans spécifier leurs classes concrètes", "Modifier un objet à la volée", "Simplifier les jointures SQL"], ans: 1, exp: "Il fournit une super-fabrique qui crée d'autres fabriques de manière abstraite." }
      ]
    },
    {
      id: 5,
      name: "Design Patterns de Structure",
      quiz: [
        { q: "Quel pattern fait collaborer des interfaces incompatibles ?", opts: ["Decorator", "Adapter (Adaptateur)", "Bridge", "Composite"], ans: 1, exp: "L'Adaptateur convertit l'interface d'une classe en une autre interface attendue par le client." },
        { q: "Quel pattern ajoute dynamiquement des responsabilités à un objet sans modifier son code ?", opts: ["Proxy", "Facade", "Decorator (Décorateur)", "Adapter"], ans: 2, exp: "Le Décorateur enveloppe l'objet d'origine pour lui ajouter des fonctionnalités." },
        { q: "Quel pattern regroupe des objets en structures arborescentes pour traiter de la même manière les objets individuels et les composites ?", opts: ["Composite", "Facade", "Adapter", "Decorator"], ans: 0, exp: "Le Composite permet aux clients de traiter de façon uniforme les objets individuels et les compositions." },
        { q: "Quel pattern fournit une interface unifiée et simplifiée à un sous-système complexe ?", opts: ["Proxy", "Facade (Façade)", "Bridge", "Flyweight"], ans: 1, exp: "La Façade cache la complexité d'un ensemble de classes sous une interface simple." },
        { q: "Quel pattern contrôle l'accès à un objet en agissant comme intermédiaire (placeholder) ?", opts: ["Proxy (Procuration)", "Adapter", "Facade", "Decorator"], ans: 0, exp: "Le Proxy gère et contrôle l'accès à l'objet réel (ex: contrôle de droits, lazy loading)." }
      ]
    },
    {
      id: 6,
      name: "Design Patterns de Comportement",
      quiz: [
        { q: "Quel pattern définit une dépendance de type un-à-plusieurs pour notifier les changements d'état d'un objet ?", opts: ["Strategy", "Observer (Observateur)", "Command", "State"], ans: 1, exp: "L'Observateur notifie automatiquement tous ses abonnés dès que son état change." },
        { q: "Quel pattern permet de permuter des algorithmes de manière interchangeable à l'exécution ?", opts: ["Strategy (Stratégie)", "State", "Template Method", "Iterator"], ans: 0, exp: "La Stratégie encapsulate des algorithmes et permet d'en changer dynamiquement." },
        { q: "Quel pattern encapsule une requête sous forme d'objet permettant de paramétrer des boutons ou d'annuler des actions ?", opts: ["Command (Commande)", "Mediator", "Memento", "State"], ans: 0, exp: "Le pattern Commande transforme une requête ou action en objet autonome." },
        { q: "Quel pattern permet à un objet de modifier son comportement lorsque son état interne change ?", opts: ["Strategy", "State (État)", "Memento", "Observer"], ans: 1, exp: "Le pattern État donne l'impression que l'objet change de classe à l'exécution." },
        { q: "Quel pattern sauvegarde et restaure l'état précédent d'un objet (utile pour l'annulation) ?", opts: ["Memento (Mémento)", "Visitor", "Command", "Iterator"], ans: 0, exp: "Le Mémento capture l'état interne d'un objet sans violer l'encapsulation pour pouvoir le restaurer plus tard." }
      ]
    },
    {
      id: 7,
      name: "Architecture Logicielle",
      quiz: [
        { q: "Quel pattern sépare les données, l'affichage et le traitement métier ?", opts: ["MVP", "MVC (Modèle-Vue-Contrôleur)", "MVVM", "Clean Architecture"], ans: 1, exp: "Le MVC structure l'application en séparant le modèle, la vue et le contrôleur." },
        { q: "Quelle architecture découpe une application en services indépendants déployables individuellement ?", opts: ["Monolithe", "Microservices", "Client-Serveur", "Peer-to-Peer"], ans: 1, exp: "L'architecture microservices permet une scalabilité et une indépendance technologique accrues." },
        { q: "Dans Clean Architecture, qu'est-ce qui représente le noyau contenant les règles métier fondamentales et indépendantes ?", opts: ["Presenters", "Use Cases", "Entities (Entités)", "Controllers"], ans: 2, exp: "Les entités constituent le centre le plus pur de l'architecture, isolées des frameworks et bases de données." },
        { q: "Quel protocole définit des règles pour concevoir des API web basées sur des ressources avec des verbes HTTP ?", opts: ["SOAP", "REST", "GraphQL", "gRPC"], ans: 1, exp: "REST (Representational State Transfer) structure l'accès aux ressources via GET, POST, PUT, DELETE." },
        { q: "Quel est l'avantage de GraphQL par rapport à REST ?", opts: ["Plus ancien", "Permet de demander uniquement les données spécifiques nécessaires en une seule requête", "Plus simple à mettre en cache HTTP", "Pas de requêtes réseau"], ans: 1, exp: "GraphQL résout le sous-chargement (under-fetching) et le sur-chargement (over-fetching) de données." }
      ]
    },
    {
      id: 8,
      name: "Tests et TDD (Test Driven Development)",
      quiz: [
        { q: "Quel est le cycle de développement du TDD ?", opts: ["Code -> Test -> Refactor", "Test (Red) -> Code (Green) -> Refactor", "Refactor -> Test -> Code", "Code -> Debug -> Test"], ans: 1, exp: "Le cycle classique est Red (écrire un test qui échoue), Green (écrire le code minimal pour réussir), Refactor (nettoyer le code)." },
        { q: "Quel type de test vérifie que des modifications récentes n'ont pas cassé de fonctionnalités existantes ?", opts: ["Test unitaire", "Test de non-régression", "Test de charge", "Test d'acceptation"], ans: 1, exp: "Le test de non-régression s'assure que le comportement global reste correct après modification." },
        { q: "Qu'est-ce qu'un Mock en test unitaire ?", opts: ["Une fonction lente", "Un objet simulé imitant le comportement d'un objet réel complexe (ex: base de données)", "Un outil de compilation", "Un bug documenté"], ans: 1, exp: "Le Mock permet de tester une unité de code en isolant ses dépendances externes." },
        { q: "Quel type de test vérifie la bonne collaboration entre plusieurs modules ou systèmes ?", opts: ["Test unitaire", "Test d'intégration", "Test système", "Test unitaire isolé"], ans: 1, exp: "Les tests d'intégration valident le bon dialogue entre les composants assemblés." },
        { q: "Que mesure la couverture de code (Code Coverage) ?", opts: ["Le nombre de fichiers, La vitesse des tests", "Le pourcentage de lignes de code exécutées lors des tests", "La taille du binaire final", "Le taux de CPU utilisé"], ans: 1, exp: "Il s'agit d'un indicateur mesurant la proportion du code source testée par la suite de tests." }
      ]
    },
    {
      id: 9,
      name: "DevOps & CI/CD",
      quiz: [
        { q: "Quel outil orchestre l'exécution automatisée de pipelines d'intégration continue ?", opts: ["Git", "Docker", "Jenkins (ou GitHub Actions)", "Kubernetes"], ans: 2, exp: "Les serveurs CI/CD comme Jenkins ou GitHub Actions lancent les étapes de compilation, test et build automatiquement." },
        { q: "Qu'est-ce que l'Infrastructure as Code (IaC) ?", opts: ["Écrire du code HTML", "Gérer les serveurs et ressources réseau via des fichiers de configuration versionnables", "Programmer en assembleur", "Écrire du code CSS"], ans: 1, exp: "L'IaC (ex: Terraform) automatise le provisionnement d'infrastructures à l'aide de code." },
        { q: "Quelle technologie conteneurise les applications en isolant leurs dépendances ?", opts: ["Kubernetes", "VirtualBox", "Docker", "Ansible"], ans: 2, exp: "Docker permet de créer des conteneurs légers contenant le code et toutes ses bibliothèques d'exécution." },
        { q: "Quel outil orchestre le déploiement et la mise à l'échelle automatique de conteneurs Docker en production ?", opts: ["Docker Compose", "Kubernetes", "Git", "Jenkins"], ans: 1, exp: "Kubernetes est la plateforme leader pour l'orchestration de conteneurs à grande échelle." },
        { q: "Qu'est-ce qu'un déploiement Blue-Green ?", opts: ["Déployer uniquement en hiver", "Utiliser deux environnements identiques (un actif et un passif) pour déployer sans interruption de service", "Un test de design", "Supprimer l'ancienne base de données"], ans: 1, exp: "Il réduit les risques en basculant le trafic utilisateur du serveur Blue (actif) vers le Green (nouveau) instantanément." }
      ]
    },
    {
      id: 10,
      name: "Qualité et Refactoring",
      quiz: [
        { q: "Qu'est-ce qu'un \"Code Smell\" (odeur de code) ?", opts: ["Une odeur de processeur chaud", "Un indicateur de mauvaise conception de code augmentant le risque de bugs futurs", "Une variable trop longue", "Un bug critique"], ans: 1, exp: "C'est un symptôme de mauvaise conception qui indique que le code nécessite un refactoring." },
        { q: "Que signifie refactoriser (refactor) du code ?", opts: ["Réécrire le code pour changer son comportement externe", "Modifier la structure interne du code sans altérer son comportement externe", "Supprimer tous les commentaires", "Optimiser les images"], ans: 1, exp: "Le refactoring améliore la lisibilité et la maintenance sans modifier les fonctionnalités existantes." },
        { q: "Quelle règle préconise d'éviter la duplication de code ?", opts: ["KISS (Keep It Simple, Stupid)", "DRY (Don't Repeat Yourself)", "YAGNI (You Aren't Gonna Need It)", "SOLID"], ans: 1, exp: "DRY demande que chaque fragment de connaissance ait une représentation unique dans le système." },
        { q: "Que signifie le principe YAGNI ?", opts: ["N'implémentez pas de fonctionnalité avant qu'elle ne soit réellement nécessaire", "Codez le plus vite possible", "Évitez le polymorphisme, Ne documentez pas le code", "Rendre les méthodes statiques"], ans: 0, exp: "YAGNI prévient la sur-conception (over-engineering) en évitant d'anticiper inutilement des exigences futures." },
        { q: "Qu'est-ce que la dette technique ?", opts: ["Une dette financière de l'entreprise", "Le coût futur lié au choix de solutions de facilité à court terme au lieu de concevoir du code propre", "Le prix des serveurs", "Un bug SQL"], ans: 1, exp: "Elle s'accumule lorsque l'on écrit du code rapide et sale, rendant les futures évolutions plus lentes et coûteuses." }
      ]
    }
  ],
  reseaux: [
    {
      id: 1,
      name: "Fondations des Réseaux & Modèle OSI",
      quiz: [
        { q: "Combien de couches comporte le modèle OSI ?", opts: ["4", "5", "7", "8"], ans: 2, exp: "Le modèle OSI (Open Systems Interconnection) possède 7 couches." },
        { q: "Quel équipement fonctionne principalement à la couche physique (Couche 1) ?", opts: ["Commutateur (Switch)", "Routeur", "Concentrateur (Hub)", "Pare-feu"], ans: 2, exp: "Le Hub transmet les signaux électriques aveuglément à tous les ports physiques." },
        { q: "Quelle couche est responsable du chiffrement et de la compression des données ?", opts: ["Application", "Présentation (Couche 6)", "Session", "Transport"], ans: 1, exp: "La couche Présentation formate les données pour la couche Application." },
        { q: "Quel modèle comporte 4 couches (Accès réseau, Internet, Transport, Application) ?", opts: ["Modèle OSI", "Modèle TCP/IP", "Modèle Ethernet", "Modèle DNS"], ans: 1, exp: "Le modèle TCP/IP historique est structuré en 4 couches fondamentales." },
        { q: "Comment appelle-t-on l'unité de données (PDU) de la couche Transport ?", opts: ["Paquet", "Trame", "Segment (pour TCP) ou Datagramme (pour UDP)", "Bit"], ans: 2, exp: "Le PDU de couche 4 est le segment (TCP) ou datagramme (UDP)." }
      ]
    },
    {
      id: 2,
      name: "Couche Liaison & Ethernet",
      quiz: [
        { q: "Quelle est la taille d'une adresse MAC standard ?", opts: ["32 bits", "48 bits (6 octets)", "64 bits", "128 bits"], ans: 1, exp: "Une adresse MAC fait 48 bits, exprimée en notation hexadécimale." },
        { q: "Quel équipement de couche 2 connecte les ordinateurs dans un réseau local en lisant les adresses MAC ?", opts: ["Concentrateur (Hub)", "Commutateur (Switch)", "Routeur", "Répéteur"], ans: 1, exp: "Le commutateur (switch) mémorise les adresses MAC connectées à ses ports physiques." },
        { q: "Quel protocole détecte et bloque les boucles physiques dans un réseau de commutateurs ?", opts: ["ARP", "OSPF", "STP (Spanning Tree Protocol)", "VLAN"], ans: 2, exp: "STP bloque de manière logique les liaisons redondantes pour éviter les tempêtes de diffusion." },
        { q: "Comment s'appelle la technique permettant de segmenter virtuellement un commutateur physique en plusieurs réseaux logiques ?", opts: ["DHCP", "VLAN (Virtual LAN)", "NAT", "Subnetting"], ans: 1, exp: "Les VLANs isolent le trafic de diffusion au niveau de la couche liaison." },
        { q: "Quel protocole d'accès au canal utilise Ethernet pour gérer les collisions ?", opts: ["CSMA/CD", "CSMA/CA", "Token Ring", "ALOHA"], ans: 0, exp: "Ethernet utilise le protocole CSMA/CD (Carrier Sense Multiple Access with Collision Detection)." }
      ]
    },
    {
      id: 3,
      name: "Adressage IP & Sous-réseaux",
      quiz: [
        { q: "Quelle adresse réseau pour l'hôte 192.168.1.50 avec un masque de /24 ?", opts: ["192.168.1.0", "192.168.1.255", "192.168.0.0", "192.168.1.1"], ans: 0, exp: "Un masque de /24 (255.255.255.0) isole les 3 premiers octets pour la partie réseau, soit 192.168.1.0." },
        { q: "Combien d'adresses d'hôtes utilisables contient un sous-réseau /29 ?", opts: ["4", "6", "8", "30"], ans: 1, exp: "Un sous-réseau /29 contient 2^(32-29) = 8 adresses au total, moins 2 adresses réservées (réseau et diffusion), soit 6 hôtes utilisables." },
        { q: "Quelle adresse IPv4 privée appartient à la classe A ?", opts: ["10.0.0.0 à 10.255.255.255", "172.16.0.0 à 172.31.255.255", "192.168.0.0", "127.0.0.1"], ans: 0, exp: "La plage 10.0.0.0/8 est réservée pour les réseaux privés de classe A." },
        { q: "Que fait le protocole NAT (Network Address Translation) ?", opts: ["Traduit les adresses privées en adresses publiques pour l'accès Internet", "Attribue des adresses IP", "Traduit les noms de domaine", "Bloque le trafic entrant"], ans: 0, exp: "NAT économise les adresses publiques en partageant une seule IP publique entre plusieurs hôtes locaux." },
        { q: "Dans quelle notation écrit-on une adresse IPv6 ?", opts: ["Décimale pointée", "Hexadécimale séparée par des deux-points", "Binaire pure", "Octale"], ans: 1, exp: "Une adresse IPv6 est écrite en 8 groupes de 4 chiffres hexadécimaux séparés par des deux-points." }
      ]
    },
    {
      id: 4,
      name: "Protocoles de Routage",
      quiz: [
        { q: "Quel équipement interconnecte différents réseaux logiques et choisit le meilleur chemin pour les paquets ?", opts: ["Commutateur", "Routeur", "Pont", "Point d'accès"], ans: 1, exp: "Le routeur examine la table de routage pour diriger les paquets à travers la couche 3." },
        { q: "Quel protocole de routage interne utilise l'algorithme d'état de lien (Link-State) de Dijkstra ?", opts: ["RIP", "OSPF", "BGP", "static"], ans: 1, exp: "OSPF (Open Shortest Path First) construit une topologie du réseau et calcule le chemin le plus court via Dijkstra." },
        { q: "Quel protocole de routage externe (BGP) régit l'échange de routes entre les grands Fournisseurs d'Accès Internet ?", opts: ["RIP", "OSPF", "BGP (Border Gateway Protocol)", "EIGRP"], ans: 2, exp: "BGP est le protocole de routage à vecteur de chemins de l'Internet mondial." },
        { q: "Quelle métrique utilise le protocole RIP (Routing Information Protocol) pour choisir sa route ?", opts: ["Bande passante", "Délai", "Nombre de sauts (Hop Count)", "Coût"], ans: 2, exp: "RIP choisit la route ayant le plus petit nombre de routeurs intermédiaires (max 15 sauts)." },
        { q: "Qu'est-ce qu'une route par défaut dans une table de routage ?", opts: ["Une route erronée", "La route empruntée pour toutes les destinations non spécifiées dans la table (0.0.0.0/0)", "La route la plus rapide", "Une route locale"], ans: 1, exp: "La route par défaut envoie le trafic inconnu vers la passerelle par défaut (Gateway)." }
      ]
    },
    {
      id: 5,
      name: "Couche Transport (TCP/UDP)",
      quiz: [
        { q: "Comment TCP commence-t-il une connexion fiable ?", opts: ["Par une transmission directe", "Par la poignée de main en 3 étapes (SYN, SYN-ACK, ACK)", "Par un ping ICMP", "Par l'envoi de données"], ans: 1, exp: "Le \"three-way handshake\" synchronise les numéros de séquence initiaux des deux hôtes." },
        { q: "Quelle caractéristique distingue UDP de TCP ?", opts: ["UDP est plus fiable", "UDP est sans connexion et n'offre aucune garantie de livraison", "UDP ordonne les paquets", "UDP est plus lent"], ans: 1, exp: "UDP (User Datagram Protocol) est léger et rapide car il n'attend pas d'accusés de réception." },
        { q: "À quoi sert le champ de fenêtre (Window Size) dans l'en-tête TCP ?", opts: ["Mesurer la taille de l'écran", "Contrôler le flux en spécifiant la quantité de données que le récepteur peut accepter avant un ACK", "Définir le port source, Détecter les erreurs", "Calculer le routage"], ans: 1, exp: "Le contrôle de flux par fenêtre glissante évite de saturer la mémoire du récepteur." },
        { q: "Quel indicateur (flag) TCP ferme proprement une connexion ?", opts: ["SYN", "RST", "FIN", "PSH"], ans: 2, exp: "Le flag FIN (Finish) demande la fermeture ordonnée de la session de communication." },
        { q: "Quel protocole de transport est préféré pour la voix sur IP (VoIP) ou le jeu en ligne ?", opts: ["TCP", "UDP", "ICMP", "ARP"], ans: 1, exp: "UDP is preferred since low latency takes priority over occasional packets lost." }
      ]
    },
    {
      id: 6,
      name: "Services Réseaux Essentiels (DNS/DHCP)",
      quiz: [
        { q: "Quel protocole résout les noms de domaine en adresses IP ?", opts: ["DHCP", "DNS", "ARP", "SMTP"], ans: 1, exp: "DNS (Domain Name System) sert d'annuaire Internet en traduisant les noms d'hôtes en adresses IP." },
        { q: "Quelles sont les 4 étapes de l'attribution d'adresse IP par DHCP ?", opts: ["SYN, SYN-ACK, ACK, FIN", "DORA (Discover, Offer, Request, Acknowledge)", "Ping, Pong, Request, Reply", "ARP, ICMP, DNS, TCP"], ans: 1, exp: "DORA représente les messages Discover, Offer, Request et Acknowledge échangés entre le client et le serveur." },
        { q: "Dans le protocole DNS, quel type d'enregistrement lie un nom d'hôte à une adresse IPv6 ?", opts: ["Enregistrement A", "Enregistrement AAAA", "Enregistrement MX", "Enregistrement CNAME"], ans: 1, exp: "AAAA mappe un nom de domaine à une adresse IPv6, tandis que A mappe une IPv4." },
        { q: "Quel protocole transmet des messages d'erreur et fournit des outils de diagnostic comme ping et traceroute ?", opts: ["DNS", "ICMP (Internet Control Message Protocol)", "ARP", "DHCP"], ans: 1, exp: "ICMP véhicule les diagnostics de connectivité IP." },
        { q: "À quel port du serveur le client DHCP envoie-t-il sa requête de découverte ?", opts: ["Port 53", "Port 67", "Port 80", "Port 161"], ans: 1, exp: "Les serveurs DHCP écoutent sur le port UDP 67 (et les clients sur le port 68)." }
      ]
    },
    {
      id: 7,
      name: "Protocoles de la Couche Application",
      quiz: [
        { q: "Quel protocole sécurise l'accès à un shell à distance en chiffrant le trafic ?", opts: ["Telnet", "FTP", "SSH (Secure Shell)", "SMTP"], ans: 2, exp: "SSH a remplacé Telnet en chiffrant l'ensemble de la session d'accès distant." },
        { q: "Quel protocole est utilisé pour envoyer des courriels électroniques d'un client à un serveur ?", opts: ["POP3", "IMAP", "SMTP (Simple Mail Transfer Protocol)", "HTTP"], ans: 2, exp: "SMTP envoie les emails, tandis que POP3 et IMAP servent à les consulter." },
        { q: "Que fait le protocole SNMP (Simple Network Management Protocol) ?", opts: ["Transférer des fichiers", "Sécuriser les VPN", "Superviser et gérer les équipements réseau à distance", "Traduires les IP"], ans: 2, exp: "SNMP recueille des statistiques et surveille la santé des routeurs et commutateurs." },
        { q: "Quel protocole web transmet par défaut les pages au format texte brut sans chiffrement ?", opts: ["HTTPS", "HTTP", "FTP", "SFTP"], ans: 1, exp: "HTTP transmet en clair, ce qui rend les données vulnérables à l'écoute réseau." },
        { q: "Quel port par défaut est utilisé par le protocole de transfert de fichiers non sécurisé FTP pour le contrôle ?", opts: ["20", "21", "22", "23"], ans: 1, exp: "Le port 21 sert à l'établissement de la session de contrôle FTP, et le port 20 gère le transfert de données." }
      ]
    },
    {
      id: 8,
      name: "Réseaux Sans Fil & Mobilité",
      quiz: [
        { q: "Quelle norme IEEE définit la couche physique et liaison pour les réseaux Wi-Fi ?", opts: ["802.3", "802.11", "802.15", "802.1Q"], ans: 1, exp: "La spécification 802.11 régit les transmissions sans fil localisées." },
        { q: "Quelle bande de fréquence Wi-Fi offre une meilleure portée à travers les obstacles mais un débit plus faible ?", opts: ["2.4 GHz", "5 GHz", "6 GHz", "60 GHz"], ans: 0, exp: "La fréquence 2.4 GHz pénètre mieux les murs mais a plus d'interférences et moins de bande passante." },
        { q: "Quel protocole de chiffrement Wi-Fi est le plus moderne et le plus sécurisé actuel ?", opts: ["WEP", "WPA", "WPA2", "WPA3"], ans: 3, exp: "WPA3 corrige les failles de sécurité de WPA2 avec un échange de clés de protocole SAE robuste." },
        { q: "Quel équipement sans fil diffuse des ondes radio pour permettre aux hôtes d'accéder au réseau local physique ?", opts: ["Commutateur", "Routeur", "Point d'Accès Sans Fil (WAP)", "Pare-feu"], ans: 2, exp: "Le WAP agit comme un pont entre le média radio et l'Ethernet physique." },
        { q: "Quel identifiant textuel désigne le nom public d'un réseau sans fil Wi-Fi ?", opts: ["BSSID", "SSID (Service Set Identifier)", "MAC", "IP"], ans: 1, exp: "Le SSID est le nom configurable diffusé par le point d'accès pour s'y connecter." }
      ]
    },
    {
      id: 9,
      name: "Sécurité Réseau & Pare-feu",
      quiz: [
        { q: "Quelle technologie chiffre un tunnel logique sur Internet pour connecter de manière sécurisée un utilisateur au réseau d'entreprise ?", opts: ["VLAN", "VPN (Virtual Private Network)", "NAT", "DNS"], ans: 1, exp: "Un VPN fournit une connexion cryptée et confidentielle à travers un réseau public." },
        { q: "Quelle est la différence entre un pare-feu sans état (Stateless) et avec état (Stateful) ?", opts: ["Le pare-feu stateful analyse le contexte et l'état des connexions en cours pour filtrer le trafic, le pare-feu stateless filtre uniquement paquet par paquet", "Aucune, Stateful est matériel", "Stateful est plus lent"], ans: 0, exp: "Les pare-feu Stateful suivent l'historique complet d'une session TCP pour autoriser les paquets retour." },
        { q: "Quelle zone réseau isolée contient les serveurs publics (ex: web, mail) pour protéger le réseau interne privé ?", opts: ["LAN", "WAN", "DMZ (Zone Démilitarisée)", "VPN"], ans: 2, exp: "La DMZ sépare les ressources exposées à Internet des bases de données internes confidentielles." },
        { q: "Quelle attaque submerge un serveur ou réseau sous un trafic massif provenant de multiples sources pour le rendre indisponible ?", opts: ["Phishing", "Injection SQL", "DDoS (Distributed Denial of Service)", "Spoofing"], ans: 2, exp: "DDoS épuise les ressources mémoire ou réseau du serveur à l'aide de réseaux d'ordinateurs piratés (Botnets)." },
        { q: "Quelle technique falsifie l'adresse IP source d'un paquet pour usurper l'identité d'un hôte de confiance ?", opts: ["Sniffing", "IP Spoofing", "Brute-force", "XSS"], ans: 1, exp: "L'IP Spoofing consiste à injecter des paquets avec une adresse IP source usurpée." }
      ]
    },
    {
      id: 10,
      name: "Administration & Supervision Réseau",
      quiz: [
        { q: "Quel outil en ligne de commande affiche le chemin complet emprunté par les paquets IP jusqu'à une destination ?", opts: ["ping", "nslookup", "traceroute (ou tracert sur Windows)", "ipconfig"], ans: 2, exp: "Traceroute utilise les paquets ICMP avec des valeurs de TTL croissantes pour identifier chaque saut." },
        { q: "Qu'est-ce qu'une MIB (Management Information Base) dans SNMP ?", opts: ["Une base de données définissant les variables gérées d'un équipement réseau pour la supervision", "Une adresse IP", "Un port de socket", "Un pare-feu"], ans: 0, exp: "La MIB structure de façon hiérarchique les attributs qu'un gestionnaire SNMP peut interroger sur un appareil." },
        { q: "Quelle commande Windows affiche la configuration IP de toutes les cartes réseau actives ?", opts: ["ifconfig", "ipconfig", "ping", "netstat"], ans: 1, exp: "La commande ipconfig affiche l'IP, le masque et la passerelle sur Windows (ifconfig sur Linux)." },
        { q: "Quel outil de ligne de commande affiche les connexions TCP actives, tables de routage et statistiques d'interfaces ?", opts: ["netstat", "nslookup", "arp", "ping"], ans: 0, exp: "Netstat (Network Statistics) est idéal pour lister les ports ouverts et connexions actives." },
        { q: "Qu'est-ce que le protocole Syslog ?", opts: ["Un système d'exploitation", "Un standard de transmission de messages de journaux d'événements et d'alertes d'équipements réseau vers un serveur central", "Un protocole de chiffrement", "Un type de base de données"], ans: 1, exp: "Syslog permet de centraliser les logs de sécurité et d'état système de tout le réseau." }
      ]
    }
  ]
};
