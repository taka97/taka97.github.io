---
title: Server Migration
lang: en
permalink: /en/lands-of-jail/events/server-migration/
ref: loj-event-server-migration
sidebar:
  nav: loj-en
aside:
  toc: true
---

# Lands of Jail - Server Migration

## Overview

Server Migration has 3 phases:

1. Preparation
2. Invitation
3. Open Migration

Use this guide to understand who can migrate freely, who needs an invite, and what can block a migration attempt.

## Phase 1: Preparation

- The President becomes the **Migration Administrator**.
- Administrator rights can be transferred **only during Phase 1**.
- The Migration Administrator sets the **migration power limit**.
- Players above the power limit cannot migrate freely during Phase 3.

## Phase 2: Invitation

### Basic Invite

- For players who are **not above the migration power limit**.
- Each server has a limited number of Basic Invite slots.

### Elite Invite

- For players who are **above the migration power limit**.
- Each server can hold up to **3 Elite Invites**.
- Elite Invite attempts recover by **1 attempt on the 1st day of each month at 00:00 server time**.
- A server can store up to 3 attempts.

### Elite Migration Apply

- If the destination server is **not a Top Server**, players above the power limit can apply for Elite Migration.
- The player can migrate after the Migration Administrator approves the application.

### Top Server Rules

- Top Servers **cannot send Elite Invites**.
- Top Servers do not accept Elite Migration applications from players above the power limit.
- If a server ranks first **3 times in a row**, it receives **1 extra Elite Invite**.

## Phase 3: Open Migration

- Players who meet the power limit can migrate on their own if slots are still available.
- Example slot status from the screenshots:
  - Free Migration: 15/15, full
  - Basic Migration: 25/25, full
  - Elite Migration: 3 slots

## Migration Requirements

1. You are not above the migration power limit.
2. Your Office level meets the requirement.
3. Your server is not in combat status.
4. You have no troops marching.
5. You are not in an alliance.
6. You are not the President.
7. At least 25 days have passed since your last migration.
8. You have fewer than 4 characters on the destination server.

## Migration Power Calculation

Migration power includes:

- Office
- Collection
- Classic Books
- Heroes
- Hero Gear
- Vehicle Armor
- Wounded troops
- Reserve troops

## Notes

- Elite Migration does not count toward the Free Migration limit.
- Resources above warehouse capacity are removed when migrating.
- The example migration power limit shown in the screenshots is **<=160,000,000**.

## Quick Summary

| Type | Target Players | Invite Required |
| --- | --- | --- |
| Free Migration | Below the power limit | No |
| Basic Invite | Below the power limit | Yes |
| Elite Invite | Above the power limit | Yes |
| Elite Apply | Above the power limit | Application |

## Screenshots

{% assign migration_images = "4137.jpg,4138.jpg,4139.jpg,4140.jpg,4141.jpg,4142.jpg,4143.jpg,4144.jpg" | split: "," %}
{% for image in migration_images %}
![Server Migration screenshot {{ forloop.index }}](/events/lands-of-jail/server-migration/{{ image }})
{% endfor %}
