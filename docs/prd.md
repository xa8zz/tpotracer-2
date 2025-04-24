# tpotracer: Speed Typing Competition App - Product Requirements Document

## Overview
- Name of the application: tpotracer
- Purpose: Speed typing competition with leaderboard
- Type: Full-screen web application

## Layout
- Split screen layout:
  - Left side: Static leaderboard (approximately 300px width)
  - Right side: Main panel (takes up the rest of the screen space)

## Initial Screen
- Main panel shows:
  - Text prompt asking for Twitter handle
  - Large input field with no outline
  - Large font size for both the prompt and input field
- After entering username:
  - Save username to local storage
  - Transition to game screen

## Game Mechanics
- Display 10 randomly chosen words:
  - Words come from a specific constant list stored on the front end
  - Words should be stored as an array of 10 words, not a concatenated string
  - Each word is chosen randomly from this list
  - Add margin between each word when displaying to the screen
- Typing mechanics:
  - Space key acts as a delimiter to move to the next word
  - Space is not counted as part of the words being checked against
  - Pressing space takes user to the beginning of the next word
  - Cannot press space again until at least one letter of the next word is typed
  - Track every keystroke (key pressed and timestamp)
  - Show live WPM to user
  - Begin tracking words per minute as soon as user starts typing
  - Highlight which characters were typed correctly and incorrectly, even when user moves on to different word
  - Incorrect characters should build up and be displayed to the screen
  - Game ends when user either types last character of last word correctly, or if they press space at any point when typing the last word

## Score Calculation
- Words Per Minute (WPM):
  - Total number of characters in correctly typed words (including spaces)
  - Divided by 5
  - Normalized to 60 seconds
- Raw WPM:
  - Calculated like WPM but also includes incorrect words
- Accuracy (ACC):
  - Percentage of correctly pressed keys

## Post-Game Flow
- Upon completion of the test:
  - Display score to the user in the same page as the test
  - Reuse the live WPM counter but change its color to highlight it as the final result
  - Show breakdown of WPM, raw WPM, and accuracy
  - Prevent user from typing further into the input
  - Submit all data to backend (including WPM, keystrokes, and timings)
  - Update leaderboard on client side with the new score
- New game:
  - Input should always remain focused
  - As soon as the user starts typing again, a new game immediately begins

## Leaderboard
- Content:
  - Display username
  - Display highest WPM score ever achieved by that username
  - Show profile pictures next to each username
  - Each username appears only once (no duplicate entries)
- Organization:
  - Usernames sorted by their highest WPM score ever
  - Highlight first, second, and third place
  - Collapsible, default open. Should be an icon somewhere to hide it
- Updates:
  - Update on client side when user submits a game
  - Also ensure backend updates leaderboard when a score is submitted (create placeholder async function that gets called)

## Settings
- Include a settings icon
- Allow users to change their username
- Username changes only apply to new games submitted
- Changing username has no effect on existing leaderboard entries

## Data Handling
- Store username in local storage
- Submit the following data to backend after each game:
  - Username
  - Words per minute score
  - Raw words per minute score
  - Accuracy percentage
  - All keystroke data (key pressed and timestamp for each)
  - Words that were presented to the user

## User Experience
- Input field should always remain focused
- Immediate feedback on typing performance
- Seamless transition between games
- Minimal, sleek design
- Dark mode, but not high contrast
- Monospace font