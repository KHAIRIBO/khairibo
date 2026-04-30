-- Sample Data for Khairi Portfolio Database
-- Run this AFTER creating the schema

-- Insert sample projects
INSERT INTO projects (title, description, link, image_url, category) VALUES
('Portfolio Website', 'A modern React-based portfolio showcasing my work with Supabase integration', 'https://github.com/yourname/portfolio', 'https://via.placeholder.com/400x300?text=Portfolio', 'Web Development'),
('E-Commerce App', 'Full-stack e-commerce platform built with Node.js and React', 'https://github.com/yourname/ecommerce', 'https://via.placeholder.com/400x300?text=E-Commerce', 'Full Stack'),
('Mobile App', 'iOS and Android app for task management using React Native', 'https://github.com/yourname/mobile-app', 'https://via.placeholder.com/400x300?text=Mobile', 'Mobile Development'),
('Data Dashboard', 'Interactive data visualization dashboard with real-time updates', 'https://github.com/yourname/dashboard', 'https://via.placeholder.com/400x300?text=Dashboard', 'Data Visualization'),
('AI Chatbot', 'Intelligent chatbot powered by machine learning algorithms', 'https://github.com/yourname/chatbot', 'https://via.placeholder.com/400x300?text=Chatbot', 'AI/ML');

-- Insert sample about info
INSERT INTO about (bio, skills, experience, education) VALUES
('Hello! I''m a full-stack developer passionate about creating beautiful and functional web experiences. With 3+ years of experience, I specialize in React, Node.js, and cloud technologies.',
'React, Node.js, JavaScript, TypeScript, PostgreSQL, Supabase, Express, HTML, CSS, Git',
'3+ years of full-stack development experience with focus on modern web technologies and responsive design',
'Bachelor of Science in Computer Science from State University (2021)');

-- Insert sample contacts/socials
INSERT INTO contacts (name, email, platform, url) VALUES
('GitHub', 'github@example.com', 'GitHub', 'https://github.com/yourname'),
('LinkedIn', 'linkedin@example.com', 'LinkedIn', 'https://linkedin.com/in/yourname'),
('Twitter', 'twitter@example.com', 'Twitter', 'https://twitter.com/yourname'),
('Email', 'hello@example.com', 'Email', 'mailto:hello@example.com');

-- Insert sample blog posts (optional)
INSERT INTO blog_posts (title, slug, content, excerpt, published) VALUES
('Getting Started with Supabase', 'getting-started-supabase', 
'Supabase is an open-source Firebase alternative. It provides a PostgreSQL database, authentication, and real-time capabilities. In this post, we''ll explore how to set up Supabase and integrate it with a React application.',
'Learn how to set up Supabase and build real-time applications',
TRUE),
('React Hooks Best Practices', 'react-hooks-best-practices',
'React Hooks have revolutionized the way we write React components. In this comprehensive guide, we''ll cover best practices for using useState, useEffect, and custom hooks.',
'Master React Hooks with these essential best practices',
TRUE),
('Building Scalable Node.js APIs', 'scalable-nodejs-apis',
'Learn how to build scalable and maintainable Node.js APIs using Express. We''ll cover architecture patterns, middleware, error handling, and deployment strategies.',
'Build production-ready Node.js applications',
TRUE);
