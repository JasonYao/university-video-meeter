"use strict";
var assert = require('assert');

const express = require('express');
const request = require('supertest');
var app = 'http://localhost:3000';

var helper = require('./helper');

// Login testing
describe('Authentication: Login', function() {
    // Show login page
    helper.testGetRoute('/login', 'Login', app);

    // Should refuse empty submissions
    describe('Refuse empty submissions', function() {
        it('Should show error message', function() {
            return request(app)
                .post('/login')
                .send({
                    username: '',
                    password: ''
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                });
        });
    });

    // Should refuse partial submissions
    describe('Refuse empty username', function() {
        it('Should show error message', function() {
            return request(app)
                .post('/login')
                .send({
                    username: '',
                    password: 'test'
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                });
        });
    });

    describe('Refuse empty password', function() {
        it('Should show error message', function() {
            return request(app)
                .post('/login')
                .send({
                    username: 'test',
                    password: ''
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                });
        });
    });

    // Should keep username value
    describe('Keep username value on partial submission', function() {
        it('Should keep username in form value', function() {
            return request(app)
                .post('/login')
                .send({
                    username: 'testing',
                    password: ''
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                    assert(res.text.includes("value=\"testing\""))
                });
        });
    });

    describe('Keep username value on invalid full submission', function() {
        it('Should keep username in form value', function() {
            return request(app)
                .post('/login')
                .send({
                    username: 'testing',
                    password: 'incorrect_password'
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                    assert(res.text.includes("value=\"testing\""))
                });
        });
    });

    describe('Deny invalid login credentials', function() {
        it('Should show error message', function() {
            return request(app)
                .post('/login')
                .send({
                    username: 'testing',
                    password: 'incorrect_password'
                })
                .expect(200)
                .then(res => {
                    assert(res.text.includes("alert-danger"))
                    assert(res.text.includes("value=\"testing\""))
                });
        });
    });

    // Should accept complete submissions
    describe('Accept valid login credentials', function() {
        it('Should redirect to dashboard', function() {
            return request(app)
                .post('/login')
                .send({
                    username: 'testing',
                    password: 'testing'
                })
                .expect(302)
                .then(res => {
                    assert(res.header.location === '/dashboard')
                });
        });
    });
});

// Registration testing
describe('Authentication: Registration', function() {
    // Show registration page
    helper.testGetRoute('/register', 'Registration', app);

    // Should refuse empty submissions TODO

    // Should refuse partial submissions

    // Should keep values on partial submissions

    // Should accept complete submissions
});

// Logout testing
describe('Authentication: Logout', function() {
    // Should show redirect to index TODO

    // Should show no session ID in cookies TODO
});

// Password reset testing
describe('Authentication: Password Reset', function() {
    // Should show reset page
    helper.testGetRoute('/reset', 'Password Reset', app);

    // TODO
});

