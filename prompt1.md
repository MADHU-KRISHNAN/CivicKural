# Codex Instruction: Convert ONLY Frontend Folder to Web React App

## Objective

Convert ONLY:

```
frontend/SamvadApp
```

from a React Native application into a browser-based React application.

The final application must run using:

```bash
npm install
npm run dev
```

and open in a normal web browser.

## STRICT SCOPE RULE

Modify ONLY:

`frontend/SamvadApp`

Do NOT modify:

- backend
- shared
- root package.json
- documentation
- any other folder

## Current Application

Current stack:
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Native components

Target stack:
- React
- React DOM
- TypeScript
- Vite
- React Router DOM
- Browser APIs

## Main Goal

Remove dependency on:
- Android Studio
- Android SDK
- Emulator
- Gradle
- Java
- Metro Bundler
- iOS tools

The frontend must become a normal web application.

## Conversion Instructions

### React Native Components Conversion

Replace all React Native imports.

Remove:
```typescript
import { View, Text, StyleSheet } from "react-native";
```

Convert:

| React Native | Web React |
| :--- | :--- |
| View | div |
| Text | p/span/h1/h2 |
| ScrollView | div with overflow |
| TouchableOpacity | button |
| Pressable | button |
| TextInput | input |
| Image | img |
| FlatList | Array.map() |
| StyleSheet | CSS modules / normal CSS |

### Navigation Conversion

Remove:
- `@react-navigation/native`
- `@react-navigation/stack`

Install and use:
- `react-router-dom`

Create browser routes.

Example:
- `/`
- `/login`
- `/report`
- `/issues`
- `/profile`
- `/admin`

Maintain the same navigation logic.

### Storage Conversion

Remove:
- `@react-native-async-storage/async-storage`

Replace with:
- `localStorage`

Example:
- `localStorage.setItem()`
- `localStorage.getItem()`

Maintain existing behaviour.

### Image Upload Conversion

Remove:
- `react-native-image-picker`

Replace with:
- `<input type="file">`

Support:
- selecting image
- preview
- uploading

### Styling

Do NOT redesign the UI.

Keep:
- same colors
- same layout
- same buttons
- same forms
- same user flow

Only convert mobile components into web components.

### API Handling

Do NOT modify backend.

Backend runs separately:
`http://localhost:5000`

Keep API service logic.

Use axios/fetch where required.

### Convert Project To Vite

Create:
- `vite.config.ts`
- `index.html`
- `src/main.tsx`

Required structure:

```
frontend/SamvadApp
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
└── index.html
```

### package.json Requirement

Replace scripts with:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Dependencies

Remove mobile-only dependencies:
- `react-native`
- `react-navigation`
- `async-storage`
- `react-native-image-picker`

Install:
- `react`
- `react-dom`
- `react-router-dom`
- `vite`
- `axios`
- `typescript`

## Code Quality Rules

- Keep TypeScript working
- Fix all import errors
- Remove unused React Native files
- Do not rewrite the application from scratch
- Reuse existing screens and logic

## Final Testing

Inside:
`frontend/SamvadApp`

run:
```bash
npm install
npm run dev
```

Expected:
A browser URL appears:
`http://localhost:5173`

The application should load successfully.

## Final Reminder

ONLY convert:
`frontend/SamvadApp`

Do not touch:
- `backend/`
- `shared/`

The goal is ONLY:
"Make the frontend run with `npm run dev` in a browser."
