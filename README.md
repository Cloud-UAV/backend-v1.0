# README #

### What is this repository for? ###

* CloudUAV backend API

### How do I get set up? ###
* Cloe the repository.
* Setup project on your machine using npm.
    * ```cd backend-v1.0```
    * Install all package dependencies from package.json ```npm install```
    * setup gulp on your machine: ```npm install -g gulp```
    * before running the project make sure you have imported clouduav.sql file into mysql database. Create clouduav database in mysql and then import the sql file:
        * ```mysql -u root -p clouduav < clouduav.sql```
    * To run project: ```gulp build --dev```, this will run it in development.
        * To run the project in production mode: ```gulp build --prod```. Copy the files in dist/ to EC2 instance. 

### Contribution guidelines ###

* Code review