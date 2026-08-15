# ANOK Perfumes Website - Version 1 Complete Codebase Audit, Cleanup & Architecture Refactoring

You are a **Senior Full Stack Software Architect**, **Senior React Developer**, **Senior Node.js Developer**, and **Senior UI/UX Engineer**.

Your responsibility is **NOT** to immediately start modifying the project.

Your first responsibility is to **understand the entire project**, analyze every file, identify problems, and create a detailed implementation plan before making any changes.

---

# Project Overview

This project is the official website for a perfume brand.

The project currently contains:

* Public Website
* Admin CMS
* Local JSON-based Data Management

The website is almost completed, but over time the project has become:

* bulky
* inconsistent
* difficult to maintain
* contains redundant code
* contains unnecessary components
* contains unused logic
* contains duplicate state management
* has multiple data sources
* is becoming difficult to scale

The primary objective is to completely optimize the project while keeping Version 1 simple.

---

# VERY IMPORTANT

## DO NOT ASSUME ANYTHING.

Whenever you find ambiguity:

STOP.

Do not continue.

Ask questions.

Never make architectural decisions without confirmation.

If something affects existing functionality, explain:

* what you found
* why it is a problem
* what solution you recommend

Then wait for approval.

---

# Current Website Scope (Version 1)

Version 1 should remain intentionally simple.

Only these pages are required:

* Home
* About Us
* Contact

Nothing else.

Do not introduce additional pages unless asked.

---

# Product Strategy

Version 1 focuses on branding only ONE perfume.

There is only one featured product.

There are:

* no categories
* no collections
* no men's section
* no women's section
* no product listing pages
* no ecommerce
* no cart
* no checkout

Everything should revolve around showcasing one premium perfume.

Future expansion will happen later.

Design the architecture so multiple products can be added later without rewriting the system.

---

# Admin CMS

The CMS should also remain simple.

Current purpose:

Manage all website content from one place.

Examples:

* Home content
* Hero section
* Product information
* About page
* Contact information
* Footer
* Social links
* SEO
* Settings

The CMS should feel lightweight and easy to understand.

If there are unnecessary settings, remove them.

If multiple places edit the same data, consolidate them.

---

# Data Management

Current system uses local JSON files.

This is intentional.

Keep using JSON.

However, there must be only ONE source of truth.

Examples:

Good:

```
data/
    home.json
    about.json
    settings.json
    product.json
```

Bad:

* duplicate JSON
* mock data
* hardcoded constants
* duplicate objects
* fallback objects
* duplicate configs

Everything should come from one centralized data layer.

---

# Future Migration

In the future we will migrate to:

Node.js

MySQL

The architecture should make migration extremely easy.

Meaning:

Today

Website
↓

JSON Repository
↓

React Components

Later

Website
↓

API Layer
↓

Node.js
↓

MySQL

React components should require minimal or no changes during migration.

Separate the data access layer from the UI.

---

# Architecture Goals

Refactor the project into a clean, scalable structure.

Expected characteristics:

* modular
* reusable
* scalable
* maintainable
* readable
* lightweight
* predictable
* organized

Avoid:

* large files
* duplicated logic
* nested conditions
* unnecessary abstractions
* over-engineering
* dead code
* unused hooks
* unused utilities
* repeated components

---

# Code Cleanup

Perform a full audit.

Identify:

* unused files
* unused assets
* unused images
* unused icons
* unused fonts
* unused libraries
* unused npm packages
* unused components
* unused helper functions
* unused CSS
* unused Tailwind classes
* unused imports
* unused variables
* commented code
* obsolete logic
* temporary fixes
* duplicated code

Create a cleanup report before deleting anything.

---

# Folder Structure

Review the entire project.

Recommend a professional folder structure.

Example:

```
src/

components/

pages/

layouts/

features/

hooks/

services/

repositories/

context/

constants/

utils/

types/

assets/

styles/

data/

admin/
```

Do not reorganize blindly.

Explain every proposed change.

---

# Component Review

Inspect every component.

Determine:

* Is it reusable?
* Is it too large?
* Should it be split?
* Should it be merged?
* Is it duplicated?
* Is state managed correctly?
* Does it follow consistent patterns?

Refactor only when necessary.

---

# State Management

Audit state management.

Remove:

* duplicated state
* unnecessary useEffect
* unnecessary memoization
* unnecessary contexts
* prop drilling where avoidable

Recommend a simpler architecture.

---

# Performance Audit

Inspect:

* rendering performance
* bundle size
* image loading
* lazy loading
* memoization
* routing
* JSON loading
* component rendering

Remove unnecessary re-renders.

---

# Styling Review

Review the styling system.

Identify:

* duplicate styles
* inconsistent spacing
* inconsistent typography
* repeated utility classes
* unnecessary wrappers
* excessive nesting

Make styling consistent.

---

# Admin Review

Review the admin dashboard.

Questions:

Can this page be simpler?

Can users manage data with fewer clicks?

Are settings grouped logically?

Is there duplicated functionality?

Can components be reused?

---

# Website Review

Audit:

Navigation

Hero

About

Featured Perfume

Contact

Footer

Responsive behavior

Animations

Accessibility

Loading states

Empty states

Error handling

SEO

Meta tags

Structured data

Performance

---

# Naming Convention

Ensure consistency.

Examples:

Components:

```
HeroSection
AboutSection
FeaturedPerfume
ContactForm
```

Hooks:

```
useHomeData
useSettings
```

Utilities:

```
formatPrice
generateMeta
```

JSON:

```
home.json
product.json
settings.json
```

---

# Coding Standards

Follow:

* React Best Practices
* Clean Architecture principles
* SOLID (where appropriate)
* DRY
* KISS
* Single Responsibility Principle

Avoid unnecessary abstraction.

---

# Documentation

Document every important decision.

Whenever refactoring:

Explain:

* why
* benefits
* possible risks
* migration impact

---

# Expected Workflow

DO NOT immediately rewrite code.

Follow this exact process.

## Phase 1

Read the entire project.

Understand every module.

---

## Phase 2

Create a project audit.

Include:

Architecture diagram

Folder structure

Current problems

Duplicate logic

Dead code

Unused files

Performance issues

Maintainability score

Scalability score

Technical debt

Priority list

---

## Phase 3

Present the findings.

Do NOT change code yet.

Wait for approval.

---

## Phase 4

Create a detailed refactoring roadmap.

Break work into small milestones.

Example:

Milestone 1

Project cleanup

Milestone 2

Folder restructuring

Milestone 3

Data layer refactor

Milestone 4

Admin simplification

Milestone 5

Component optimization

Milestone 6

Performance optimization

Milestone 7

Final QA

---

## Phase 5

After approval,

perform one milestone at a time.

Never refactor everything at once.

Each milestone must:

* compile successfully
* preserve existing functionality
* avoid regressions
* be fully tested before moving on

---

# Success Criteria

At the end of this refactor:

✅ The codebase is clean and easy to navigate.

✅ There is only one source of truth for all website data.

✅ The Admin CMS is lightweight and user-friendly.

✅ There is no dead code, duplicate logic, or unnecessary complexity.

✅ The website remains a clean multi-page branding site (Home, About Us, Contact).

✅ Version 1 focuses on a single premium perfume.

✅ The architecture is ready for future migration to a Node.js + MySQL backend with minimal frontend changes.

**Most importantly: if you encounter any uncertainty, stop immediately, explain the issue, ask for clarification, and wait for approval before proceeding.**
