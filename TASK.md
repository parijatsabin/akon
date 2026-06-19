# ANOK Hero Section Redesign — Video Background Implementation

Keep the existing ANOK luxury branding exactly as it is.

DO NOT change:

* Existing color palette
* Typography system
* Brand identity
* Luxury aesthetic
* Navigation design
* Premium spacing system
* Gold accent colors
* Existing animations unless improving performance

---

## Objective

Redesign the Hero Section into a modern luxury perfume showcase using a fullscreen background video.

The hero section should feel premium, cinematic, elegant, and minimal.

Use the provided `.mp4` video from the assets folder as the hero background instead of a static image.

The video should immediately communicate luxury and fragrance craftsmanship while keeping all content highly readable.

---

## Hero Layout Structure

### Fullscreen Hero (100vh)

Structure:

```text
--------------------------------------------------
| Navigation                                      |
|                                                  |
|  Left Content       Center Focus      Right Info |
|                                                  |
|                                                  |
--------------------------------------------------
```

### Background

Use:

```dart
assets/videos/hero_video.mp4
```

(or the existing video path in the project)

Requirements:

* Autoplay
* Muted
* Loop
* Plays inline
* No controls visible
* Optimized loading
* Smooth fade-in on page load

---

## Video Overlay

Add multiple overlays for readability.

### Layer 1

Dark overlay:

```css
rgba(0,0,0,0.45)
```

### Layer 2

Luxury gradient:

```css
linear-gradient(
  90deg,
  rgba(0,0,0,0.75) 0%,
  rgba(0,0,0,0.25) 50%,
  rgba(0,0,0,0.65) 100%
)
```

This ensures text remains readable while preserving video visibility.

---

## Left Content Block

Position:

* Vertically centered
* Left aligned
* Maximum width: 500px

Content:

### Small Label

```text
EXTRAIT DE PARFUM
```

Luxury letter spacing.

---

### Main Heading

```text
Crafting Scents
That Define Elegance
```

Large luxury typography.

Desktop:

```css
font-size: clamp(56px, 7vw, 92px)
```

---

### Description

```text
Discover timeless fragrances crafted with precision, inspired by sophistication and designed for those who appreciate true luxury.
```

Maximum 2–3 lines.

---

### CTA Buttons

Primary:

```text
Explore Collection
```

Luxury gold button.

Secondary:

```text
Our Story
```

Transparent outline button.

Buttons should be elegant and subtle.

Avoid oversized CTAs.

---

## Center Area

Keep visually open.

Do NOT place cards or floating panels.

Allow the video itself to become the hero visual.

The perfume bottle appearing in the video becomes the focal point.

Less UI = More luxury.

---

## Right Side

Minimal vertical fragrance showcase.

Example:

```text
Signature Collection

Noir Élégance
Amber Essence
Velvet Oud
Midnight Bloom
```

Behavior:

* Active fragrance highlighted in gold.
* Others remain subtle.
* Hover interaction optional.
* Very minimal visual weight.

---

## Motion Design

Implement subtle luxury animations only.

### On Load

* Fade in content
* Slight upward reveal
* Duration: 0.8s–1.2s

### Buttons

* Soft hover glow
* Gentle scale effect

### Background Video

* No zoom effects
* No parallax
* Let the cinematic footage speak for itself

---

## Mobile Experience

Stack content vertically.

Order:

```text
Heading
Description
Buttons
Collection Indicator
```

Video remains fullscreen.

Ensure text remains readable with stronger overlay if necessary.

---

## Performance Requirements

* Lazy load video
* Preload hero video only
* Compress video for web
* Use hardware acceleration
* Prevent layout shifts
* Smooth playback across devices

---

## Luxury Design Rules

Avoid:

* Glassmorphism cards
* Floating panels
* Heavy gradients
* Large shadows
* Excessive animations
* Busy layouts
* Multiple competing focal points

Focus on:

* Simplicity
* Cinematic storytelling
* Elegant typography
* Premium spacing
* Strong visual hierarchy
* Luxury restraint

The final hero section should feel similar to high-end fragrance brands such as Tom Ford, Byredo, Le Labo, and Maison Francis Kurkdjian, where the video creates the atmosphere and the interface remains clean, minimal, and sophisticated.
