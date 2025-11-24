/**
 * Sample Resumes for Different Experience Levels
 * 
 * This file contains example resume documents that can be used
 * to demonstrate the InterviewPrepAI system's resume parsing and analysis.
 */

import { ResumeDocument } from '../src/models/types';

/**
 * Entry-level Software Engineer Resume
 */
export const entryLevelSWEResume: ResumeDocument = {
    content: `
John Doe
Software Engineer
Email: john.doe@email.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

EDUCATION
Bachelor of Science in Computer Science
State University, May 2023
GPA: 3.7/4.0

SKILLS
Programming Languages: Python, JavaScript, Java
Web Technologies: React, Node.js, HTML/CSS
Tools: Git, Docker, VS Code
Databases: MySQL, MongoDB
Concepts: Data Structures, Algorithms, OOP

PROJECTS
E-Commerce Website (Personal Project)
- Built a full-stack e-commerce platform using React and Node.js
- Implemented user authentication, shopping cart, and payment integration
- Deployed on AWS with CI/CD pipeline using GitHub Actions

Task Management App (Academic Project)
- Developed a collaborative task management application with real-time updates
- Used WebSockets for live collaboration features
- Implemented RESTful API with Express.js and MongoDB

EXPERIENCE
Software Engineering Intern
Tech Startup Inc., Summer 2022
- Contributed to frontend development using React and TypeScript
- Fixed 15+ bugs and implemented 3 new features
- Participated in code reviews and agile ceremonies
- Collaborated with team of 5 engineers

ACHIEVEMENTS
- Dean's List (4 semesters)
- Hackathon Winner - Built AI-powered study assistant in 24 hours
- Open source contributor to popular JavaScript library (10+ merged PRs)
`,
    format: 'text',
    filename: 'john_doe_resume.txt'
};

/**
 * Mid-level Software Engineer Resume
 */
export const midLevelSWEResume: ResumeDocument = {
    content: `
Sarah Johnson
Senior Software Engineer
Email: sarah.j@email.com | Phone: (555) 987-6543
LinkedIn: linkedin.com/in/sarahjohnson | Portfolio: sarahjohnson.dev

PROFESSIONAL SUMMARY
Software engineer with 4 years of experience building scalable web applications
and microservices. Expertise in full-stack development, system design, and
leading technical initiatives.

TECHNICAL SKILLS
Languages: JavaScript/TypeScript, Python, Go, SQL
Frontend: React, Vue.js, Next.js, Redux, Tailwind CSS
Backend: Node.js, Express, Django, FastAPI, GraphQL
Cloud & DevOps: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, Terraform
Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
Testing: Jest, Pytest, Cypress, Test-Driven Development

PROFESSIONAL EXPERIENCE
Software Engineer II
TechCorp Solutions, Jan 2021 - Present
- Architected and implemented microservices architecture serving 1M+ users
- Led migration from monolith to microservices, reducing deployment time by 60%
- Designed and built real-time notification system using WebSockets and Redis
- Mentored 3 junior engineers and conducted technical interviews
- Improved API response time by 40% through caching and query optimization
- Implemented comprehensive testing strategy, increasing code coverage to 85%

Software Engineer
StartupXYZ, Jun 2020 - Dec 2020
- Developed customer-facing features for SaaS platform using React and Node.js
- Built RESTful APIs and integrated third-party services (Stripe, SendGrid)
- Participated in on-call rotation and resolved production incidents
- Collaborated with product team to define technical requirements

Junior Software Engineer
Digital Agency Co., Jul 2019 - May 2020
- Built responsive web applications for clients using modern JavaScript frameworks
- Implemented CI/CD pipelines using Jenkins and automated testing
- Worked in agile environment with 2-week sprints

EDUCATION
Bachelor of Science in Computer Science
Tech University, 2019

NOTABLE PROJECTS
- Open Source Maintainer: Popular React component library (2K+ GitHub stars)
- Technical Blog: Write about system design and best practices (10K+ monthly readers)
- Conference Speaker: Presented on microservices patterns at DevConf 2022
`,
    format: 'text',
    filename: 'sarah_johnson_resume.txt'
};

/**
 * Senior Software Engineer Resume
 */
export const seniorSWEResume: ResumeDocument = {
    content: `
Michael Chen
Staff Software Engineer
Email: m.chen@email.com | Phone: (555) 456-7890
LinkedIn: linkedin.com/in/michaelchen | GitHub: github.com/mchen

EXECUTIVE SUMMARY
Staff engineer with 8+ years of experience architecting large-scale distributed
systems. Expert in system design, performance optimization, and technical leadership.
Track record of leading critical infrastructure projects and mentoring engineering teams.

CORE COMPETENCIES
System Architecture: Microservices, Event-Driven Architecture, Distributed Systems
Languages: Go, Python, Java, TypeScript, Rust
Cloud Platforms: AWS, GCP, Azure (multi-cloud architecture)
Infrastructure: Kubernetes, Docker, Terraform, Service Mesh (Istio)
Data Systems: PostgreSQL, Cassandra, Kafka, Redis, Elasticsearch
Observability: Prometheus, Grafana, Jaeger, ELK Stack
Leadership: Technical Strategy, Architecture Reviews, Team Mentorship

PROFESSIONAL EXPERIENCE
Staff Software Engineer
MegaCorp Inc., Mar 2019 - Present
- Lead architect for payment processing platform handling $500M+ annual transactions
- Designed fault-tolerant distributed system with 99.99% uptime SLA
- Reduced infrastructure costs by 35% through optimization and right-sizing
- Established engineering standards and best practices across 50+ person org
- Led incident response for critical production issues, reducing MTTR by 50%
- Mentored 10+ engineers, with 3 promoted to senior roles
- Drove adoption of observability practices, improving debugging efficiency
- Presented technical designs to executive leadership and stakeholders

Senior Software Engineer
CloudTech Systems, Jan 2017 - Feb 2019
- Built real-time analytics pipeline processing 10M+ events per day
- Implemented auto-scaling infrastructure reducing costs by 40%
- Led migration to Kubernetes, improving deployment reliability
- Designed API gateway serving 100K+ requests per second
- Conducted architecture reviews and provided technical guidance

Software Engineer
Enterprise Solutions Ltd., Jun 2015 - Dec 2016
- Developed microservices for enterprise CRM platform
- Implemented caching layer improving response times by 70%
- Built monitoring and alerting system for production services
- Participated in on-call rotation and production support

EDUCATION
Master of Science in Computer Science
Stanford University, 2015
Thesis: Distributed Consensus Algorithms in Cloud Environments

Bachelor of Science in Computer Engineering
MIT, 2013

PUBLICATIONS & SPEAKING
- "Scaling Microservices: Lessons from Production" - QCon 2022
- "Building Resilient Distributed Systems" - IEEE Software Journal, 2021
- Regular speaker at tech conferences and meetups

OPEN SOURCE
- Core contributor to popular distributed tracing framework
- Maintainer of Go microservices toolkit (5K+ stars)
- Active in Kubernetes and CNCF communities
`,
    format: 'text',
    filename: 'michael_chen_resume.txt'
};

/**
 * Entry-level Product Manager Resume
 */
export const entryLevelPMResume: ResumeDocument = {
    content: `
Emily Rodriguez
Associate Product Manager
Email: emily.r@email.com | Phone: (555) 234-5678

EDUCATION
Bachelor of Science in Business Administration
University of California, 2023
Minor in Computer Science

SKILLS
Product Management: User Research, Roadmap Planning, Agile/Scrum
Analytics: Google Analytics, Mixpanel, SQL, Excel
Design: Figma, User Stories, Wireframing
Technical: Basic HTML/CSS, Understanding of APIs and databases

EXPERIENCE
Product Management Intern
SaaS Company, Summer 2022
- Conducted user interviews with 20+ customers to identify pain points
- Created product requirements documents for 2 new features
- Worked with engineering team to prioritize backlog items
- Analyzed user metrics to measure feature adoption

Business Analyst Intern
Consulting Firm, Summer 2021
- Gathered requirements from stakeholders for digital transformation project
- Created process flow diagrams and documentation
- Presented findings to client leadership team

PROJECTS
Mobile App Product Launch (Capstone Project)
- Led team of 5 students to design and launch a campus events app
- Conducted user research with 100+ students
- Defined MVP features and created product roadmap
- App reached 500+ downloads in first month

ACHIEVEMENTS
- Product Management Certificate - Product School
- Winner of University Business Plan Competition
`,
    format: 'text',
    filename: 'emily_rodriguez_resume.txt'
};

/**
 * Entry-level Data Scientist Resume
 */
export const entryLevelDSResume: ResumeDocument = {
    content: `
Alex Kim
Data Scientist
Email: alex.kim@email.com | Phone: (555) 345-6789

EDUCATION
Master of Science in Data Science
Georgia Tech, 2023
Bachelor of Science in Mathematics
UCLA, 2021

TECHNICAL SKILLS
Programming: Python, R, SQL
Machine Learning: Scikit-learn, TensorFlow, PyTorch
Data Analysis: Pandas, NumPy, SciPy
Visualization: Matplotlib, Seaborn, Tableau
Tools: Jupyter, Git, Docker

PROJECTS
Customer Churn Prediction Model
- Built ML model to predict customer churn with 85% accuracy
- Performed feature engineering on dataset of 50K+ customers
- Used Random Forest and XGBoost algorithms
- Presented findings to stakeholders with actionable recommendations

Sentiment Analysis of Social Media Data
- Collected and analyzed 100K+ tweets using Twitter API
- Implemented NLP pipeline with BERT for sentiment classification
- Created interactive dashboard to visualize trends over time

EXPERIENCE
Data Science Intern
E-commerce Company, Summer 2022
- Analyzed A/B test results to optimize product recommendations
- Built predictive model for inventory forecasting
- Created SQL queries to extract insights from customer database
- Collaborated with product team to define success metrics

Research Assistant
University ML Lab, 2021-2022
- Assisted with deep learning research on computer vision
- Preprocessed and labeled image datasets
- Ran experiments and documented results

CERTIFICATIONS
- Google Data Analytics Professional Certificate
- Deep Learning Specialization (Coursera)
`,
    format: 'text',
    filename: 'alex_kim_resume.txt'
};

/**
 * All sample resumes organized by role and level
 */
export const sampleResumes = {
    softwareEngineer: {
        entry: entryLevelSWEResume,
        mid: midLevelSWEResume,
        senior: seniorSWEResume
    },
    productManager: {
        entry: entryLevelPMResume
    },
    dataScientist: {
        entry: entryLevelDSResume
    }
};
