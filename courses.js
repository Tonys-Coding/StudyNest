const text = (title, body) => ({ type: 'text', title, body });
const note = (title, body) => ({ type: 'note', title, body });
const code = (language, content) => ({ type: 'code', language, content });
const steps = (title, items) => ({ type: 'steps', title, items });
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
        id: 'frameworks', title: 'Popular backend frameworks', minutes: 5,
        intro: 'Recognize which work a framework handles for your application.',
        blocks: [
          text('Start with the framework’s job', 'A web framework connects a URL and method to your code. It can also help handle JSON, errors, and middleware. You still define what a request should do and how the application stores information.'),
          text('Express, FastAPI, and Django', 'Express gives JavaScript projects a small set of routing and middleware tools. FastAPI suits Python APIs that use type hints and automatic API docs. Django provides a larger set of built-in tools, including its ORM and admin interface.'),
          code('JavaScript', 'app.get("/lessons", (request, response) => {\n  response.json([{ id: "backend", title: "Backend Fundamentals" }]);\n});'),
          quiz('What does the GET handler above return?', ['A JSON array', 'An HTML document', 'A database connection'], 0, 'The handler calls response.json with an array of lesson objects.'),
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
    title: 'Thinking in React', description: 'Break a screen into components and learn how state connects them.',
    sections: [
      {
        id: 'components', title: 'Split the screen into components', minutes: 4,
        intro: 'Start with a familiar screen and find the pieces you could reuse.',
        blocks: [
          text('A component describes part of a UI', 'A React component is usually a function that returns JSX. A course library could use a CourseCard component for every course. Each instance uses the same structure with its own title and category.'),
          code('JSX', 'function CourseCard({ title, category }) {\n  return <article><p>{category}</p><h2>{title}</h2></article>;\n}'),
          steps('Break down a course library', [
            { label: 'Library', detail: 'The library brings together the filters and the course list.' },
            { label: 'Course list', detail: 'The list loops over the available courses and creates one card for each course ID.' },
            { label: 'Course card', detail: 'The card gets a title and category and displays them consistently.' },
          ]),
          quiz('Where should the card title come from?', ['A prop for each course', 'A hardcoded heading shared by every card', 'A browser setting'], 0, 'Props let each card instance render its own course information.'),
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
