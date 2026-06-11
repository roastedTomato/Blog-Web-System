# Usability Review

This document explains how usability was considered during the design and implementation of the blogging website. The review uses Nielsen's usability heuristics and PACMAD usability factors to connect interface choices with user needs.

## Nielsen's Usability Heuristics

### 1. Visibility of System Status

The website gives users feedback after important actions.

Examples:

- The registration page shows whether a username is available.
- The registration page shows whether the two password fields match.
- The like button changes between Like and Unlike.
- The article like count updates after a user clicks the like button.
- The profile page displays success or error messages after profile and password changes.

### 2. Match Between System and Real World

The interface follows patterns users would expect from a blogging website.

Examples:

- Articles are shown with a title, author, publish date, and like count.
- Full article pages show the article content first, then likes and comments.
- Replies appear directly below the comment they respond to.
- Delete actions use confirmation messages because deletion is a serious action.

### 3. User Control and Freedom

Users can control their own account and content.

Examples:

- Users can create, edit, and delete their own articles.
- Users can change, add, or remove an article image.
- Users can delete their own comments.
- Article authors can delete comments on their own articles.
- Users can update their profile, change their password, log out, or delete their account.

### 4. Consistency and Standards

The website uses consistent layouts and controls across pages.

Examples:

- Buttons use consistent styling and placement.
- Forms use similar label, input, and message layouts.
- Article sorting controls work similarly on the all-articles page and my-articles page.
- Article cards use consistent title, metadata, and action areas.

### 5. Error Prevention

The website prevents common user mistakes before data is submitted.

Examples:

- Username availability is checked before registration.
- Password confirmation is checked before registration submission.
- Image uploads only accept image files.
- Delete actions require confirmation.
- Server-side checks prevent users from editing or deleting articles they do not own.
- Server-side checks stop comment nesting after the allowed depth.

### 6. Recognition Rather Than Recall

Users do not need to remember hidden commands.

Examples:

- Main actions are shown as visible buttons.
- Sort options are shown in dropdown lists.
- Avatar choices are shown visually.
- Article actions such as View, Edit, and Delete are displayed beside each article.
- Comment reply and delete buttons are displayed near the comment they affect.

### 7. Flexibility and Efficiency of Use

Common tasks can be completed quickly.

Examples:

- Article sorting uses fetch, so the page does not need a full reload.
- Likes update immediately without a full page reload.
- Comments refresh after posting or deleting.
- Logged-in users can access their own articles from the article list.

### 8. Aesthetic and Minimalist Design

The interface focuses on the main task on each page.

Examples:

- Article pages prioritize reading content.
- Forms are grouped by purpose, such as account details, password changes, and article content.
- Article list pages show only key metadata needed for browsing.
- Buttons are placed near the content or action they affect.

### 9. Help Users Recognize, Diagnose, and Recover from Errors

The website uses clear error messages.

Examples:

- Login shows a clear invalid username or password message.
- Registration explains username and password problems.
- Fetch-based actions show an alert if an action fails.
- The profile page shows error messages when an update fails.

### 10. Help and Documentation

The interface uses labels and short instructions where they are needed.

Examples:

- Form fields have clear labels.
- Password fields show minimum length requirements.
- The image upload field explains accepted formats and maximum file size.
- The delete account area explains that account deletion also removes the user's content.

## PACMAD Usability Factors

### Effectiveness

Users can complete the main website tasks:

- Register and log in.
- Browse all articles.
- Sort article lists.
- Create, edit, and delete articles.
- Like articles.
- Post comments and replies.
- Edit or delete their account.

### Efficiency

The website reduces unnecessary page reloads and repeated work.

Examples:

- Sorting article lists uses fetch.
- Liking articles updates the count immediately.
- Comments reload automatically after posting or deleting.
- Profile and article forms keep related fields grouped together.

### Satisfaction

The interface uses clear layout, consistent styles, and feedback messages to make the website easier to use.

Examples:

- Buttons have consistent visual styling.
- Success and error messages are shown after important account actions.
- Responsive styling keeps the site usable on smaller screens.

### Learnability

The website follows familiar blog patterns, so new users can understand it quickly.

Examples:

- Article titles link to full articles.
- Comments appear below articles.
- Reply buttons appear beside comments.
- Account settings are grouped on the profile page.

### Memorability

Returning users can reuse the site without relearning it.

Examples:

- Navigation and action buttons remain in predictable places.
- Article cards use the same layout across article list pages.
- Forms use similar label and input patterns.

### Errors

The website prevents and handles common errors.

Examples:

- Duplicate usernames are checked before registration.
- Password mismatch is detected before registration submission.
- Unauthorized article edits and deletes are blocked on the server.
- Comment depth is checked on the server.
- Invalid image files are rejected by the upload handler.

### Cognitive Load

The website keeps each page focused on one main purpose.

Examples:

- The registration page only focuses on account creation.
- The article form focuses on title, image, and content.
- The article detail page separates article content, likes, and comments.
- Profile editing, password changing, and account deletion are separated into different sections.

## Usability Improvements Made During Development

- Added AJAX username availability checking.
- Added client-side password match validation.
- Added confirmation messages before delete actions.
- Added responsive layout rules for smaller screens.
- Added visible like count and liked/unliked status.
- Added clear article sorting controls.
- Added consistent button and form styling.
- Added server-side permission checks for protected actions.

## Possible Future Improvements

- Replace browser alerts with styled toast notifications.
- Add loading indicators while fetch requests are running.
- Add article search.
- Add pagination for long article lists.
- Improve keyboard accessibility for all controls.
- Add clearer empty-state messages for new users with no articles or comments.
