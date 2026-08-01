# Dr. Wasikul Amin Bipu - Portfolio Website

Personal portfolio website of **Dr. Wasikul Amin Bipu, DVM (BSMRAU)** — Veterinarian, Data Analyst, and R Programmer. 

This repository powers the personal website hosted on GitHub Pages at [wasikulaminbipu.github.io](https://wasikulaminbipu.github.io).

## 🚀 Tech Stack

- **Static Site Generator:** [11ty (Eleventy)](https://www.11ty.dev/)
- **CSS Preprocessor:** [Sass (SCSS)](https://sass-lang.com/)
- **UI Framework:** [Bootstrap 5](https://getbootstrap.com/)
- **Icons & Graphics:** Custom SVG icons via `eleventy-plugin-svg-contents`

## 🛠️ Project Structure

```text
wasikulaminbipu.github.io/
├── assets/         # Static assets (images, icons, media)
├── src/            # Source files for 11ty
│   ├── _includes/  # Layouts and reusable partials
│   ├── scss/       # SCSS styles compiled to CSS
│   └── index.md    # Homepage content
├── .eleventy.js    # Eleventy configuration
├── package.json    # Dependencies and build scripts
└── README.md       # Project documentation
```

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- `npm` (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/wasikulaminbipu/wasikulaminbipu.github.io.git
   cd wasikulaminbipu.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development & Build Commands

- **Start Development Server (with hot reloading & SCSS watch):**
  ```bash
  npm start
  ```
  This builds the SCSS styles and runs Eleventy in local watch mode at `http://localhost:8080`.

- **Build for Production:**
  ```bash
  npm run build
  ```
  Generates static site output into the `_site/` directory.

## 📄 License

This project is licensed under the [BSD-3-Clause License](LICENSE).