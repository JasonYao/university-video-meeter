# Meeter (University Video Web App)
By [Jason Yao](https://github.com/JasonYao) & [Arvind Ramgopal](https://github.com/arvind001)

## Description
This is a web application that will allow students
applying to university a chance to learn more about
the institutions that they can be attending.

For universities, it allows another facet to high
school outreach and understanding.

For high school students, it offers a real look
into university life by current students, enabling
the student to make more of an informed decision
regarding which university they choose to attend.

For the current university students, it allows
them the ability to connect with future students
at their university, and be paid for their time
spent educating.

For us, the developers, it allows us to showcase
our full-stack knowledge, and build out a cool,
full web app using as many of the latest technologies
as we could fit into it.

## APIs & Main Technologies
- Node + Express
- [MongoDB](https://www.mongodb.com/) (NoSQL DB) + [Mongoose](http://mongoosejs.com/) (ODM)
- [Gulp](http://gulpjs.com/) (Automated image resizing + minification)
- [AWS S3 integration](https://aws.amazon.com/s3/) (profile image hosting)
- [WebRTC](https://webrtc.org/) via [simple-peer](https://github.com/feross/simple-peer)* (P2P real-time video, chat, and calling)
- [Socket.io](http://socket.io/) (Signaling of metadata and information, and fallback if WebRTC is unavailable)


\* Note: While socket.io has a [P2P library](https://github.com/socketio/socket.io-p2p),
its current state leaves it unable to do the one
task that it was designed for: P2P communication.
Because of this, alternative WebRTC libraries will
have to be used unless socket.io dedicates more
resources to P2P needs.

## Setup
- Download the repo

```sh
cd meeter
npm install
npm run build
nodemon bin/www
```

## Testing
Testing uses the [mocha](https://mochajs.org/) framework,
and should be installed as a dev dependency if it's not
already installed on your machine. Run from the `meeter` directory:

```sh
npm test
```

## Linting
We use [jshint](http://jshint.com/), and have the config files already setup.
Simply run from the `meeter` directory:
```sh
npm run lint
```

## Tech Stack (metal up)
```
OS:                   Ubuntu 16.04 LTS VPS (AWS)
LB:                   No load balancing/autoscaling (proof of concept app, will only add this in the minute event of getting lots of users)
Reverse Proxy Server: Nginx
Node Process Manager: PM2
Database:             MongoDB
ODM:                  Mongoose
```
