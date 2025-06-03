# Système de Vote Décentralisé

Une application de vote décentralisée construite avec Solidity et Next.js, permettant la création et la gestion de sondages sur la blockchain.

Contrat déployé : [https://sepolia.etherscan.io/address/0xe1F7D5880948C31fD7187B50688bE2d1974BAC7D](https://sepolia.etherscan.io/address/0xe1F7D5880948C31fD7187B50688bE2d1974BAC7D)

## Private key tester en temps qu'owner (En temps normal, la private key personnelle ne doit surtout pas être partagée, mais c'est pour l'exemple)
0x7e5da268a6e385241624548a80317f8bea8b96e288557e1cba8dc1ec6d76fdaa

## Fonctionnalités

### Smart Contracts

1. **Vote.sol**
   - Création de sondages avec deux options
   - Système de vote unique par adresse
   - Limite de votes configurable
   - Résultats en temps réel
   - Gestion automatique de la fin des sondages
   - Reset des votes si égalité
   - Les sondages peuvent uniquement être créés par l'owner du contrat mais tout le monde peut voter


### Frontend (Next.js)
- Interface utilisateur moderne et intuitive
- Connexion avec Rainbowkit
- Visualisation des sondages actifs
- Participation aux votes
- Affichage des résultats en temps réel

## Installation

1. Cloner le repository
```bash
git clone [URL_DU_REPO]
```

2. Installer les dépendances
```bash
# Pour les smart contracts
npm install

# Pour le frontend
cd frontend_safe
npm install
```

3. Configuration
- Configurer votre fichier `.env` avec les variables nécessaires
- Configurer Hardhat pour le déploiement des smart contracts

## Déploiement

1. Déployer les smart contracts
```bash
npx hardhat run scripts/deploy.js --network [RESEAU]
```

2. Lancer le frontend
```bash
cd frontend_safe
npm run dev
```

## Technologies Utilisées

- Solidity ^0.8.28
- Hardhat
- Next.js
- Ethers.js
- Rainbowkit
- Wagmi

## Sécurité

- Contrôles d'accès pour les fonctions sensibles
- Vérifications des montants minimums
- Protection contre les votes multiples

## Licence
