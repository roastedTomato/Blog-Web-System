
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS avatars;
DROP TABLE IF EXISTS users;


-- 1. users table - User information
CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'User ID',
       username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username',
       password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',
       full_name VARCHAR(100) DEFAULT NULL COMMENT 'Full name',
       birthday DATE DEFAULT NULL COMMENT 'Birthday',
       bio TEXT DEFAULT NULL COMMENT 'Biography',
       avatar_url VARCHAR(255) DEFAULT '/public/avatarImages/default.png' COMMENT 'Avatar URL',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
       INDEX idx_username (username)
);

-- 2. avatars table - Preset avatar list
CREATE TABLE avatars (
     id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Avatar ID',
     name VARCHAR(100) NOT NULL COMMENT 'Avatar name',
     icon_path VARCHAR(255) NOT NULL COMMENT 'Icon path',
     display_order INT DEFAULT 0 COMMENT 'Display order',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time'
);

-- 3. articles table - Articles
CREATE TABLE articles (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Article ID',
      title VARCHAR(255) NOT NULL COMMENT 'Title',
      content TEXT NOT NULL COMMENT 'Content',
      image_url VARCHAR(255) DEFAULT NULL COMMENT 'Image URL',
      author_id INT NOT NULL COMMENT 'Author ID',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_author (author_id),
      INDEX idx_created (created_at)
);

-- 4. comments table - Comments (supports nesting)
CREATE TABLE comments
(
    id         INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Comment ID',
    content    TEXT NOT NULL COMMENT 'Comment content',
    user_id    INT  NOT NULL COMMENT 'User ID',
    article_id INT  NOT NULL COMMENT 'Article ID',
    parent_id  INT       DEFAULT NULL COMMENT 'Parent comment ID (supports nesting)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation time',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
    INDEX      idx_article (article_id),
    INDEX      idx_user (user_id),
    INDEX      idx_parent (parent_id)
);

-- 5. likes table - Likes records (prevent duplicate likes)
CREATE TABLE likes (
       user_id INT NOT NULL COMMENT 'User ID',
       article_id INT NOT NULL COMMENT 'Article ID',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Like time',
       PRIMARY KEY (user_id, article_id) COMMENT 'Composite primary key to prevent duplicate likes',
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
       FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
       INDEX idx_article (article_id)
);

-- Insert preset avatars sample data
INSERT INTO avatars (name, icon_path, display_order) VALUES
     ('Default Avatar', '/public/avatarImages/default.png', 1),
     ('Cat', '/public/avatarImages/cat.png', 2),
     ('Dog', '/public/avatarImages/dog.png', 3),
     ('Panda', '/public/avatarImages/panda.png', 4),
     ('Fox', '/public/avatarImages/fox.png', 5),
     ('Lion', '/public/avatarImages/lion.png', 6),
     ('Rabbit', '/public/avatarImages/rabbit.png', 7),
     ('Bear', '/public/avatarImages/bear.png', 8);

-- Insert sample user data
INSERT INTO users (username, password_hash, full_name, birthday, bio, avatar_url) VALUES
    ('alice', '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Alice Johnson', '1995-03-15', 'Love coding and coffee!', '/public/avatarImages/cat.png'),
    ('bob', '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Bob Smith', '1998-07-22', 'Travel enthusiast and photographer', '/public/avatarImages/dog.png'),
    ('charlie', '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Charlie Brown', '2000-11-08', 'Student learning web development', '/public/avatarImages/panda.png'),
    ('diana', '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Diana Prince', '1997-01-30', 'Tech blogger and AI researcher', '/public/avatarImages/fox.png'),
    ('eve', '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234', 'Eve Wilson', '1999-05-12', 'Full-stack developer', '/public/avatarImages/rabbit.png');

-- Insert sample articles data
INSERT INTO articles (title, content, image_url, author_id) VALUES
    ('Getting Started with Node.js', 'Node.js is a powerful runtime that lets you build scalable network applications using JavaScript. In this article, we will explore the basics of Node.js and how to set up your first project...', '/public/articleImages/nodejs-intro.png', 1),
    ('Top 10 Travel Destinations in 2026', 'Traveling is one of the best ways to broaden your horizons. Here are my top 10 recommended destinations for 2026, from the beaches of Bali to the mountains of Switzerland...', '/public/articleImages/travel-2026.png', 2),
    ('Understanding Database Design', 'Database design is crucial for building efficient applications. This guide covers normalization, relationships, and best practices for creating robust database schemas...', '/public/articleImages/database-design.png', 3),
    ('The Future of Artificial Intelligence', 'AI is transforming industries at an unprecedented pace. From healthcare to finance, machine learning algorithms are solving complex problems and creating new opportunities...', '/public/articleImages/ai-future.png', 4),
    ('Web Development Best Practices', 'Modern web development requires following best practices for security, performance, and maintainability. Learn about code organization, testing, and deployment strategies...', '/public/articleImages/web-dev-practices.png', 5),
    ('My Journey Learning Programming', 'Six months ago, I started my programming journey. It has been challenging but rewarding. Here are some tips for beginners who want to learn coding...', NULL, 1),
    ('Photography Tips for Beginners', 'Photography is both an art and a science. In this article, I share essential tips for capturing stunning photos, from understanding lighting to composition techniques...', '/public/articleImages/photography-tips.png', 2);

-- Insert sample comment data
INSERT INTO comments (content, user_id, article_id, parent_id) VALUES
    ('Great introduction to Node.js! Very helpful for beginners.', 2, 1, NULL),
    ('Thanks for sharing! Could you write more about Express framework?', 3, 1, NULL),
    ('I would love to write about Express next week!', 1, 1, 2),
    ('Amazing travel recommendations! I have been to Bali and it is absolutely beautiful.', 4, 2, NULL),
    ('Which destination would you recommend for a solo traveler?', 5, 2, NULL),
    ('For solo travelers, I highly recommend Japan or New Zealand. Both are very safe and welcoming!', 2, 2, 5),
    ('This database guide saved my project! Thank you so much.', 1, 3, NULL),
    ('Very insightful article about AI. The future is exciting!', 3, 4, NULL),
    ('Do you think AI will replace developers?', 5, 4, NULL),
    ('No, AI will augment developers, not replace them. We need to adapt and learn new tools.', 4, 4, 9),
    ('Completely agree! AI is just another tool in our toolkit.', 1, 4, 10),
    ('These web dev practices are exactly what I needed. Bookmarking this!', 2, 5, NULL),
    ('Your programming journey is inspiring! Keep it up!', 4, 6, NULL),
    ('How many hours per day did you study?', 3, 6, NULL),
    ('I studied about 2-3 hours daily, consistency is key!', 1, 6, 14),
    ('Love the photography tips! The composition section is particularly useful.', 5, 7, NULL),
    ('Could you share more about camera settings?', 3, 7, NULL),
    ('I will write a detailed guide on camera settings soon. Stay tuned!', 2, 7, 17);

-- Insert sample like data
INSERT INTO likes (user_id, article_id) VALUES
    (2, 1),
    (3, 1),
    (4, 1),
    (1, 2),
    (3, 2),
    (5, 2),
    (1, 3),
    (2, 3),
    (4, 3),
    (5, 3),
    (1, 4),
    (2, 4),
    (3, 4),
    (5, 4),
    (1, 5),
    (3, 5),
    (4, 5),
    (2, 6),
    (4, 6),
    (5, 6),
    (1, 7),
    (3, 7),
    (4, 7),
    (5, 7);


SELECT * FROM articles;
SELECT * FROM users;
SELECT * FROM likes;
SELECT * FROM avatars;
SELECT * FROM comments;
