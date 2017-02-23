"use strict";
var assert = require('assert');

const express = require('express');
const request = require('supertest');
var app = 'http://localhost:3000';

// Testing helper functions
function testGetRoute(route, name) {
    describe("Show " + name, function() {
        it("Should give a 200 response code", function() {
            return request(app)
                .get(route)
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(200)
                .then(data => {
                    assert(data !== undefined, "Request should have gone through")
                });
        });
    });
}

module.exports = {
    testGetRoute: testGetRoute
};