---
title: Migration Operation
lang: en
permalink: /en/lands-of-jail/events/migration-operation/
ref: loj-event-migration-operation
sidebar:
  nav: loj-en
aside:
  toc: true
---

# {% include term.html key="lands_of_jail" %} - {% include term.html key="migration_operation" %}

## Overview

{% include term.html key="migration_operation" %} has 3 phases:

1. Preparation
2. Invitation
3. Open Migration

Use this guide to understand who can migrate freely, who needs an invite, and what can block a migration attempt.

## Phase 1: Preparation

- The President becomes the **Migration Administrator**.
- Administrator rights can be transferred **only during Phase 1**.
- The Migration Administrator sets the **{% include term.html key="migration_score" %} limit**.
- Players above the {% include term.html key="migration_score" %} limit cannot migrate freely during Phase 3.

## Phase 2: Invitation

### {% include term.html key="basic_invite" %}

- For players who are **not above the {% include term.html key="migration_score" %} limit**.
- Each server has a limited number of {% include term.html key="basic_invite" %} slots.

### {% include term.html key="elite_invite" %}

- For players who are **above the {% include term.html key="migration_score" %} limit**.
- Each server can hold up to **3 {% include term.html key="elite_invites" %}**.
- {% include term.html key="elite_invite" %} attempts recover by **1 attempt on the 1st day of each month at 00:00 server time**.
- A server can store up to 3 attempts.

### {% include term.html key="elite_migration_application" %}

- If the destination server is **not a Top Server**, players above the {% include term.html key="migration_score" %} limit can submit an **{% include term.html key="elite_migration" %}** application.
- The player can migrate after the Migration Administrator approves the application.

### Top Server Rules

- Top Servers **cannot send {% include term.html key="elite_invites" %}**.
- Top Servers do not accept {% include term.html key="elite_migration" %} applications from players above the {% include term.html key="migration_score" %} limit.
- If a server ranks first **3 times in a row**, it receives **1 extra {% include term.html key="elite_invite" %}**.

## Phase 3: Open Migration

- Players who meet the {% include term.html key="migration_score" %} limit can migrate on their own if slots are still available.
- Example slot status from the screenshots:
  - {% include term.html key="free_migration" %}: 15/15, full
  - {% include term.html key="basic_migration" %}: 25/25, full
  - {% include term.html key="elite_migration" %}: 3 slots

## Migration Requirements

1. You are not above the {% include term.html key="migration_score" %} limit.
2. Your Office level meets the requirement.
3. Your server is not in combat status.
4. You have no troops marching.
5. You are not in an alliance.
6. You are not the President.
7. At least 25 days have passed since your last migration.
8. You have fewer than 4 characters on the destination server.

## Migration Cost

This migration consumes {% include term.html key="migration_pass" %} items. The required amount depends on the Warden's {% include term.html key="migration_score" %}.

The higher the {% include term.html key="migration_score" %} is compared with the standard value for the server range, the more {% include term.html key="migration_pass" %} items are consumed.

{% include term.html key="migration_score" %} quantifies the Warden's combat strength and is calculated from:

- Office level
- Collection
- Classic Books
- Hero power
- Hero Gear power
- Villain Armor power

## Notes

- Elite migration does not count toward the number of migrating Wardens and is not restricted by the system's {% include term.html key="migration_score" %} limit.
- Resources above warehouse capacity are removed when migrating.
- The example {% include term.html key="migration_score" %} limit shown in the screenshots is **<=160,000,000**.

## Quick Summary

| Type | Target Players | Invite Required |
| --- | --- | --- |
| {% include term.html key="free_migration" %} | Below the {% include term.html key="migration_score" %} limit | No |
| {% include term.html key="basic_migration" %} | Below the {% include term.html key="migration_score" %} limit | Yes |
| {% include term.html key="elite_migration" %} | Above the {% include term.html key="migration_score" %} limit | Yes |

## Screenshots

{% assign migration_images = "4137.jpg,4138.jpg,4139.jpg,4140.jpg,4141.jpg,4142.jpg,4143.jpg,4144.jpg" | split: "," %}
{% for image in migration_images %}
![{% include term.html key="migration_operation" %} screenshot {{ forloop.index }}](/assets/images/lands-of-jail/events/migration-operation/{{ image }})
{% endfor %}
