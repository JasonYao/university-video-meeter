# University Video Web App (Name to be added later)
By Jason Yao & Arvind Ramgopal

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
- [MongoDB](https://www.mongodb.com/) + [Mongoose](http://mongoosejs.com/)
- [AWS S3](https://aws.amazon.com/s3/) integration (profile image hosting)
- [WebRTC](http://socket.io/blog/socket-io-p2p/#) (P2P real-time video chat)
- [Socket.io](http://socket.io/) (Signaling of metadate and information, and fallback if WebRTC is unavailable)

## Tech Stack (metal up)
OS:                   Ubuntu 16.04 LTS VPS (AWS)
LB:                   No load balancing/autoscaling (proof of concept app, will only add this in the minute event of getting lots of users)
Reverse Proxy Server: Nginx
Node Process Manager: PM2
Database:             MongoDB
ODM:                  Mongoose

## Testing
TODO

## Linting
We use jshint, and have the config files already setup.
Simply run from the root directory:
```sh
jshint meeter
```
