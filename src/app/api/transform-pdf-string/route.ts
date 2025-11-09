import { NextRequest, NextResponse } from 'next/server';
import {
  getNewChatCompletionWithGroq,
  GroqTimeoutError,
} from '@/llms/groq/groq';
import { parseResumeOutput } from '@/lib/llm/transform-pdf-utils';
import { withTimeout } from '@/utils/withTimeout';

const GROQ_TIMEOUT_MS = 120_000;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const input =
      typeof payload === 'string'
        ? payload
        : typeof payload?.input === 'string'
          ? payload.input
          : undefined;

    if (!input) {
      return NextResponse.json(
        { error: 'Missing or invalid input string.' },
        { status: 400 },
      );
    }

    const inlineMock =
      typeof payload === 'object' &&
      payload !== null &&
      typeof (payload as Record<string, unknown>).mockResponse === 'string'
        ? ((payload as Record<string, unknown>).mockResponse as string)
        : undefined;

    let result: unknown;
    if (inlineMock) {
      result = inlineMock;
    } else if (process.env.MOCK_GROQ_RESPONSE) {
      result =
        '```json\n{\n  "title": "Dhairya Varshney",\n  "socialHandles": [\n    {\n      "label": "Phone",\n      "link": "tel:+919911720868"\n    },\n    {\n      "label": "Email",\n      "link": "mailto:dhairyavarshneyoffice@gmail.com"\n    },\n    {\n      "label": "GitHub",\n      "link": "https://github.com/dhairya-varshney"\n    },\n    {\n      "label": "GitHub",\n      "link": "https://github.com/dvbuiilds"\n    }\n  ],\n  "workExperience": {\n    "title": "Experience",\n    "experience": [\n      {\n        "companyName": "MakeMyTrip",\n        "jobTitle": "Senior Software Engineer I",\n        "startDate": "August 2025",\n        "endDate": "Present",\n        "description": [\n          "Architected and Constructed the Template Component for W2G Destination Page with React, GraphQL, and React Native, delivering modern browser-based experiences for 1M+ users.",\n          "Collaborated closely with UX designers, product managers, and engineering teams throughout feature development lifecycle to implement On Demand Booking Options.",\n          "Demonstrated technical leadership by implementing comprehensive event tracking across 15+ pages, increasing actionable product metrics by 21%."\n        ]\n      },\n      {\n        "companyName": "MakeMyTrip",\n        "jobTitle": "Software Engineer",\n        "startDate": "August 2023",\n        "endDate": "July 2025",\n        "description": [\n          "Redesigned W2G Home Page by architecting and implementing a high-performance, modern user experience using React Query, Server-Driven UI, GraphQL, and React Native. Led the complete migration from legacy codebase, resulting in significant improvements in page load times and user engagement.",\n          "Led cross-functional team of 3 engineers to build Internal CMS Admin Panel using NextJS, delivering full stack solution for SEO optimization and CDN asset migration, improving performance by 15 points.",\n          "Developed User Generated Content Funnel using React Native and GraphQL increasing content upload completion rate by 17%.",\n          "Established robust data validation layer cutting production errors by 90%, ensuring high-quality user experiences in browser environments.",\n          "Identified performance gaps and architected migration from deprecated Redux to React Query, reducing bundle size, bumping up the web performance by 16 points.",\n          "Built a scalable UI library with Storybook for admin tools, adopted by 6+ internal teams."\n        ]\n      },\n      {\n        "companyName": "Data and Strategy Unit, DARPG",\n        "jobTitle": "FullStack Engineer Intern",\n        "startDate": "June 2022",\n        "endDate": "August 2022",\n        "description": [\n          "Designed and implemented full stack Performance Monitoring Dashboard for grievance officers, translating Figma wireframes into interactive web interfaces using HTML, CSS, and jQuery.",\n          "Developed dynamic dashboard components with jQuery and jQuery-UI, improving data visualization and usability.",\n          "Created backend integration with REST APIs using Ajax for real-time data visualization, enhancing dashboard responsiveness by 20%.",\n          "Built automated Selenium-based form extraction automation tool with custom connectors for chatbot integration, saving 5 days monthly bandwidth."\n        ]\n      }\n    ]\n  },\n  "projects": {\n    "title": "Projects",\n    "projects": [\n      {\n        "organizationName": "AbroadKart",\n        "projectTitle": "AbroadKart",\n        "startDate": "August 2025",\n        "endDate": "Present",\n        "description": [\n          "Constructed a Full Stack Platform for Matching University Courses using NextJS Frontend and ExpressJS Backend.",\n          "Created a Dataset of Universities from Developed Economies using Groq API. The dataset is then transformed for matching with Student Filters.",\n          "Architected a College Matching Algo to handle matching between 1000+ College Program Objects and Student Filters.",\n          "Designed the Web App using NextJS for taking Student Input on College Program Preferences & Show College Listing.",\n          "Created SEO friendly Blog Template for easy integration with content generation tools loading the page 5 secs faster than WordPress template."\n        ]\n      }\n    ]\n  },\n  "education": {\n    "title": "Education",\n    "courses": [\n      {\n        "courseName": "Bachelor of Technology in Information Technology",\n        "institutionName": "Delhi Technological University",\n        "startDate": "Aug 2019",\n        "endDate": "May 2023",\n        "scoreEarned": "CGPA 9.23/10",\n        "description": ""\n      },\n      {\n        "courseName": "Intermediate in Physics, Maths, Chemistry & Computer Science",\n        "institutionName": "D.A.V. Public School, Delhi",\n        "startDate": "Mar 2018",\n        "endDate": "Mar 2018",\n        "scoreEarned": "93.4/100",\n        "description": ""\n      }\n    ]\n  },\n  "activities": {\n    "title": "Activities",\n    "activities": []\n  },\n  "skills": {\n    "title": "Technical Skills",\n    "skillSet": [\n      {\n        "title": "Languages",\n        "skills": [\n          "TypeScript",\n          "JavaScript",\n          "Java",\n          "Python",\n          "C++",\n          "HTML",\n          "CSS"\n        ]\n      },\n      {\n        "title": "Frontend Frameworks",\n        "skills": [\n          "React",\n          "React Native",\n          "NextJS"\n        ]\n      },\n      {\n        "title": "Backend Technologies",\n        "skills": [\n          "GraphQL",\n          "REST APIs",\n          "Node.js",\n          "Server-Driven UI"\n        ]\n      },\n      {\n        "title": "Developer Tools",\n        "skills": [\n          "Cursor",\n          "Google Collab",\n          "Jupyter Notebook",\n          "VS Code"\n        ]\n      }\n    ]\n  },\n  "achievements": {\n    "title": "Achievements",\n    "achievementList": []\n  }\n}\n```';
    } else {
      result = await withTimeout(
        getNewChatCompletionWithGroq(input),
        GROQ_TIMEOUT_MS,
      );
    }

    if (typeof result !== 'string') {
      return NextResponse.json(
        { error: 'Groq did not return a string response.' },
        { status: 502 },
      );
    }

    const data = parseResumeOutput(result);

    if (!data) {
      return NextResponse.json(
        { error: 'Unable to extract resume data from LLM response.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof GroqTimeoutError) {
      return NextResponse.json({ error: err.message }, { status: 504 });
    }

    const message =
      err instanceof Error ? err.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
