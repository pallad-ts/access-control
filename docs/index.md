---
sidebar_position: 1 
slug: / 
title: Introduction
---

[![CircleCI](https://circleci.com/gh/pallad-ts/access-control/tree/master.svg?style=svg)](https://circleci.com/gh/pallad-ts/access-control/tree/master)
[![npm version](https://badge.fury.io/js/@pallad%2Faccess-control.svg)](https://badge.fury.io/js/@pallad%2Faccess-control)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---
`@pallad/access-control` is an assess permissions in system and allows or denies executing actions.
* Can given user `update` a product?
* Can given user `delete` an article?

Due to abstract nature and by having imperative policy system you can easily achieve any kind of permission system like Role Based Access Control (RBAC), Attribute Based Access Control (ABAC) or others.

## Ecosystem 

Ecosystem consist of following packages:
* `@pallad/access-control` is very small package with core abstractions.
* `@pallad/access-control-dev` helps you with writing tests for policies, stub access control
* `@pallad/access-control-query-preset` helps you define possible permissions for a domain and define policies for them.

## Features

* 👷 Built with Typescript
* 👌 Supports synchronous and asynchronous policies
* 🎒 Helpful tools for writing unit tests
* ✅ Easy to use with any framework (express, nest.js, fastify, koa, graphql)
* 🧑‍🤝‍🧑 Type friendly
