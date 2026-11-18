import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import {normalizeHost,findHosts,assess} from '../src/assessment.js';
const orgs=JSON.parse(fs.readFileSync(new URL('../public/data/incident.json',import.meta.url))).organizations;
test('curated inventory has 178 organizations',()=>assert.equal(orgs.length,178));
test('exact match is verified, and URL path is ignored',()=>{const r=findHosts(orgs,'https://www.cnn.com/story?id=9');assert.equal(r.kind,'exact');assert.equal(r.matches[0].name,'CNN')});
test('root is not silently promoted to a related listed subdomain',()=>assert.equal(findHosts(orgs,'ikea.com').kind,'unknown'));
test('www variation is related, not exact',()=>assert.equal(findHosts(orgs,'bbc.com').kind,'related'));
test('never match attacker-controlled lookalikes',()=>assert.equal(findHosts(orgs,'cnn.com.attacker.test').kind,'unknown'));
test('reject credentials and invalid browser inputs',()=>{assert.equal(normalizeHost('https://user:pass@cnn.com'),null);assert.equal(normalizeHost('javascript:alert(1)'),null);assert.equal(normalizeHost(''),null)});
test('matched host does not equal infection',()=>{const r=assess({match:findHosts(orgs,'zoom.us'),visit:'yes',activity:'browse',device:'android'});assert.equal(r.level,'possible');assert.match(r.description,/not proven/i)});
test('card entry triggers follow-up',()=>assert.equal(assess({match:findHosts(orgs,'cnn.com'),visit:'yes',activity:'card',device:'android'}).level,'action'));
test('outside observation window is not declared safe',()=>assert.equal(assess({match:findHosts(orgs,'cnn.com'),visit:'yes',activity:'browse',device:'android',time:'2026-11-15T12:00Z'}).level,'unknown'));
test('unknown host cannot be assessed as exposed',()=>assert.equal(assess({match:findHosts(orgs,'unlisted-example.org'),visit:'yes',activity:'card',device:'iphone'}).level,'unknown'));

test('late visit is not treated as an all-clear',()=>{const r=assess({match:findHosts(orgs,'cnn.com'),visit:'yes',activity:'card',device:'iphone',time:'2026-11-16T23:00Z'});assert.equal(r.level,'action');assert.match(r.description,/still infected/)});
test('invalid time cannot imply overlap',()=>assert.equal(assess({match:findHosts(orgs,'cnn.com'),visit:'yes',time:'garbage'}).level,'unknown'));
test('reject malformed DNS labels',()=>{for(const x of ['-cnn.com','cnn-.com','a'.repeat(64)+'.com'])assert.equal(normalizeHost(x),null)});
test('time boundaries use absolute timestamps',()=>{for(const time of ['2026-11-16T04:21Z','2026-11-15T22:21-06:00']) assert.equal(assess({match:findHosts(orgs,'cnn.com'),visit:'yes',activity:'browse',time}).level,'possible')});
test('visit uncertainty never becomes confirmed exposure',()=>{for(const visit of ['no','unsure',undefined])assert.equal(assess({match:findHosts(orgs,'cnn.com'),visit,activity:'card'}).level,'unknown')});
