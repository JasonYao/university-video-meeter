"use strict";
const assert = require('assert');

const express = require('express');
const request = require('supertest');

// Testing helper functions
function testGetRoute(route, name, app) {
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