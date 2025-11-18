# Firebase Setup Guide for Global Leaderboard

This guide will help you set up Firebase for the global leaderboard feature in Space Impact Card.

## Why Firebase?

Firebase Realtime Database provides a free, serverless solution for storing and syncing leaderboard data across all players worldwide. The free tier is sufficient for thousands of players.

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter a project name (e.g., "space-impact-leaderboard")
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**

### 2. Create Realtime Database

1. In your Firebase project, go to **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Select a location closest to your users
4. Start in **"Test mode"** (we'll secure it in the next step)
5. Click **"Enable"**

### 3. Configure Database Rules

1. In Realtime Database, go to **"Rules"** tab
2. Replace the default rules with:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      "$entry": {
        ".validate": "newData.hasChildren(['name', 'score', 'level', 'timestamp']) && newData.child('name').isString() && newData.child('score').isNumber() && newData.child('level').isNumber() && newData.child('timestamp').isNumber()"
      }
    }
  }
}
```

3. Click **"Publish"**

**What these rules do:**
- Allow anyone to read the leaderboard (`.read: true`)
- Allow anyone to write new entries (`.write: true`)
- Validate that entries have required fields: name, score, level, timestamp
- Prevent writing to other parts of the database

**Security Note:** These rules allow public write access. For additional security, consider:
- Adding rate limiting using Firebase Functions
- Implementing anti-cheat measures
- Using Firebase Auth for verified users

### 4. Get Firebase Configuration

1. In Firebase Console, click the **gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **web icon** (`</>`)
4. Register your app (name: "Space Impact Card")
5. Copy the Firebase configuration object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com"
};
```

### 5. Update space-impact-card.js

1. Open `space-impact-card.js`
2. Find lines 2-10 (the `FIREBASE_CONFIG` constant)
3. Replace the placeholder values with your Firebase configuration:

```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com"
};
```

4. Save the file

### 6. Deploy

1. Restart Home Assistant to reload the card
2. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Play the game and submit a score!
4. Check Firebase Console → Realtime Database to see the data

## Sharing the Leaderboard

For a truly global leaderboard:

1. **Option A (Recommended):** Share your Firebase configuration publicly
   - Add the configuration directly to the repository
   - All users who install the card will use the same leaderboard
   - **Note:** The API key is safe to expose for Firebase client apps

2. **Option B:** Let each user create their own Firebase project
   - Each installation has a separate leaderboard
   - Better for privacy and control
   - Users follow this setup guide

## Monitoring Usage

1. Go to Firebase Console → **"Realtime Database"** → **"Usage"**
2. Monitor:
   - **Connections:** Number of simultaneous players
   - **Storage:** Database size (free tier: 1 GB)
   - **Downloads:** Data transferred (free tier: 10 GB/month)
   - **Writes:** Number of score submissions

**Free Tier Limits:**
- 1 GB storage
- 10 GB/month downloads
- 100 simultaneous connections

These limits are sufficient for thousands of players!

## Troubleshooting

### Leaderboard not loading

1. Check browser console for errors (F12)
2. Verify Firebase configuration is correct
3. Ensure Database Rules are published
4. Check that database URL ends with `.firebaseio.com`

### "Permission denied" errors

1. Verify Database Rules are set correctly
2. Make sure `.read` and `.write` are both `true` under `leaderboard`
3. Publish the rules again

### Scores not appearing

1. Open Firebase Console → Realtime Database
2. Check if data is being written to `/leaderboard`
3. Verify the data structure matches: `{ name, score, level, timestamp }`

### Too many writes/quota exceeded

1. Check Firebase Console → Usage
2. Consider upgrading to Blaze (pay-as-you-go) plan
3. Or implement rate limiting to reduce writes

## Optional Enhancements

### 1. Add Firebase Functions for Anti-Cheat

Create a Cloud Function to validate scores:

```javascript
exports.validateScore = functions.database.ref('/leaderboard/{entryId}')
  .onCreate((snapshot, context) => {
    const score = snapshot.val().score;
    const level = snapshot.val().level;

    // Validate score is reasonable
    if (score > 100000 || level > 100) {
      return snapshot.ref.remove(); // Delete suspicious scores
    }
    return null;
  });
```

### 2. Clean up old entries

Keep only top 100 scores:

```javascript
exports.cleanupLeaderboard = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.database();
    const snapshot = await db.ref('leaderboard')
      .orderByChild('score')
      .once('value');

    const scores = [];
    snapshot.forEach(child => {
      scores.push({ key: child.key, score: child.val().score });
    });

    // Sort and keep only top 100
    scores.sort((a, b) => b.score - a.score);
    const toDelete = scores.slice(100);

    // Delete entries outside top 100
    for (const entry of toDelete) {
      await db.ref(`leaderboard/${entry.key}`).remove();
    }
  });
```

### 3. Add weekly/monthly leaderboards

Modify the data structure:

```javascript
{
  "leaderboard": {
    "allTime": { ... },
    "weekly": { ... },
    "monthly": { ... }
  }
}
```

## Support

If you encounter issues:

1. Check the [Firebase Documentation](https://firebase.google.com/docs/database)
2. Open an issue on [GitHub](https://github.com/joshuaaaaa/HA---Space-Impact/issues)
3. Join the Home Assistant community forums

---

Made with ❤️ for Space Impact Card
