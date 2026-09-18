# SEO & AI Discovery Engine Guidelines

## 1. Meta Structure & Canonical Hierarchy
- **Title Structure**: `<Page or Note Title> | Notes Exchange — Academic Knowledge Hub`
- **Meta Descriptions**: Compelling, context-rich summaries (140–160 characters) detailing the university, subject, semester, and file format.
- **Viewport**: Mobile-optimized viewport with touch target compliance ($\ge 44\text{px}$).

## 2. JSON-LD Academic Schema Definition
Every note page must embed JSON-LD structured data for Google & AI search engine crawlers:

```json
{
  "@context": "https://schema.org",
  "@type": "DigitalDocument",
  "name": "Data Structures Lecture Notes - Module 3",
  "educationalLevel": "Undergraduate / Semester 4",
  "about": "Computer Science & Engineering",
  "author": {
    "@type": "Person",
    "name": "Student Uploader"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "24"
  }
}
```

## 3. Mobile Responsiveness & AI Micro-Interactions
- Use responsive CSS Grid / Flexbox layouts for note cards, analytics graphs, and readers.
- Drawer-based navigation for mobile viewports ($< 768\text{px}$).
- Glassmorphism backdrop filters (`backdrop-blur-md`, subtle border highlights) to achieve a modern AI aesthetics look.
