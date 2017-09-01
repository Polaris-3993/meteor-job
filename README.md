# Vezio

Vezio main website, register users, manages projects, tasks, contracts and many 
more,shows tracking info.

### Technologies

* [Meteor]
* [Blaze]
* [NodeJS]
* [ES6]
* [Less]
* [MongoDB]

### Installation

To run project locally you need to install nodejs and meteor.
Recommended way is to use nvm (node version manager) and install there v4.8.0
(supported by current version of meteor) and last stable version 
(v6.11.2 on 1st August 2017). Meteor can be downloaded and installed from
official website https://www.meteor.com/install

After installation clone project, enter its folder and run

```sh
  meteor npm install
```

then run following command to start server

```sh
  bin/run.sh
```

if you use Linux of Mac or open file run.sh in text editor, copy its content
into command propmt and press enter, if you using Windows.

Meteor will download all packages needed, and after you see message,
that project running on port 3000, open your browser and enter localhost:3000
in address line.

### Deployment

Currently (August 2017) deployment handled by Jenkins. To deploy project you 
need to push your code into bitbucket repo, then enter jenkins website 
https://jenkins.vezio.company/, there will be list ob jobs, half of then build
and another half are deploy.

First click on "Build vezio-core", on new page choose branch
(usually master, but you can build and deploy any branch you want), then,
on the left side, click on "Build now". Also Jenkins checking for new commits
done, and, if they present, make build automatically.

Now return to Jenkins main page and choose "Deploy vezio-core PROD" 
(later or staging will be available). On this page in left side choose 
"Build with parameters", then choose number of build, you just made, and branch,
and push build. Be advised, that deployment need to be made manually.

To see result of your deployement, enter in address line of your browser 
https://vezio.work, and authorize.

### Additional notes

Please do not install new meteor packages via  ```meteor add ``` command
during development. Instead edit packages/base/package.js file or write
down your own new package.

License
____

[//]:

[Meteor]: <https://www.meteor.com>
[Blaze]: <http://blazejs.org/>
[NodeJS]: <https://nodejs.org>
[ES6]: <https://en.wikipedia.org/wiki/ECMAScript>
[Less]: <http://lesscss.org/>
[MongoDB]: <https://www.mongodb.com/>
