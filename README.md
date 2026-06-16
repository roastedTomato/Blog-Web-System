# Overview

In this project you will develop a blogging website using the skills you have learnt through the _Programming with Web Technology_ course. The project will also give you the opportunity to show how you can use online resources to discover and apply content not taught within the course.

Through the website, users can register for an account, which is needed to be able to post articles and to leave comments on others. When logged in, they have full control of the content they have authored: creating, updating and deleting their content and comments.

In this document you are given a list of requirements for the blogging system. You will also have the opportunity to customise aspects of the project, within the broader requirements.

The project will give you the opportunity to work on a larger-scale project than you've had experience with previously in the course. It will also allow you to showcase your individual software development skills.

## Web Interface Requirements

To form the core functionality of this application, the following requirements need to be met.


### General

1. Database connection details should be stored in an external configuration or `.env` file, and should not be included in the repository. Ensure a `.env.sample` file is present to indicate what values need to be supplied.

2. Make use of prepared statements when dealing with user-provided data,


### User accounts

1. Users must be able to create new accounts. Each new user should be able to choose a username (which must be unique) and a password. At minimum, a user's real name and date of birth should also be recorded, along with a brief description about themselves.

2. When selecting a username while creating an account, users should be immediately informed if the given username is already taken. Users should not have to submit a form to discover whether their chosen username is taken - you will have to investigate how to use AJAX/Fetch for this.

3. When selecting a password while creating an account, users should be presented with two password textboxes (e.g. "Choose password", and "re-enter password"). They must type the same password in each box in order to proceed. If the user didn't enter the same password in both textboxes, they should not be allowed to submit the form. Ideally, a visual notification message, such as ("passwords do not match"), should also be displayed.

4. Users' passwords should not be stored in plaintext - they should be appropriately hashed and salted. You will need to research hashing and salting; we can provide some materials that will help with this if required.

5. When creating an account, users must be able to choose from amongst a set of predefined "avatar" icons to represent themselves.

6. Once a user has created an account, they must be able to log in and log out.

7. Users must be able to edit any of their account information (including their username), and also be able to delete their account. If a user deletes their account, all of their articles and comments (see below) should also be deleted.


### Articles

1. Users must be able to browse a list of all articles, regardless of whether they are logged in or not. If logged in, they should additionally be able to browse a list of their own articles.

2. When viewing the lists of articles identified above, users should be able to sort article lists by article title, username, and date (but only one at a time). Users should be able to sort articles without the browser window having to reload. Aim to follow UI/UX conventions for user-friendly sorting functionality. You may want to investigate how it has been implemented in similar interfaces. It is expected that the usability of your sorting options is intuitive and shows good interface design.

3. When logged in, users must be able to add new articles, and edit or delete existing articles which they have authored.

4. When logged in, users must be able to like articles. An individual user should only be able to like the same article once. Once a user has liked an article, they should be able to see that they have already liked that article. The total number of likes from all users should be displayed somewhere so users can see how many likes each article has.

5. When creating or editing articles, users should be presented with a WYSIWYG (what you see is what you get) editor. The WYSIWYG editor should allow users to edit the formatting of an article without having to edit the HTML markup. There are a variety of styles of WYSIWYG editors and you may code your own from scratch or integrate an existing WYSIWYG library; there are a variety available online but you should research the range of options available. Investigate WYSIWYG options carefully as it is better to do a more robust implementation of a simple editor that fits with the style of your site and how articles should display than integrating a WYSIWYG editor that will allow a user to create content that will break your site or display incorrectly. The editor should (at minimum) allow users to:
   + Add headings (or titles and subtitles)
   + Make text bold, italic and underline
   + Add bulleted and numbered lists

6. When creating new articles, users must be able to add an image to that article (if they choose - whether a user adds an image is up to them). When editing articles, users must be able to change, add, or remove this image. It is not compulsory to design it so users can add more than one image or add images inline with text. Implementing file uploads for multiple images can add complexity, so it is suggested that you consider the implementation of image uploads carefully so that uploaded images of varying sizes will display appropriately; you may even want to consider having some form of resizing or validation to ensure images display well.


### Comments

1. When logged in, users must be able to comment on articles. When viewing articles, comments associated with that article should also be viewable.

2. Comments must show the username of the commenter, and the timer & date the comment was made, in addition to the comment itself.

3. Commenters should be able to delete their own comments; article authors should be able to delete any comments on their own articles.

4. Users should be able to comment on comments up to two levels of nesting (i.e. comments on comments on comments). Any comment should be able to be replied to up to two levels of nesting. Comments should be listed chronologically below the article or comment they are replying to. Comments that are replies to comments should be indented and directly below the comment they are in reply to. An example of what two levels of nesting would look like is included below.
   + comment...
   + comment...
     + comment...
     + comment...
       + comment...
       + comment...
     + comment...
   + comment...
     + comment...
     + comment...

5. Users should be able to show or hide comments for articles they're reading.


### Usability

1. The website must have a consistent look and feel, and must be responsive. The interface should respond well to the resizing of the screen and be usable throughout the range of common screen-widths. Consider how you can have a structured and systematic approach to creating CSS.

2. The website must be user-friendly and have good usability. When adding the features, consider how such features have been implemented in other websites you've used before. What did you like about those websites? What could use improvement? It is suggested you investigate usability and review resources such as Neilsen's heuristics and / or PACMAD.

3. It is suggested that you have a structured approach to interface design and consider creating "wireframe" outlines of your pages so you can plan what elements need to be on each page and how they are positioned. You may wish to create hand-drawn wireframe designs or investigate using a tool like Figma.

