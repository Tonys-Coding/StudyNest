const text = (title, body) => ({ type: 'text', title, body });
const note = (title, body) => ({ type: 'note', title, body });
const code = (language, content) => ({ type: 'code', language, content });
const steps = (title, items) => ({ type: 'steps', title, items });
const counter = (title, description) => ({ type: 'counter', title, description });
const quiz = (question, options, correct, feedback) => ({ type: 'quiz', question, options, correct, feedback });

const courses = [
  {
    id: 'backend', category: 'Backend', level: 'Foundations', icon: 'server',
    title: 'Backend Fundamentals', description: 'Follow a request from the browser to the server and back.',
    sections: [
      {
        id: 'overview', title: 'What a backend does', minutes: 4,
        intro: 'Follow a request through a small web app and see where the backend fits.',
        blocks: [
          text('The part that runs on the server', 'Imagine opening a study dashboard. The browser displays the buttons and lesson cards. It asks the server for your saved lessons. The backend checks who you are, finds your lessons, and returns data the browser can display.'),
          steps('Trace a lesson request', [
            { label: 'Browser', detail: 'You open Bookmarks. The browser sends GET /bookmarks to the server with your session cookie.' },
            { label: 'Server', detail: 'The backend uses the session to identify you. It asks the database for bookmarks associated with your user ID.' },
            { label: 'Database', detail: 'The database returns the matching records. The server turns them into a response.' },
            { label: 'Response', detail: 'The browser receives 200 OK and a JSON list. It uses that list to draw your bookmark cards.' },
          ]),
          note('The server owns the rules', 'A browser can hide an Edit button, but anyone can make a request directly. The backend must check permissions before it changes data.'),
          quiz('Which part decides whether you can edit a saved lesson?', ['The browser layout', 'The backend', 'The button style'], 1, 'The backend checks permission on each request that changes protected data.'),
        ],
      },
      {
        id: 'requests', title: 'Requests, responses, and APIs', minutes: 5,
        intro: 'Read an HTTP request as a small message with a specific job.',
        blocks: [
          text('Method, path, headers, and body', 'The method describes the action. The path identifies the resource. Headers carry details such as the type of data being sent. A body carries the submitted data when the operation needs it.'),
          code('HTTP', 'POST /bookmarks HTTP/1.1\nHost: study.example\nContent-Type: application/json\n\n{"lessonId": "backend", "sectionId": "requests"}'),
          text('Read the response first by status', 'A 201 response signals that the server created something. A 400 response asks you to check the request. A 500 response means the server hit an unexpected error. The body can provide details in each case.'),
          quiz('Which method fits reading a list of lessons?', ['GET', 'POST', 'DELETE'], 0, 'GET is the conventional method for retrieving a resource.'),
        ],
      },
      {
        id: 'frameworks', title: 'Express and other backend frameworks', minutes: 14,
        intro: 'Start with one appointments API, then compare how popular frameworks help build it.',
        blocks: [
          text('A server has a job for each request', 'When a resident opens an appointments page, the frontend asks the backend for appointments. The backend can check who is making the request, look up records, and send data back. The browser uses that response to build the screen.'),
          steps('Pick an action for the appointments API', [
            { label: 'Read', detail: 'GET /api/appointments requests the list. A successful response can return 200 and a JSON array.' },
            { label: 'Create', detail: 'POST /api/appointments sends the details for a new appointment. The server validates them before creating a record.' },
            { label: 'Update', detail: 'PATCH /api/appointments/1 changes specific fields on appointment 1, such as the time.' },
            { label: 'Delete', detail: 'DELETE /api/appointments/1 asks to remove appointment 1. The server decides if the caller is allowed to do that.' },
          ]),
          text('Node.js runs JavaScript on the server', 'Node.js provides modules for opening an HTTP server and reading incoming requests. You can use those modules directly. Express adds a routing and middleware API so you can describe each endpoint with less plumbing.'),
          code('Terminal', 'mkdir appointments-api\ncd appointments-api\nnpm init -y\nnpm install express'),
          code('JavaScript · server.js', `const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/appointments", (request, response) => {
  response.json([{ id: 1, title: "Caseworker meeting" }]);
});

app.listen(3000);`),
          text('Read the Express example in order', 'express() creates the app. express.json() prepares JSON bodies for routes that receive them. app.get() registers a handler for the matching HTTP method and path, and response.json() sends the array to the caller. Run node server.js, then open http://localhost:3000/api/appointments to see the sample response.'),
          note('Where middleware fits', 'Middleware can run before the endpoint handler. For example, a logger can record the request method and path, then call next() so the handler runs. An authentication middleware can end a request early if the caller has no valid session.'),
          steps('Compare JavaScript and TypeScript frameworks', [
            { label: 'Express', detail: 'A small routing and middleware API. You decide how to organize routes, validate input, and connect other tools.' },
            { label: 'Fastify', detail: 'Routes can declare JSON Schemas for request validation and response serialization. Plugins help you organize related parts of the server.' },
            { label: 'NestJS', detail: 'Controllers handle endpoints and services contain work you can reuse. Dependency injection lets Nest supply a controller with its service.' },
            { label: 'Hono and Elysia', detail: 'Hono uses standard Web Request and Response APIs and supports several runtimes. Elysia emphasizes TypeScript inference and is commonly used with Bun.' },
          ]),
          steps('Look beyond JavaScript', [
            { label: 'FastAPI', detail: 'A Python API framework that uses type annotations for validation and generates OpenAPI documentation.' },
            { label: 'Django', detail: 'A Python framework with a database ORM and an admin interface for working with registered models.' },
            { label: 'Flask', detail: 'A small Python web framework that lets you add pieces for data access, forms, and other needs.' },
            { label: 'Other ecosystems', detail: 'Spring Boot is common in Java, ASP.NET Core in C#, and Rails in Ruby. The same ideas of routes, request handling, and data access carry over.' },
          ]),
          text('Where Next.js fits', 'A Next.js application can serve its React pages and its API from the same project. A team can also put its API in a separate Express, Fastify, or other server when several clients share it or when the API needs its own release cycle.'),
          text('Where the data lives', 'A database stores the appointments. A tool such as Prisma lets server code read and write database records, while the framework handles requests. Authentication identifies the caller, and authorization decides which records that caller may access.'),
          quiz('Which tool in the example maps GET /api/appointments to a handler?', ['SQLite', 'Express', 'The React component'], 1, 'Express matches the method and path. The database stores records and the React component displays data.'),
        ],
      },
      {
        id: 'middleware', title: 'Middleware and the request pipeline', minutes: 5,
        intro: 'See what can happen between an incoming request and the final route handler.',
        blocks: [
          text('Work that several routes share', 'Middleware is code the server runs around route handlers. A JSON parser prepares the body. An authentication check can stop an unauthenticated request. Logging can record the result and timing. Order matters when one step depends on data prepared by another.'),
          steps('Walk through saving a bookmark', [
            { label: 'Parse JSON', detail: 'The server turns the request body into usable data. Malformed JSON can cause the request to stop here.' },
            { label: 'Check session', detail: 'The server identifies the user. If there is no valid session, it returns 401.' },
            { label: 'Save bookmark', detail: 'The route validates the lesson ID, saves a record for that user, and responds with 201.' },
          ]),
          quiz('What should the server do if the session check fails?', ['Continue to the save handler', 'Return an error before saving', 'Let the browser decide'], 1, 'Stopping the request before the write keeps unauthenticated users from changing protected data.'),
        ],
      },
      {
        id: 'auth', title: 'Authentication and authorization', minutes: 5,
        intro: 'Separate identity from permission when designing an endpoint.',
        blocks: [
          text('Who are you? What can you do?', 'Authentication establishes identity. Authorization checks what that identity can do. A signed-in learner can read their own saved progress. The backend still has to check if the learner can read any specific progress record.'),
          note('A simple ownership check', 'When returning a personal bookmark, look it up using both the bookmark ID and the signed-in user ID. An ID from the browser identifies a requested record and does not establish ownership.'),
          quiz('A signed-in learner requests another user’s private progress. Which check should stop it?', ['Authorization', 'Authentication', 'JSON parsing'], 0, 'Authorization decides whether a known user has permission to read that record.'),
        ],
      },
    ],
  },
  {
    id: 'react', category: 'Frontend', level: 'Foundations', icon: 'layers',
    title: 'Thinking in React', description: 'Start with React and Next.js, then compare Svelte and build interactive components.',
    sections: [
      {
        id: 'components', title: 'React and Next.js for beginners', minutes: 9,
        intro: 'Use a dashboard to understand what React builds and what Next.js adds.',
        blocks: [
          text('Start with a page you already know', 'On a resident dashboard, HTML gives the page its structure, CSS describes its appearance, and JavaScript handles actions such as opening a menu. React helps organize that interface into reusable pieces as the page grows.'),
          text('React builds the pieces you see and use', 'A component is a piece of the interface described by a JavaScript function. In this example, JSX is the HTML-like syntax. The title and time are props, which are inputs that let one component show different appointments.'),
          code('JSX', `function AppointmentCard({ title, time }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{time}</p>
    </article>
  );
}

// Example use inside another component
// <AppointmentCard title="Caseworker meeting" time="10:00 AM" />`),
          text('State is data the interface remembers', 'A counter has a value that can change. React’s useState gives a component the current value and a function to update it. When you press the button, React uses the new value to update the display.'),
          code('JSX', `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(previous => previous + 1)}>
      Count: {count}
    </button>
  );
}`),
          counter('Try changing the count', 'Press Increase or Decrease. The display follows the current value. Reset puts it back at the starting value.'),
          text('Next.js organizes the application around React', 'Next.js is a framework built on React. You still write React components. Next.js adds conventions for pages, layouts and server code, along with tools for how and where to render a page.'),
          steps('See what Next.js adds', [
            { label: 'Routes', detail: 'With the App Router, app/appointments/page.tsx creates the /appointments page. The file’s location describes the URL.' },
            { label: 'Rendering', detail: 'A page can be prepared ahead of time, rendered on the server when needed, or updated by JavaScript in the browser. The right choice depends on the page and its data.' },
            { label: 'Backend', detail: 'A route handler at app/api/appointments/route.ts can return appointment data. The project still needs its own choices for storage and sign-in.' },
            { label: 'Layouts', detail: 'A shared layout can place the same navigation around several pages, so each page only describes its own content.' },
          ]),
          text('Put the layers together', 'In an appointments portal, Next.js can handle the URL, Prisma can query a SQLite database on the server, and a React component can turn the records into appointment cards. Each tool has a separate job.'),
          note('Other ways to start', 'React with Vite is a way to build a React frontend with a development and build tool. Vue and Svelte also help build interfaces. Nuxt and SvelteKit add application structure around Vue and Svelte.'),
          quiz('Your project already uses Next.js. What do you use to build its appointment cards?', ['React components', 'A second framework to replace React', 'A database table for each card'], 0, 'Next.js uses React for the interface. One component can display many appointments using different props.'),
        ],
      },
      {
        id: 'svelte-comparison', title: 'Svelte, SvelteKit, and Next.js', minutes: 10,
        intro: 'Build the same counter twice, then compare how two frameworks load a real page.',
        blocks: [
          text('Compare the same layers', 'React and Svelte both help you build and update the interface. Next.js and SvelteKit add routing and server features around React and Svelte respectively. Comparing each pair answers a different question.'),
          text('The same state change in React and Svelte', 'The React example calls a setter from useState. In a Svelte 5 component, $state declares a reactive value, and an assignment to that value can update the view. Both examples start at zero and add one per click.'),
          code('JSX · Counter.jsx', `import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(previous => previous + 1)}>
      Count: {count}
    </button>
  );
}`),
          code('Svelte · Counter.svelte', `<script>
  let count = $state(0);
</script>

<button onclick={() => count += 1}>Count: {count}</button>`),
          counter('Try the shared result', 'Both versions describe the same behavior. Use the controls to watch the number change.'),
          steps('Trace an appointments page in both frameworks', [
            { label: 'Next.js route', detail: 'app/appointments/page.tsx defines the page. An async Server Component can call a server-side data function and then render the appointment list.' },
            { label: 'SvelteKit route', detail: 'src/routes/appointments/+page.svelte defines the page. A load function in the adjacent +page.server.ts can fetch records and pass them to the page.' },
            { label: 'What they share', detail: 'Both support routing, rendering on the server, pages built ahead of time, server endpoints, and form handling. The files and conventions differ.' },
          ]),
          text('Choose around your project', 'For a team with existing React components and integrations, Next.js makes that work easier to reuse. For a small project where the team prefers the Svelte component syntax, SvelteKit is a natural choice.'),
          note('Measure the page you build', 'The amount of JavaScript, time spent fetching data, and rendering choices can all affect how fast a page feels. A framework name alone does not settle performance.'),
          quiz('Which pair are both application frameworks?', ['React and SvelteKit', 'Next.js and SvelteKit', 'React and Svelte'], 1, 'Next.js structures applications built with React, and SvelteKit does the same for Svelte.'),
        ],
      },
      {
        id: 'state', title: 'Props, state, and updates', minutes: 5,
        intro: 'Know where to keep the value that changes when someone uses the app.',
        blocks: [
          text('State is the data React remembers', 'The library can use state to remember the selected category. When that category changes, React renders again with the new selection, and the filtered list updates. Each card receives its course as a prop.'),
          code('JSX', 'const [category, setCategory] = useState("All");\nconst visibleCourses = courses.filter(\n  course => category === "All" || course.category === category\n);'),
          note('Calculate values you can derive', 'The filtered list can be calculated from the current category and course list. Keeping a second copy in state creates a value you would have to keep in sync.'),
          quiz('Which value should the library store in state in this example?', ['The category the learner chose', 'Every possible filtered list', 'The font size of each card'], 0, 'The selected category is the value that changes through interaction.'),
        ],
      },
      {
        id: 'events', title: 'Events and shared state', minutes: 5,
        intro: 'Connect a filter control and a course list through their nearest common parent.',
        blocks: [
          text('Pass a callback to the control', 'If a filter bar and a course list both depend on the selected category, keep it in their parent. The parent passes the current value to the filter bar and can pass the filtered courses to the list.'),
          code('JSX', '<FilterBar value={category} onChange={setCategory} />\n<CourseList courses={visibleCourses} />'),
          quiz('What happens when FilterBar calls onChange("Backend")?', ['The parent updates category state', 'The course data is deleted', 'The browser opens a new page'], 0, 'The callback updates parent state, which changes the list on the next render.'),
        ],
      },
      {
        id: 'practice', title: 'Plan a bookmark button', minutes: 4,
        intro: 'Apply what you learned to a button that changes its label.',
        blocks: [
          text('Identify the data and the action', 'The button has two visual states, saved and unsaved. If a count elsewhere on the same screen also depends on that bookmark, keep the bookmark state in their shared parent and give the button a toggle callback.'),
          code('JSX', '<button aria-pressed={saved} onClick={onToggle}>\n  {saved ? "Bookmarked" : "Bookmark"}\n</button>'),
          quiz('Where should bookmark state live if the button and sidebar count both use it?', ['In their shared parent', 'In the button’s CSS', 'In a separate copy inside each component'], 0, 'One shared source of state lets both components respond to the same update.'),
        ],
      },
    ],
  },
  {
    id: 'python', category: 'Python', level: 'Foundations', icon: 'terminal',
    title: 'Python Dictionaries', description: 'Look up values by key, count items, and group related data.',
    sections: [
      {
        id: 'keys', title: 'Keys and values', minutes: 4,
        intro: 'Use a named key to find its associated value.',
        blocks: [
          text('Look up by name', 'A Python dictionary maps keys to values. In a study tracker, a topic name could be the key and the number of sections completed could be the value. Reading or assigning an entry uses that key.'),
          code('Python', 'progress = {"backend": 2, "react": 1}\nprint(progress["backend"])  # 2\nprogress["backend"] = 3'),
          note('Missing keys', 'Square bracket lookup raises KeyError when a key is missing. Use get when you want a default for a missing key, such as progress.get("python", 0).'),
          quiz('What does progress.get("python", 0) return when python is missing?', ['0', 'None', 'KeyError'], 0, 'The second argument supplies the default value.'),
        ],
      },
      {
        id: 'count', title: 'Count items in one pass', minutes: 5,
        intro: 'Track how often each value appears using a dictionary.',
        blocks: [
          code('Python', 'counts = {}\nfor topic in ["api", "react", "api"]:\n    counts[topic] = counts.get(topic, 0) + 1'),
          steps('Walk through the loop', [
            { label: 'First api', detail: 'There is no api entry yet. get returns 0, so the assignment stores {"api": 1}.' },
            { label: 'First react', detail: 'The react count starts at zero too. The dictionary becomes {"api": 1, "react": 1}.' },
            { label: 'Second api', detail: 'get returns the existing api count, 1. The assignment changes it to 2.' },
          ]),
          quiz('What will counts["api"] contain after the loop?', ['1', '2', '3'], 1, 'The loop visits api twice, so the count is 2.'),
        ],
      },
      {
        id: 'group', title: 'Group items by a shared key', minutes: 5,
        intro: 'Store several related values under the same key.',
        blocks: [
          text('Let each value be a list', 'A dictionary can use a category as its key and a list of lesson titles as its value. Create an empty list when you first see a category, then append each lesson title to the appropriate list.'),
          code('Python', 'lessons = [("Backend", "HTTP"), ("Python", "Dictionaries"), ("Backend", "Auth")]\ngroups = {}\nfor category, title in lessons:\n    groups.setdefault(category, []).append(title)'),
          quiz('What is groups["Backend"] after this loop?', ['["HTTP", "Auth"]', '["Auth"]', '["Backend", "Backend"]'], 0, 'Both Backend lessons are appended to the same list in input order.'),
        ],
      },
    ],
  },
];

const sectionCount = courses.reduce((count, course) => count + course.sections.length, 0);
const courseMinutes = course => course.sections.reduce((minutes, section) => minutes + section.minutes, 0);
