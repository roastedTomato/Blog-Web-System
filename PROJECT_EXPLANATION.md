# Project Feature Explanation and Design Questions

This document explains the main features of the blogging website based on the README requirements. It is written as preparation for a project demonstration or code explanation. Each section includes a possible question, the related database tables, front-end behavior, back-end routes and DAO methods, and the final result shown to the user.

## 1. Overall System Design

### Question: How is the project structured?

The project uses an Express.js MVC-style structure with separate responsibilities for routing, database access, views, and static files.

The main structure is:

- `app.js`: sets up Express, Handlebars, sessions, middleware, static files, and route modules.
- `routes/`: contains route handlers for user, article, comment, and home page requests.
- `modules/`: contains DAO modules that communicate with the database.
- `views/`: contains Handlebars templates for pages.
- `public/`: contains CSS, uploaded article images, and avatar images.
- `init-db.sql`: defines the database schema and sample data.

The system does not use traditional JavaScript classes. Instead, it uses modules as logical classes. For example, `articles-dao.js` acts as the article data access module, and `user-dao.js` acts as the user data access module.

The general request flow is:

1. The user interacts with the front-end by opening a page, submitting a form, clicking a button, or selecting an option.
2. The browser sends an HTTP request to an Express route.
3. The route validates the request and checks the session if login is required.
4. The route calls a DAO method.
5. The DAO reads from or writes to the database using prepared statements.
6. The route returns either a rendered Handlebars page or JSON data.
7. The front-end displays the result or updates part of the page dynamically.

## 2. Database Design

### Question: What data is stored in the database?

The database stores users, avatars, articles, comments, and likes.

Main tables:

- `users`: stores account data such as username, password hash, full name, birthday, biography, avatar path, and timestamps.
- `avatars`: stores predefined avatar options that users can choose from.
- `articles`: stores article title, content, optional image path, author id, and timestamps.
- `comments`: stores article comments, including nested replies through `parent_id`.
- `likes`: stores which user liked which article.

Important relationships:

- `articles.author_id` references `users.id`.
- `comments.user_id` references `users.id`.
- `comments.article_id` references `articles.id`.
- `comments.parent_id` references `comments.id`.
- `likes.user_id` references `users.id`.
- `likes.article_id` references `articles.id`.

The database uses foreign keys with `ON DELETE CASCADE`. This means that if a user is deleted, their articles, comments, and likes are also removed automatically. If an article is deleted, its comments and likes are also removed.

The `likes` table uses a composite primary key:

```text
PRIMARY KEY (user_id, article_id)
```

This prevents the same user from liking the same article more than once.

## 3. User Registration

### Question: How does user registration work?

User registration allows a new user to create an account with a unique username, password, full name, birthday, biography, and avatar.

Database:

- User data is stored in the `users` table.
- Avatar options are loaded from the `avatars` table.
- Passwords are not stored in plain text. They are hashed using `bcryptjs` before being inserted into the database.

Front-end:

- The registration page is rendered by `views/users/register.handlebars`.
- The form asks for username, password, confirm password, full name, birthday, biography, and avatar.
- The username field uses `fetch()` to check username availability while the user is typing.
- The password fields are validated on the front-end to make sure the password is long enough and both password inputs match.

Back-end:

- `GET /user/register` loads active avatars and renders the registration page.
- `GET /user/check-username?username=...` checks whether a username already exists.
- `POST /user/register` handles the final registration form submission.

Related methods:

- `userDAO.getActiveAvatars()`: retrieves avatar options.
- `userDAO.isUsernameTaken(username)`: checks username uniqueness.
- `userDAO.create(userData)`: hashes the password and creates the user.
- `userDAO.findById(userId)`: loads the new user after creation.
- `userDAO.buildSessionObject(user)`: creates a safe session user object without the password hash.

Flow:

1. The browser loads the registration page.
2. The back-end reads avatar options from the database and sends them to the Handlebars view.
3. The user enters account details and selects an avatar.
4. While the user types a username, the front-end sends an AJAX request to `/user/check-username`.
5. The back-end checks the database and returns whether the username is available.
6. When the form is submitted, the back-end validates required fields, password length, password confirmation, and username uniqueness.
7. The password is hashed with bcrypt.
8. The user record is inserted into the `users` table.
9. The back-end creates a session for the new user.
10. The browser redirects to the home page as a logged-in user.

## 4. Login and Logout

### Question: How does login and logout work?

Login allows an existing user to start a session. Logout destroys the session.

Database:

- The `users` table stores the username and hashed password.

Front-end:

- The login page displays a username and password form.
- If login fails, the page shows an error message.
- When logged in, the navigation can show user-specific options.

Back-end:

- `GET /user/login` renders the login page.
- `POST /user/login` verifies credentials.
- `GET /user/logout` destroys the session and clears the session cookie.

Related methods:

- `userDAO.findByUsername(username)`: finds the user record.
- `userDAO.verifyPassword(inputPassword, password_hash)`: compares the entered password with the stored bcrypt hash.
- `userDAO.buildSessionObject(user)`: stores only safe user details in the session.

Flow:

1. The user enters a username and password.
2. The front-end submits the form to the back-end.
3. The back-end finds the user by username.
4. If the user exists, the back-end compares the entered password with the hashed password in the database.
5. If the password is correct, the back-end stores the user id, username, full name, and avatar URL in the session.
6. The browser redirects to the home page.
7. When the user logs out, the session is destroyed and the cookie is cleared.

## 5. Profile Editing, Password Change, and Account Deletion

### Question: How can users edit or delete their account?

Logged-in users can edit their profile information, change their password, and delete their account.

Database:

- Profile data is stored in the `users` table.
- Avatar choices are read from the `avatars` table.
- If the user deletes their account, database cascade rules remove related articles, comments, and likes.

Front-end:

- The profile page shows the current user data.
- The user can update username, full name, birthday, bio, and avatar.
- The user can submit a password change form.
- The user can delete their account.

Back-end:

- `GET /user/profile` renders the profile page.
- `POST /user/profile` updates profile information.
- `POST /user/change-password` changes the password.
- `POST /user/delete` deletes the account.

Related methods:

- `userDAO.findById(userId)`: loads the current user.
- `userDAO.getActiveAvatars()`: loads avatar options.
- `userDAO.markSelectedAvatar(avatars, userAvatarUrl)`: marks the current avatar.
- `userDAO.isUsernameTaken(username, excludeUserId)`: prevents duplicate usernames while allowing the user to keep their own username.
- `userDAO.updateProfile(userId, updateData)`: updates profile fields.
- `userDAO.changePassword(...)`: validates and updates password hash.
- `userDAO.deleteUser(userId)`: deletes the user.

Flow:

1. The user opens the profile page.
2. The back-end checks whether the user is logged in using `requireLogin`.
3. The back-end loads the user and avatar list from the database.
4. The front-end displays the form with the current data.
5. If the user updates their profile, the back-end validates username uniqueness and updates the database.
6. The session user object is refreshed so the navigation and page data stay correct.
7. If the user changes password, the back-end verifies the current password first, then hashes and saves the new password.
8. If the user deletes the account, the user row is removed and related data is removed by cascade rules.
9. The session is destroyed and the browser returns to the home page.

## 6. Displaying All Articles

### Question: How are all articles displayed?

All users, including guests, can view the list of all articles.

Database:

- Article data is stored in the `articles` table.
- Author data is stored in the `users` table.
- Like totals are calculated from the `likes` table.

Front-end:

- The article list page is rendered by `views/articles/list.handlebars`.
- Each article item shows the title, author avatar, author name, publish date, and like count.
- The title and "Read more" link take the user to the full article page.

Back-end:

- `GET /article` loads all articles.
- If the request includes `json=1`, the route returns JSON instead of rendering a full page.

Related methods:

- `articleDAO.getAllArticles(sortBy, order)`: retrieves articles with author information and like counts.

Flow:

1. The user opens `/article`.
2. The back-end receives a GET request.
3. The route reads optional sorting values from the query string.
4. The route calls `articleDAO.getAllArticles(sortBy, order)`.
5. The DAO joins `articles` with `users`, left joins `likes`, counts likes, groups by article id, and orders the result.
6. The back-end renders the article list page with the article data.
7. The front-end displays the articles as a vertical list.

## 7. Displaying My Articles

### Question: How does the My Articles page work?

The My Articles page shows only the articles created by the logged-in user.

Database:

- The `articles` table stores each article's `author_id`.
- This `author_id` is compared with the logged-in user's session id.

Front-end:

- Logged-in users can click "My Articles" from the article list page.
- The page displays only their own articles and provides actions such as edit and delete.

Back-end:

- `GET /article/my` handles the My Articles page.
- The route redirects guests to `/user/login`.

Related methods:

- `articleDAO.getArticlesByUserId(userId, sortBy, order)`: retrieves articles belonging to one user.

Flow:

1. The user clicks My Articles.
2. The back-end checks whether `req.session.user` exists.
3. If the user is not logged in, the browser is redirected to the login page.
4. If the user is logged in, the back-end calls `getArticlesByUserId()` with the session user id.
5. The DAO queries the database for articles where `author_id = userId`.
6. The back-end renders the My Articles page.
7. The front-end displays the user's own articles and management actions.

## 8. Article Sorting Without Page Reload

### Question: How does article sorting work without reloading the page?

Article sorting allows users to sort by title, author username, or date, in ascending or descending order.

Database:

- Sorting uses fields from the `articles` and `users` tables.
- Valid sort fields are mapped safely in the DAO:
  - `title` maps to `a.title`
  - `username` maps to `u.username`
  - `date` maps to `a.created_at`

Front-end:

- The article list page has two dropdown controls: `sortBy` and `sortOrder`.
- When the user changes either dropdown, JavaScript calls `loadArticles()`.
- `loadArticles()` sends a request like:

```text
/article?sort=title&order=ASC&json=1
```

Back-end:

- `GET /article` receives `sort`, `order`, and `json`.
- The route calls `articleDAO.getAllArticles(sortBy, order)`.
- If `json=1` is present, the route returns `{ articles }` as JSON.

Related methods:

- `loadArticles()` in `list.handlebars`.
- `requestJson()` in `list.handlebars`.
- `articleDAO.getAllArticles(sortBy, order)`.
- `articleDAO.getArticlesByUserId(userId, sortBy, order)` for My Articles.

Flow:

1. The user selects a sort option on the front-end.
2. The front-end reads the selected values from the dropdowns.
3. The front-end sends a GET request with query parameters.
4. The back-end validates the sort field using a whitelist.
5. The DAO queries the database in the selected order.
6. The back-end returns JSON data.
7. The front-end loops through the returned articles and rebuilds the article list HTML.
8. The page updates without a full browser reload.

## 9. Creating Articles

### Question: How does creating an article work?

Logged-in users can create articles with a title, formatted content, and an optional image.

Database:

- Article title, content, image path, author id, and creation time are stored in the `articles` table.
- The image file itself is stored in `public/uploads`.
- The database stores only the image URL path.

Front-end:

- The create article page is rendered by `views/articles/create.handlebars`.
- The page uses Quill as a WYSIWYG editor.
- Users can add headings, bold, italic, underline, ordered lists, and bullet lists.
- The form uses `FormData` so it can send text fields and image files together.

Back-end:

- `GET /article/create` renders the article creation form.
- `POST /article` creates the article.
- `multer` handles image uploads.

Related methods:

- `articleDAO.createArticle(title, content, imageUrl, authorId)`.

Flow:

1. The logged-in user opens the create article page.
2. The front-end shows a title input, image input, and Quill editor.
3. When the form is submitted, JavaScript copies the Quill HTML content into a hidden input.
4. The front-end sends the form using `fetch()` with `FormData`.
5. The back-end checks that the user is logged in.
6. `multer` validates that the uploaded file is an image and saves it to `public/uploads`.
7. The route validates that title and content are present.
8. The route calls `articleDAO.createArticle()`.
9. The DAO inserts the new article into the database and returns the new article id.
10. The back-end returns JSON success.
11. The front-end redirects the user to `/article/my`.

## 10. Editing Articles

### Question: How does editing an article work?

Only the author of an article can edit it.

Database:

- The `articles` table stores `author_id`.
- The back-end uses this field to check ownership.
- Updated title, content, image URL, and update time are stored in the database.

Front-end:

- The edit page reuses `views/articles/create.handlebars`.
- Existing article data is loaded into the form.
- Existing content is loaded into the Quill editor.
- The user can keep the current image, upload a replacement image, or remove the image.

Back-end:

- `GET /article/:id/edit` loads the edit page after ownership validation.
- `PUT /article/:id` updates the article after ownership validation.

Related methods:

- `articleDAO.getArticleById(articleId)`.
- `articleDAO.updateArticle(articleId, title, content, imageUrl)`.

Flow:

1. The user clicks Edit on an article.
2. The back-end loads the article by id.
3. The route checks whether `article.author_id` matches `req.session.user.id`.
4. If the user is not the author, the request is rejected.
5. If the user is the author, the edit form is rendered.
6. On submit, the front-end sends a PUT request with `FormData`.
7. The back-end validates ownership again for security.
8. The back-end decides whether to keep, replace, or remove the image.
9. The DAO updates the article in the database.
10. The front-end redirects to My Articles after success.

## 11. Deleting Articles

### Question: How does deleting an article work?

Only the author of an article can delete it.

Database:

- The `articles` table stores the article and its `author_id`.
- Related comments and likes are deleted automatically because of cascade rules.

Front-end:

- The user clicks a delete action from their article management page.
- The front-end sends a DELETE request to the back-end.

Back-end:

- `DELETE /article/:id` deletes an article.
- The route checks login and ownership before deletion.

Related methods:

- `articleDAO.getArticleById(articleId)`.
- `articleDAO.deleteArticle(articleId)`.

Flow:

1. The user requests to delete an article.
2. The back-end checks that the user is logged in.
3. The back-end loads the article from the database.
4. The route compares the article's `author_id` with the session user id.
5. If the user owns the article, the DAO deletes it.
6. The database also removes related comments and likes through cascade rules.
7. The back-end returns JSON success.
8. The front-end updates the page or redirects the user.

## 12. Viewing a Full Article

### Question: How is a single full article displayed?

The full article page shows the article content, author details, image, likes, and comments.

Database:

- Article data is stored in `articles`.
- Author details are stored in `users`.
- Like count is calculated from `likes`.

Front-end:

- The full article page is rendered by `views/articles/article.handlebars`.
- It displays the author avatar, author name, publish date, title, optional image, formatted HTML content, like button, and comments section.

Back-end:

- `GET /article/:id` loads one article by id.

Related methods:

- `articleDAO.getArticleById(articleId)`.
- `likesDAO.existingLike(userId, articleId)`.

Flow:

1. The user clicks an article title or "Read more".
2. The browser requests `/article/:id`.
3. The back-end loads the article and its author data from the database.
4. The DAO also counts total likes.
5. If the user is logged in, the route checks whether the user has already liked the article.
6. The back-end renders the article page.
7. The front-end displays the full article and sets the like button to "Like" or "Unlike" depending on the current user state.

## 13. Liking and Unliking Articles

### Question: How does the like function work?

Logged-in users can like an article once. Clicking again removes the like.

Database:

- Likes are stored in the `likes` table.
- Each row contains `user_id` and `article_id`.
- The composite primary key prevents duplicate likes.

Front-end:

- On the article page, logged-in users see a Like or Unlike button.
- When clicked, JavaScript calls `toggleLike(articleId)`.
- The page updates the button and like count without reloading.

Back-end:

- `POST /article/:id/like` toggles the like.

Related methods:

- `likesDAO.existingLike(userId, articleId)`.
- `likesDAO.addLike(userId, articleId)`.
- `likesDAO.unlike(userId, articleId)`.
- `likesDAO.likeCount(articleId)`.

Flow:

1. The user clicks the like button.
2. The front-end sends a POST request to `/article/:id/like`.
3. The back-end checks that the user is logged in.
4. The back-end checks whether a like already exists for this user and article.
5. If a like exists, the DAO removes it.
6. If no like exists, the DAO inserts a new like record.
7. The DAO counts the updated total likes.
8. The back-end returns JSON containing `liked` and `likeCount`.
9. The front-end changes the button text and updates the like count immediately.

## 14. Displaying Comments

### Question: How are comments displayed for an article?

Comments are loaded dynamically on the article page and rendered below the article.

Database:

- Comments are stored in the `comments` table.
- Each comment has `article_id`, `user_id`, `parent_id`, `content`, and `created_at`.
- `parent_id` is `null` for top-level comments.
- `parent_id` contains another comment id for replies.

Front-end:

- When the article page loads, JavaScript calls `loadComments()`.
- The front-end receives all comments for the article as JSON.
- The `renderComments(comments, parentId, level)` function recursively places replies under their parent comments.
- Comments show commenter name, avatar, date/time, and content.

Back-end:

- `GET /comment/article/:articleId` returns all comments for one article.

Related methods:

- `commentDAO.getCommentsByArticleId(articleId)`.
- `renderComments(comments, parentId, level)` in the article page.

Flow:

1. The article page loads.
2. The front-end sends a GET request to `/comment/article/:articleId`.
3. The back-end queries comments for that article.
4. The DAO joins comments with user information.
5. Comments are ordered chronologically by `created_at`.
6. The back-end returns JSON.
7. The front-end recursively builds nested comment HTML.
8. The comments appear below the article.

## 15. Posting Comments and Replies

### Question: How do users post comments and replies?

Logged-in users can post top-level comments and replies. Replies can be nested up to two levels.

Database:

- Top-level comments are stored with `parent_id = null`.
- Replies are stored with `parent_id` equal to the id of the comment they reply to.

Front-end:

- A logged-in user sees a comment text box below the article.
- Each comment can show a Reply button if it is not already at the maximum nesting level.
- `submitComment()` sends a top-level comment.
- `submitReply(parentId)` sends a reply to an existing comment.

Back-end:

- `POST /comment` creates a comment or reply.
- The route checks login, validates content and article id, and checks nesting depth.

Related methods:

- `commentDAO.createComment(content, userId, articleId, parentId)`.
- `commentDAO.getCommentDepth(commentId)`.

Flow:

1. The user writes a comment or reply.
2. The front-end sends a POST request to `/comment`.
3. For a top-level comment, the request includes `content` and `articleId`.
4. For a reply, the request also includes `parentId`.
5. The back-end checks that the user is logged in.
6. The back-end validates that content and article id exist.
7. If it is a reply, the back-end checks the parent comment depth.
8. If the reply would exceed the allowed nesting depth, the request is rejected.
9. If valid, the DAO inserts the comment into the database and returns the new comment id.
10. The front-end clears the text box and reloads the comments.
11. The new comment or reply appears in the correct position.

## 16. Deleting Comments

### Question: How does deleting comments work?

Comment deletion is permission controlled.

Database:

- Each comment has a `user_id`.
- Each article has an `author_id`.
- A user can delete a comment if they wrote the comment or if they wrote the article that the comment belongs to.

Front-end:

- The delete button is shown only when the current user is allowed to delete the comment.
- The front-end still sends the request to the server, because permission must also be checked on the back-end.

Back-end:

- `DELETE /comment/:id` deletes a comment.

Related methods:

- `commentDAO.deleteComment(commentId, userId)`.

Flow:

1. The user clicks Delete on a comment.
2. The front-end asks for confirmation.
3. The front-end sends a DELETE request to `/comment/:id`.
4. The back-end checks that the user is logged in.
5. The DAO loads the comment and its related article author.
6. The DAO checks whether the current user is the comment author or the article author.
7. If the user has permission, the comment is deleted.
8. If the user does not have permission, the request is rejected.
9. The front-end reloads the comments so the deleted comment disappears.

## 17. Showing and Hiding Comments

### Question: How can users show or hide comments?

The article page allows users to hide or show the comments section.

Front-end:

- The article page has a "Hide comments" / "Show comments" button.
- The function `toggleComments()` changes the display style of the comments panel.

Back-end:

- No database update is needed.
- This feature is handled entirely on the front-end because it only changes the page display.

Flow:

1. The user clicks the comments toggle button.
2. JavaScript checks whether the comments panel is currently hidden.
3. If hidden, it shows the panel and changes the button text to "Hide comments".
4. If visible, it hides the panel and changes the button text to "Show comments".

## 18. WYSIWYG Editor

### Question: How does the WYSIWYG editor work?

The WYSIWYG editor allows users to format article content without writing HTML manually.

Database:

- The formatted article content is stored in the `content` field of the `articles` table.
- The content is stored as HTML generated by the editor.

Front-end:

- The create/edit article page uses Quill.
- The toolbar supports headings, bold, italic, underline, ordered lists, bullet lists, and clean formatting.
- Before submitting the form, JavaScript copies `quill.root.innerHTML` into a hidden input named `content`.

Back-end:

- The route receives the content field as part of the form data.
- The content is saved in the database through the article DAO.

Flow:

1. The user writes and formats content in the Quill editor.
2. On form submission, the front-end copies the editor HTML into a hidden input.
3. The front-end sends the form data to the back-end.
4. The back-end validates and saves the content.
5. When the article is displayed, the Handlebars page renders the saved HTML content in the article body.

## 19. Image Uploads

### Question: How are article images uploaded, changed, or removed?

Articles can have one optional image.

Database:

- The image file is not stored directly in the database.
- The image file is stored in `public/uploads`.
- The database stores the file path in `articles.image_url`.

Front-end:

- The create/edit article form includes a file input with `accept="image/*"`.
- In edit mode, the current image is displayed.
- The user can upload a new image or remove the current image.

Back-end:

- `multer` handles file uploads.
- The upload folder is `public/uploads`.
- The file size limit is 5 MB.
- The file filter only allows image MIME types.
- Uploaded filenames are made unique using a timestamp and cleaned base filename.

Flow:

1. The user selects an image in the article form.
2. The front-end sends the form using `FormData`.
3. `multer` checks the file type and file size.
4. If valid, the file is saved into `public/uploads`.
5. The route creates an image URL such as `/uploads/example.png`.
6. The DAO stores that URL in the article record.
7. When the article is displayed, the front-end uses the URL in an image tag.
8. If the user removes the image in edit mode, the front-end sends `removeImage=true`, and the back-end sets `image_url` to `null`.

## 20. Security and Validation

### Question: What security and validation decisions are used?

The project includes several important security and validation decisions.

Database and DAO layer:

- Prepared statements are used for user-provided values.
- Passwords are hashed with bcrypt before storage.
- Foreign keys maintain relationships between users, articles, comments, and likes.
- Cascade deletion keeps related records consistent.
- The likes table uses a composite primary key to prevent duplicate likes.

Back-end:

- Session checks protect routes that require login.
- Article edit and delete routes check ownership on the server.
- Comment deletion checks whether the user is the comment author or article author.
- Reply nesting depth is checked on the server.
- Uploaded files are limited to images and 5 MB.
- Sort fields are checked against a whitelist before being used in SQL.

Front-end:

- Password confirmation is checked before registration form submission.
- Username availability is checked with AJAX.
- Empty comments and replies are rejected before sending.
- Comment content is escaped before being inserted into generated HTML.

## 21. Usability and Interface Design

### Question: What usability choices were made?

The interface is designed to be consistent, responsive, and easy to understand.

Main usability decisions:

- The same visual style is shared through CSS files in `public/css`.
- Pages use clear form labels, buttons, and error messages.
- Sorting controls are placed above article lists where users expect them.
- AJAX sorting updates the article list without a full page reload.
- Like actions update immediately after the user clicks the button.
- Comments are placed directly below the article.
- Replies are indented under their parent comments.
- The comment section can be hidden when users want to focus on the article.
- Article author actions are shown only to the author.
- Users who are not logged in are guided to login before liking or commenting.
- The layout includes responsive CSS for smaller screen widths.

## 22. Design Patterns and Code Quality

### Question: What design patterns or code organization choices are used?

The project uses modular routing and the DAO pattern.

DAO pattern:

- Database logic is separated into modules such as `user-dao.js`, `articles-dao.js`, `comments-dao.js`, and `likes.dao.js`.
- Routes do not write SQL directly for most operations.
- This makes the project easier to maintain because database operations are grouped by feature.

Modular routing:

- User routes are in `routes/user-routes.js`.
- Article routes are in `routes/article-routes.js`.
- Comment routes are in `routes/comment-routes.js`.
- Home routes are in `routes/index-routes.js`.

View separation:

- Handlebars files are used for page templates.
- CSS files are separated by feature area.
- Static images and uploaded files are stored in the public folder.

Why this design is useful:

- Each module has a clear responsibility.
- Code is easier to test and debug.
- Future features, such as search or pagination, can be added without rewriting the whole application.
- The same DAO methods can be reused by multiple routes, such as article list and My Articles sorting.

## 23. Prepared Demo Questions Summary

These are short questions that may be asked during the demonstration:

1. How are all articles loaded and displayed?
2. How does article sorting work without reloading the page?
3. How does the My Articles page know which articles belong to the current user?
4. How does the system prevent users from editing other users' articles?
5. How does the like button prevent duplicate likes?
6. How are comments connected to articles?
7. How are replies connected to parent comments?
8. How does the system limit comments to two levels of nesting?
9. How does comment deletion permission work?
10. How does the registration page check username availability immediately?
11. How are passwords stored securely?
12. How does the WYSIWYG editor save formatted article content?
13. How are article images uploaded and displayed?
14. What happens to articles and comments when a user deletes their account?
15. What design pattern is used for database operations?

## 24. General Answer Template

For most feature questions, the answer can follow this structure:

```text
For consistency, I used a shared visual style across the website. The pages use similar colors, spacing, button styles, form styles, and layout patterns, so users can recognize that they are using the same system on every page.

For CSS organization, I separated the styles by page or feature area. For example, general styles are placed in the main site CSS file, while article, login, register, profile, and home page styles are stored in their own CSS files. This makes the CSS easier to maintain because each file has a clear purpose.

For responsiveness, I used flexible layouts, percentage widths, max-width containers, and media queries. This allows the pages to adjust to different screen sizes. On smaller screens, elements such as article cards, forms, buttons, and comment sections become easier to read and interact with.

For usability, I tried to make the main user actions clear and easy to find. For example, article sorting controls are placed above the article list, article titles link to the full article page, login/register buttons are visible for guests, and edit/delete actions are only shown when they are relevant to the logged-in user.

I also used immediate feedback where possible. For example, the registration page checks username availability without requiring the user to submit the whole form. Password confirmation is checked before submission. The like button updates immediately after being clicked, and article sorting works without a full page reload.

I considered usability principles such as visibility of system status, consistency, error prevention, and user control. The interface shows feedback messages, prevents invalid form submissions, hides actions that users cannot perform, and allows users to show or hide comments depending on what they want to focus on.

Overall, the goal was to make the website clear, consistent, responsive, and easy to use across common screen sizes.
更短一点的答辩版：
I designed the website with consistency and responsiveness in mind. The pages share similar colors, spacing, buttons, forms, and layout patterns, so the user experience feels consistent across the whole site.

The CSS is organized by purpose. Common styles are placed in the main CSS file, while page-specific styles are separated into files such as article, login, register, profile, and home CSS. This makes the styling easier to understand and maintain.

To support different screen sizes, I used responsive CSS techniques such as flexible containers, max-width layouts, and media queries. This helps article lists, forms, buttons, and comments remain usable on both desktop and smaller screens.

For usability, I focused on clear actions and immediate feedback. Users can easily find sorting controls, login/register links, article actions, like buttons, and comment actions. The system also gives feedback for username availability, password matching, likes, sorting, and form errors.

I followed usability ideas such as consistency, visibility of system status, error prevention, and user control. For example, users can hide or show comments, invalid forms are prevented before submission, and actions like edit or delete are only shown when the user has permission.
```

