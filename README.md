# ⚡ Moshin.dev - Interactive 3D Portfolio


> **"An engineering-focused creative developer building high-performance digital architecture."**

A high-performance, interactive portfolio website built with **Next.js 16**, **Three.js**, and **Physics-based animations**. This project showcases advanced frontend engineering techniques, including 3D rendering, gravity simulations, smooth scrolling, and dynamic time-based theming.

🌐 **Live Demo:** [new-portfolio-nine-indol.vercel.app](https://new-portfolio-nine-indol.vercel.app)

---

## ✨ Key Features

* **🎨 Dynamic Time-Based Theming:** Automatically switches themes (Sunrise, Industrial, Cyber, Safety) based on the user's local time.
* **⚛️ Physics-Based Skills Arena:** Interactive "Gravity Arsenal" using `Matter.js` where skill chips react to gravity and collision.
* **🧊 3D Elements:** Integrated **Three.js** (`@react-three/fiber`) geometric core and interactive cable simulations.
* **🕵️ Hacker Mode:** A hidden command-line terminal easter egg accessible by typing `cmd`.
* **📱 Mobile Optimized:** Responsive layout with performance optimizations (disabled physics/heavy rendering) for mobile devices.
* **🎭 Advanced Animations:** Heavy use of **GSAP**, **Framer Motion**, and **Lenis** for buttery smooth scrolling and reveal effects.
* **🔔 Dynamic Island:** Functional notification system for user interactions (e.g., copying email).

---

## 🛠️ Tech Stack

**Core Framework:**
* ![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat&logo=next.js&logoColor=white) **App Router**
* ![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
* ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
* ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

**Animation & 3D:**
* **Three.js / React Three Fiber** (3D Rendering)
* **Matter.js** (2D Physics Engine)
* **GSAP** (ScrollTrigger & Timeline animations)
* **Framer Motion** (Layout transitions & spring physics)
* **Lenis** (Smooth Scrolling)

**Utilities:**
* `canvas-confetti`
* `react-rough-notation`
* `date-fns`

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/mkhan0012/new-portfolio.git](https://github.com/mkhan0012/new-portfolio.git)
    cd new-portfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open locally:**
    Visit `http://localhost:3000` in your browser.

---

## 🕹️ Hidden Easter Egg

Want to access the developer terminal?
1.  Open the website on a desktop.
2.  Type **`cmd`** on your keyboard.
3.  Use commands like `help`, `ls`, or `whoami` in the terminal overlay.

---

## 📂 Project Structure

```bash
src/
├── app/
│   ├── globals.css      # Tailwind v4 & Custom Animations (Glitch, Neon, Shimmer)
│   ├── layout.tsx       # Root layout & Metadata
│   └── page.tsx         # Main interactive logic (Physics, 3D, Animations)
└── public/              # Static assets (images, resumes, icons)
