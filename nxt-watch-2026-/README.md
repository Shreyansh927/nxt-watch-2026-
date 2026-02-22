<h1>📺 Nxt-Watch — OTT Platform Clone</h1>

<p>
Nxt-Watch is a full-stack OTT platform clone inspired by modern video streaming applications.
It allows users to browse video content, authenticate securely, and enjoy a smooth,
responsive viewing experience.
</p>

<p>
The project focuses on real-world frontend architecture, authentication flows,
third-party API integration, and clean UI design, making it suitable for learning
and resume showcase.
</p>

<h1>🚀 Features</h1>

<h3>🔐 Authentication & Authorization</h3>
<p>
Nxt-Watch implements secure user authentication with login and logout functionality.
Protected routes ensure that only authenticated users can access video content.
</p>

<h3>🎥 Video Streaming Experience</h3>
<p>
Users can browse and watch videos using a Netflix-style layout.
Each video page displays rich details such as title, overview, genres, ratings,
runtime, and related content.
</p>

<h3>🔍 Search & Discovery</h3>
<p>
Users can search for movies and shows dynamically using external APIs.
The platform supports browsing across multiple categories such as trending,
popular, and top-rated content.
</p>

<h3>🧠 Semantic Search</h3>
<p>
Nxt-Watch supports semantic search to improve content discovery beyond traditional
keyword-based searching. Users can search using natural language queries such as
themes, moods, or concepts instead of exact titles.
</p>

<p>
The semantic search feature leverages AI-generated context and metadata from external
APIs to understand user intent and return more relevant movie and show results.
This provides a more intuitive and human-like search experience.
</p>

<p>
The implementation is designed to be efficient and free-tier friendly, avoiding
heavy embedding pipelines while still delivering meaningful relevance.
</p>


<h3>🤖 Gemini AI Mode</h3>
<p>
Nxt-Watch includes a Gemini-powered AI mode that enhances the video browsing experience
by generating intelligent summaries and contextual information about movies and shows.
The AI operates strictly on fetched metadata and predefined context to ensure accurate
and controlled outputs.
</p>

<h3>🌍 Multilingual Summaries</h3>
<p>
Users can generate summaries of movies and shows in multiple languages using Gemini AI.
This feature improves accessibility and usability for non-English audiences by allowing
content understanding in their preferred language.
</p>

<p>
The multilingual summary feature is implemented dynamically without duplicating data,
ensuring efficient API usage and predictable costs.
</p>


<h3>❤️ User Interactions</h3>
<p>
Users can like, dislike, and save videos for later viewing.
Saved videos persist per user session, improving personalization.
</p>

<h3>📱 Responsive UI</h3>
<p>
The application is fully responsive and optimized for desktop, tablet,
and mobile devices, ensuring a consistent viewing experience across screen sizes.
</p>

<h1>🏗️ Tech Stack</h1>

<h3>Frontend</h3>
<p>
The frontend is built using React with a component-based architecture.
Reusable UI components and clean state management ensure scalability
and maintainability.
</p>

<h3>Backend</h3>
<p>
The backend is implemented using Node.js and Express.js, exposing REST APIs
for authentication and user-specific operations. JWT-based authentication
is used to protect private routes.
</p>

<h3>External APIs & Integrations</h3>

<h4>🎬 TMDB (The Movie Database)</h4>
<ul>
  <li>Trending movies and TV shows</li>
  <li>Movie metadata (title, genres, ratings, posters)</li>
  <li>Related and recommended content</li>
</ul>

<h4>🎞️ OMDb API</h4>
<ul>
  <li>Extended movie details</li>
  <li>IMDb ratings</li>
  <li>Additional metadata not available in TMDB</li>
</ul>

<h4>▶️ VidSrc</h4>
<ul>
  <li>Embedding full movies directly in the application</li>
  <li>Providing a seamless playback experience</li>
</ul>

<p>
External APIs are consumed securely, and responses are normalized
before being rendered in the UI.
</p>

<h1>🧩 Architecture Overview</h1>

<p>
The client communicates with backend REST APIs for authentication
and user-specific actions. Video metadata is fetched dynamically
from third-party APIs such as TMDB and OMDb, while playback is
handled via VidSrc embeds.
</p>

<p>
The frontend efficiently manages API data, authentication tokens,
and UI state to deliver a smooth OTT-style experience.
</p>

<h1>📸 Screenshots</h1>

<h3>Login Page</h3>
<img width="1000" height="700" alt="image" src="https://github.com/user-attachments/assets/6f7fba7b-74b6-462b-badf-477f0b981b54" />

<h3>Home</h3>
<img width="1000" height="700" alt="image" src="https://github.com/user-attachments/assets/332c734b-f076-45d3-9216-326447dbb93e" />

<h3>Trending Movies</h3>
<img width="1000" height="700" alt="image" src="https://github.com/user-attachments/assets/2805b203-0c2e-4af3-82e6-e6dc57855a52" />

<h3>Video Detail Section</h3>
<img width="1000" height="700" alt="image" src="https://github.com/user-attachments/assets/4ca6cf58-0045-49c7-b0eb-fc70853bfde2" />


<p>
Screenshots are taken from the live application to showcase UI design,
responsiveness, and real API-driven data rendering.
</p>

<h1>🎬 Video Demo</h1>

<h3>Short Walkthrough</h3>
<p>
A short demo video showcasing authentication, video browsing,
search functionality, and playback experience.
</p>

<video src="./videos/nxt-watch-demo.mp4" controls width="800"></video>

<p>
Video demos help visualize real user interactions without running
the project locally.
</p>

<h1>🧠 Design Philosophy</h1>

<p>
Nxt-Watch focuses on clean separation of UI and data logic,
secure authentication flows, efficient API consumption,
and a scalable component structure.
</p>

<p>
The project simulates real production OTT workflows
without unnecessary complexity.
</p>

<h1>🧪 Application Behavior</h1>

<p>
Unauthenticated users are redirected to the login page.
Authenticated users can browse, search, watch videos,
and manage saved content without page reloads.
</p>

<p>
API failures and edge cases are handled gracefully
with user-friendly feedback.
</p>

<h1>📈 Future Enhancements</h1>

<ul>
  <li>Personalized recommendations</li>
  <li>Watch history</li>
  <li>User profiles</li>
  <li>Advanced filtering and sorting</li>
  <li>Performance optimizations</li>
  <li>CI/CD-based deployment</li>
</ul>

<h1>🧠 Interview Talking Point</h1>

<p>
“Nxt-Watch integrates multiple external APIs like TMDB, OMDb,
and VidSrc to simulate a real OTT platform. I focused on
authentication, protected routes, dynamic API-driven UI,
and responsive design.”
</p>

<h1>👨‍💻 Author</h1>

<p>
<strong>Shreyansh Dixit</strong><br />
Aspiring Full-Stack Developer focused on React, backend APIs,
and real-world application design.
</p>
