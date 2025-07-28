# **🌍 GeoTime**

**GeoTime** is an interactive, timeline-synced geographical visualization app designed to plot **global historical, cultural, and scientific events** on a 2D or 3D map interface. It enables users to explore thousands of events across space and time using a smooth, animated slider — all presented on a map or globe enriched with contextual markers and data overlays.

## 🔍 Overview

* 📍 **Event Mapping:** Visualizes thousands of events on a map using a timeline slider. Each marker represents a moment in history tied to a place and date.
* 🕰️ **Time Navigation:** A horizontal timeline slider lets you scrub through time. As you move, the event markers animate in and out to reflect the selected time window.
* 🗺️ **Interactive Globe or Map:** Powered initially by Mapbox (optionally switchable to open-source alternatives like MapLibre), the interface supports zoom, pan, and click-to-learn interactions.
* ⚡ **Optimized Performance:** (WIP) Marker clustering ensures smooth performance even with large datasets.
* 🧠 **AI-Powered Build:** Much of the development process — architecture planning, UI decisions, component scaffolding — was bootstrapped using **Lovable AI** and **Gemini CLI**

## **📑 Table of Contents**

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Future Roadmap and Potential Features](#-future-roadmap-and-potential-features)
- [Origin](#-origin)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Comparable Projects](#-comparable-projects)
- [Target Users & Use Cases](#-target-users--use-cases)
- [Risks & Challenges](#️-risks--challenges)
- [Potential Monetization & Growth Ideas](#-potential-monetization--growth-ideas)
- [Known Issues](#-known-issues)
- [Built With](#-built-with)
- [Lovable Prompt](#-lovable-prompt)
- [Author](#-author)
- [License](#-license)

## 🧭 Features

* 🌍 Interactive 3D Globe for displaying geo-located historical events
* 📅 Timeline slider to explore events across time
* 📌 Clickable Popup cards with **summaries, images, and Wikipedia links.**

## 🎥 Demo

Include a **screenshot, GIF, or a short video** here to visually demonstrate the project's functionality and user interface.

## 🚀 Future Roadmap and Potential Features

* **LLM Generated Summary of Event in Side Panel** - Select an Event - Click on Generate Summary in Side Panel
* **LLM “History” Query** - Natural‑language request: *“Show me some political historical events that happened in New York in 1886”* changes the Year filter, Category Filter (if available) and the globe position to destination
* Add filters by **time range, region, or event category**
* Near Real-time updates using Wikipedia API
* **Day-level slider** for recent events (last 1 year)
* Ability to **compare two dates/eras** side by side
* **Country borders over time**
* **“What happened here on this date?”** – geosearch via location or GPS

## ✨ Origin

### **Initial Concept (7-8 years ago):**

As someone deeply interested in **History**, and even more in **Anthropology,** which I see as the study of how history itself evolves across **time** and **geography,** I often found myself [falling into](https://histography.io/) Wikipedia rabbit holes when searching about a topic. So somewhere in the late 2010s, I had an [idea about t](http://wikiverse.io/) his website to visualize history on a world map, with time as a dimension. The goal was to have a view of historical events geo[graphically and ch](https://www.informationisbeautifulawards.com/showcase/1182-wikiverse) ronologically.

### **Potential Inspiration Sources**

* **[Histography.io](https://histography.io/)**: Interactive visualization of historical events from Wikipedia, primarily timeline-based.
* **[Wikiverse.io](http://wikiverse.io/)** (Now Defunct): A "galactic reimagining" of Wikipedia where articles appear as stars clustered by similarity.

  * More details: [Wikiverse Showcase](https://www.informationisbeautifulawards.com/showcase/1182-wikiverse).
  * [Modern equivalent: ](https://meta.wikimedia.org/wiki/Wikihistorymap)[anvaka/map-of-github](https://meta.wikimedia.org/wiki/Wikihistorymap)[.](https://meta.wikimedia.org/wiki/Wikihistorymap)

### **Why I Couldn't Build It Then:**

I lacked full-stack web development skills at the time. However, with advancements in no-code tools like **Lovable**, the concept is now achievable.

### **Additional Sources Found Today:**

* **Wikihistorymap -** Discovered an exact same idea laid out here \[July’25] -  [https://meta.wikimedia.org/wiki/Wikihistorymap](https://meta.wikimedia.org/wiki/Wikihistorymap) (Can’t find a Date Published for this)

* Purpose and Application Similar to GeaCron [http://geacron.com/the-geacron-project/](http://geacron.com/the-geacron-project/)

  * Quote from Official Website - “GeaCron’s mission is to make historic information universally accessible for everyone, through intuitive and attractive geo-temporal maps, as well as configurable timelines. We propose a different approach. We created a system to represent the historical events and the geopolitical maps of any region in the world, for any given historical time period.”
  * Quote from Founder Luis Múzquiz’s Story - “In 2011 Luis founded GeaCron in response to an idea that goes back to the 80s: a system to facilitate knowledge of historical events that have taken place every moment in our planet, in an interactive way and on a temporary geographical map.”

## **Quick Start**

```sh
# Install dependencies (frontend + backend)
npm install
cd server && npm install && cd ..

# Start both frontend and backend
npm run dev
```

Visit [http://localhost:8080](http://localhost:8080) and enter your Mapbox API key when prompted.

## **API Endpoints**

* `GET /api/events?year=1969` - Get historical events by year
* `GET /api/events/:id` - Get specific event details
* `GET /api/categories` - Get available categories

## 🔍 Comparable Projects

### **Closest Existing Tools**

* **[Chronas.org](https://www.chronas.org/)**:

  * History explorer with data until 2000 as well lacks full event coverage within that time frame

* **[Histography](https://histography.io/)**:

  * Timeline-based, Wikipedia-powered visualization. Less map-centric, more **timeline-first**.

* **HistoryMaps:**

  * Curated major events with modern storytelling elements.

* **Running Reality:**

  * More focused on **geopolitical mapping** and changes over time.

### **How this Web App Differs**

* Combines **Wikipedia/Wikidata parsing** for events with **geo-temporal mapping**
* Focuses on **micro-level events**, not just macro historical changes
* Prioritizes a **modern UX/UI with interactive storytelling**

## 🧑‍🎓 Target Users & Use Cases

* **Target Users:** Students, teachers, history enthusiasts, researchers, travelers, and anthropologists.

* **Use Cases:**

  * Education (visual learning in classrooms)
  * Research and historical comparisons
  * "Today in History" explorations
  * Travel and heritage tourism insights

## ⚠️ Risks & Challenges

* Data accuracy and completeness
* Performance when handling large datasets
* Licensing constraints for Wikipedia or historical maps

## 💰 Potential Monetization & Growth Ideas

* Freemium model for educators
* Paid premium features (e.g., custom historical overlays)
* API for third-party history apps

## **🐛 Known Issues**

## 🛠 Built With

* **Frontend:** React, Tailwind CSS
* **Backend:** Node.js, Express
* **Other Tools:** Vite, TypeScript, shadcn-ui, VS Code
* **AI & Dev Tools:** Lovable (no-code deployment), ChatGPT (Debugging), Gemini CLI (Further Development)

## 🧠 Lovable Prompt

Build a visually engaging website with an interactive world map as the centerpiece. At the top, include a date filter (timeline slider or calendar) that allows users to select a specific date or range of dates. The site should parse Wikipedia (or a similar dataset) to gather historical events and display them as pins or markers on the map at their corresponding geographical locations. When a user clicks on a marker, show a popup with a summary of the event, relevant images, and a link to the full Wikipedia article. The interface should be minimal, modern, and intuitive, focusing on exploring history by time and place

## **👤 Author**

**Karan Gupta**

---

## **📜 License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
