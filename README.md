
## Étapes d'installation

Une fois le dépôt cloné, dans le dossier du projet :

### 1. installation des modules

`npm install`

### 2. rebuild des modules pour assurer leur compatibilité avec la version de Node

`node_modules/.bin/electron-rebuild`

## Pour lancer l'application en mode de développement :

`yarn electron-dev`

## Consignes de commit

Pour chaque commit sur la branche `master` qui sera destiné à être compilé, on met à jour le numéro de version dans `package.json > version`.<br />
<br />
Le numéro est composé comme suit : "0.1.YYJJJHHMM"<br />
* __YY__: année sur deux chiffres
* __JJJ__: numéro du jour sur trois chiffres _(5 février : '036')_
* __HH__: heure sur deux chiffres
* __MM__: minutes sur deux chiffres

## Étapes de compilation

### Build l'application dans le dossier /build/

`yarn build`

### Crée le package dans le dossier /dist/

Sur MacOS : `yarn electron-pack-mac`<br />
Sur Windows : `yarn electron-pack-win`<br />
Sur Linux : `yarn electron-pack-lin`<br />
