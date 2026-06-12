# Wireframes

This document shows the planned page structure for the blogging website. The wireframes were used to decide what content and controls each page needed before implementing the final Handlebars views and CSS.

## Home Page

```text
+------------------------------------------------------+
|                    Blog Platform                     |
+------------------------------------------------------+
| No Home button is shown on the home page             |
+------------------------------------------------------+
| Welcome message                                      |
| Short introduction about the website                 |
+------------------------------------------------------+
| [Browse Articles] [Create Article / Profile]         |
+------------------------------------------------------+
```

## Register Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
|                    User Registration                 |
+------------------------------------------------------+
| Username *                                           |
| [ username input                                  ]   |
| Username availability message                        |
+------------------------------------------------------+
| Password *                                           |
| [ password input                                  ]   |
| Confirm Password *                                   |
| [ confirm password input                          ]   |
| Password match message                               |
+------------------------------------------------------+
| Full Name *                                          |
| Birthday *                                           |
| Biography *                                          |
+------------------------------------------------------+
| Choose Avatar                                        |
| (Avatar) (Avatar) (Avatar) (Avatar)                  |
+------------------------------------------------------+
| [ Register ]                                         |
| Already have an account? Login here                  |
+------------------------------------------------------+
```

## Login Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
|                       User Login                     |
+------------------------------------------------------+
| Username                                             |
| [ username input                                  ]   |
+------------------------------------------------------+
| Password                                             |
| [ password input                                  ]   |
+------------------------------------------------------+
| [ Login ]                                            |
| Do not have an account? Register here                |
+------------------------------------------------------+
```

## Article List Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
| All Articles                          [My Articles]  |
+------------------------------------------------------+
| Sort by: [Date v]    Order: [Descending v]           |
+------------------------------------------------------+
| Avatar | Article Title                               |
|        | Author - Date - Likes                       |
|        |                              [Read more]     |
+------------------------------------------------------+
| Avatar | Article Title                               |
|        | Author - Date - Likes                       |
|        |                              [Read more]     |
+------------------------------------------------------+
```

## My Articles Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
| My Articles          [All Articles] [Create Article] |
+------------------------------------------------------+
| Sort by: [Date v]    Order: [Descending v]           |
+------------------------------------------------------+
| Avatar | Article Title                               |
|        | Date - Likes                                |
|        |              [View] [Edit] [Delete]          |
+------------------------------------------------------+
| Avatar | Article Title                               |
|        | Date - Likes                                |
|        |              [View] [Edit] [Delete]          |
+------------------------------------------------------+
```

## Create / Edit Article Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
| Create New Article / Edit Article        [Cancel]    |
+------------------------------------------------------+
| Title *                                              |
| [ title input                                     ]   |
+------------------------------------------------------+
| Article Image                                        |
| [ file upload ]                                      |
| Current image preview and remove button when editing |
+------------------------------------------------------+
| Content *                                            |
| +--------------------------------------------------+ |
| | WYSIWYG toolbar                                  | |
| +--------------------------------------------------+ |
| | Article editor area                              | |
| |                                                  | |
| +--------------------------------------------------+ |
+------------------------------------------------------+
| [ Publish Article / Update Article ]                 |
+------------------------------------------------------+
```

## Article Detail Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
| <- Back to Articles                                  |
+------------------------------------------------------+
| Author Avatar | Author Name | Publish Date           |
+------------------------------------------------------+
| Article Title                                        |
+------------------------------------------------------+
| Article Image                                        |
+------------------------------------------------------+
| Article Content                                      |
|                                                      |
+------------------------------------------------------+
| Likes count                         [Like / Unlike]  |
+------------------------------------------------------+
| Comments                             [Hide comments] |
| [ comment textbox                                ]   |
| [ Post Comment ]                                     |
+------------------------------------------------------+
| Comment                                              |
|   Reply                                              |
|     Reply                                            |
+------------------------------------------------------+
| [Edit Article] shown only to the article author      |
+------------------------------------------------------+
```

## Profile Page

```text
+------------------------------------------------------+
| [Home]                                               |
+------------------------------------------------------+
|                      Edit Profile                    |
+------------------------------------------------------+
| Username *                                           |
| Full Name                                            |
| Birthday                                             |
| Biography                                            |
+------------------------------------------------------+
| Choose Avatar                                        |
| (Avatar) (Avatar) (Avatar) (Avatar)                  |
+------------------------------------------------------+
| [ Save changes ]                                     |
+------------------------------------------------------+
| Change Password                                      |
| Current Password                                     |
| New Password                                         |
| Confirm New Password                                 |
| [ Change Password ]                                  |
+------------------------------------------------------+
| [Logout]                                             |
+------------------------------------------------------+
| Delete Account                                       |
| Warning text                                         |
| [ Delete Account ]                                   |
+------------------------------------------------------+
```

## Responsive Design Plan

The same page structures are used on desktop and mobile, but the layout changes at smaller screen widths:

- Wide desktop screens use horizontal layouts for headers, article rows, and action buttons.
- Tablet and mobile screens stack headers, controls, article actions, and comment controls vertically.
- Forms use full-width inputs on small screens.
- Article cards and comment boxes avoid horizontal scrolling.
- Nested comments reduce indentation on small screens so the text stays readable.
- The Home navigation button is fixed near the top of non-home pages at roughly 10% of the page width.

## Design Notes

- Each page has a clear heading near the top.
- Primary actions are placed near the heading or near the content they affect.
- The home page does not show a Home button because the user is already there.
- Form fields are grouped by purpose, such as account details, password changes, and article content.
- Article pages show content first, then social actions such as likes and comments.
- Repeated elements, such as article rows, comments, Home, Register, Login, Edit Profile, Create, and Cancel actions, use consistent spacing and button styles.
- The CSS is organized by shared global styles plus page-specific styles.
