# NPM - Node Package Manager

# npm scripts

## npm init

Creates and congiures a package.json file (Configuration file for project)

## npm start 

Shortcut for `npm run start`
Will run the "start" property of "scripts" object in the package. If property is not specified then it wil run `node server.js`

# Installing/Managing third party packages

`npm install SomePackageName` or `npm i SomePackageName`

`-g` - `-global` installs the package globally on the machine instead of locally (`--save-dev` or `--save`)

`--save-dev` will differentiate the installed package to appear in your `devDependencies`, instead of the default `dependencies` (production - default)

`npm install` will install/update all dependencies in package.json

# package.json

TODO

dependencies - the "^" character in version numbers - it wil use a later version if available when doing `npm install`

# package-lock.json




