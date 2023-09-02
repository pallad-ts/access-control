---
sidebar_position: 2
slug: / 
title: Philosophy
---

In order to understand the philosophy behind Pallad's Access Control we need to explain terms used.

**Access Query** - is an object that contains properties necessary to describe the context for access control engine
- **principal** - represents who is performing an action. That could be logged-in user, anonymous user (not logged-in), external integration or any other principal that your system defines.
- **action** - defined an action that is being performed (has to be a string) like `update`, `create`, `delete`, `activate`.
- **subject** - represents a target on which the action is performed. That could be an article, organization, product or other type of entities your system define

**Policy** - Is a function that receives access query and returns its vote against it.
Policy might:
- _abstain_ from voting by returning `undefined`
- _allow_ access by returning `true`
- _deny_ access by returning `false`

**Access Control** - Contains policies and ask them to vote on access query. 

Final decision is made based on following criteria:
- once all policies _abstain_ from voting then final decision is `deny`
- once any policy denies access then final decision is `deny`
- once at least one policy votes to allow access and there are no _deny_ votes then final decision is `allow`

