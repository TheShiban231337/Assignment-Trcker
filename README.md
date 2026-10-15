# Assignment Deadline Tracker

A simple, responsive assignment tracker for students. Add coursework, set due dates and priorities, and monitor pending, completed, upcoming, and overdue assignments from a dashboard.

## Features

- Dashboard with total, pending, completed, and overdue counts
- Add and edit assignments with a title, subject, due date and time, priority, and notes
- Search assignments and filter by status or subject
- Sort assignments by due date, priority, or title
- Mark assignments as completed or pending, and delete them
- View upcoming deadlines and urgent tasks
- Load sample assignments to explore the app
- Save assignment data in the browser's local storage
- Responsive layout for desktop and mobile screens

## Built With

- HTML5
- CSS3
- JavaScript
- Tailwind CSS (loaded from its CDN)
- Font Awesome and Google Fonts (loaded from their CDNs)

This version is a client-side web app. It does not require Django, Python, or a separate database server. Assignment data is stored in the current browser, so it is not shared between browsers or devices.

## Project Structure

```text
Assignment Deadline Tracker/
├── index.html   # App layout and interface markup
├── style.css    # Additional custom styles
├── script.js    # Assignment behavior, rendering, and local-storage persistence
└── README.md
```

## Run the App

1. Download or clone the project.
2. Open the project folder.
3. Open `index.html` in a modern web browser.

For a local development server, open the folder in Visual Studio Code and use the Live Server extension to serve `index.html`. An internet connection is needed to load the Tailwind CSS, Font Awesome, and Google Fonts CDNs.

When you first open the app, sample assignments are loaded automatically if the browser has no saved assignments. Use **Load Demo Data** to replace the current assignments with the sample set.

## Assignment Status

- **Pending:** The assignment is not completed and its due date has not passed.
- **Overdue:** The assignment is not completed and its due date has passed.
- **Completed:** The assignment has been marked as completed.

## Developer

**Shiban Sayyed**  
MH Saboo Siddik Polytechnic

Created for educational and academic purposes.
