# Alpha AC

[![CircleCI](https://circleci.com/gh/wookieb/alpha-ac.svg?style=svg)](https://circleci.com/gh/wookieb/alpha-ac)

Alpha AC is a simple but powerful Access control system inspired by Symfony2 Voters.
The idea is very simple. You ask Alpha AC whether a _participant_ (anonymous, user, system or other) has given a _privilege_ on a _subject_.
For example whether UserParticipant has privilege to "view" the "post".

```typescript
acl.isAllowed(new Participant.Account(user), "view", post)
.then((isAllowed) => {
    // :)
})
```

This simple approach allows to implement any type of Access system you want.

## Install
```bash
npm install alpha-ac
```

## Usage

```typescript
import {AccessControl, Rule, Participant} from "alpha-ac";

const ac = new AccessControl();

// Allows user to view/edit post they own 
class SimpleRule implements Rule {
    supports(privilege: any, subject: any): boolean {
        return ['view', 'edit'].indexOf(privilege) !== -1;
    }
    
    isAllowed(participant: Participant, privilege: any, subject: any): Promise<boolean>|boolean {
        if (Participant.Account.is(participant)) {
            return subject.ownerId === participant.account.id;
        }
        return false;
    }
}

ac.registerRule(new SimpleRule());

ac.isAllowed(new Participant.Account(user), "view", post).then(/* ... */)

```

## How it works

First you need to create a rule object (might be an instance of class or just an objeect) with 2 methods:
* supports(privilege, subject) - tells whether the rule is able to make decision about given privilege and subject
* isAllowed(participant, privilege, subject) - makes final decision

Once you have the object ready register it to AccessControl via "registerRule".
The Access control will be looking for the first rule that is able to make decision about given privilege and subject and ask it for a decision.

## Participants

A participant represents an identity that needs to perform some action on the system.

Alpha AC predefines few kinds of participants but you don't have to use all of them if it's not necessary.

* Participant.Anonymous - represents anonymous participant (for example not logged in user)
* Participant.Account - Represents logged in user assigned to some account 
* Participant.System - useful if you need more control about what operations might be performed for example from CLI

Every participant has "type" property so you can check in your rules what kind of participant you're dealing with.
