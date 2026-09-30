/**
 * mock-data.js
 * Default seed data for College Event Management System.
 * Automatically initializes in localStorage if not already present.
 */

const INITIAL_MOCK_USERS = [
  {
    id: "USR-ADMIN-1",
    name: "Dr. Arvind Sharma",
    email: "admin@college.edu",
    password: "admin",
    role: "admin",
    designation: "Dean of Student Affairs & Faculty Advisor",
    department: "Administration",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    createdAt: "2026-08-01T09:00:00Z"
  },
  {
    id: "USR-STU-1",
    name: "Aarav Patel",
    email: "student@college.edu",
    password: "student",
    role: "student",
    rollNumber: "2024CS1082",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    phone: "+91 91234 56789",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    bio: "Passionate full-stack developer and open-source enthusiast. President of the University Coding Club and avid hackathon participant.",
    createdAt: "2026-08-10T11:00:00Z"
  },
  {
    id: "USR-STU-2",
    name: "Priya Sharma",
    email: "priya.s@college.edu",
    password: "password123",
    role: "student",
    rollNumber: "2024EC2015",
    department: "Electronics & Communication",
    year: "2nd Year",
    phone: "+91 98111 22334",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    bio: "IoT builder, music lover, and coordinator for the Cultural Society.",
    createdAt: "2026-08-15T10:00:00Z"
  },
  {
    id: "USR-STU-3",
    name: "Rohan Nair",
    email: "rohan.n@college.edu",
    password: "password123",
    role: "student",
    rollNumber: "2023ME3040",
    department: "Mechanical Engineering",
    year: "4th Year",
    phone: "+91 97777 88990",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    bio: "Formula Student chassis lead, badminton varsity player.",
    createdAt: "2026-08-18T14:30:00Z"
  }
];

const INITIAL_MOCK_EVENTS = [
  {
    id: "EVT-101",
    title: "HackSphere 2026: 36-Hour National Hackathon",
    category: "Technology",
    date: "2026-10-15",
    time: "09:00 AM - 09:00 PM (36h)",
    venue: "Tech Park Auditorium & Innovation Labs",
    organizer: "Computer Science Dept & ACM Chapter",
    coordinatorName: "Prof. Rajesh Verma",
    coordinatorEmail: "hackathon@college.edu",
    totalSeats: 250,
    registeredSeats: 184,
    price: "Free",
    status: "Upcoming",
    featured: true,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    description: "Join over 250+ passionate developers, designers, and innovators for the flagship 36-hour hackathon of the academic year. Build next-gen solutions in AI, Web3, Smart Healthcare, and GreenTech with mentorship from top industry engineers.",
    eligibility: "Open to all enrolled undergraduate & postgraduate university students.",
    rules: "Teams of 2 to 4 members. Bring university ID card and personal laptops. Pre-registration mandatory.",
    tags: ["Coding", "AI/ML", "Hackathon", "Cash Prizes"]
  },
  {
    id: "EVT-102",
    title: "Pulse 2026: Annual Inter-College Cultural Gala",
    category: "Cultural",
    date: "2026-10-22",
    time: "05:00 PM - 10:30 PM",
    venue: "Grand Open Air Amphitheatre",
    organizer: "Student Cultural Committee",
    coordinatorName: "Dr. Ananya Roy",
    coordinatorEmail: "cultural@college.edu",
    totalSeats: 600,
    registeredSeats: 520,
    price: "Free",
    status: "Upcoming",
    featured: true,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    description: "Experience an electrifying night filled with live musical performances, celebrity band night, classical and western dance face-offs, drama, fashion showcases, and gourmet food stalls.",
    eligibility: "Open to all students, faculty members, and verified alumni.",
    rules: "Entry strictly with valid college ID and digital ticket QR code pass.",
    tags: ["Music", "Dance", "Celebrity Night", "Cultural"]
  },
  {
    id: "EVT-103",
    title: "Hands-on Generative AI & LLM Systems Bootcamp",
    category: "Workshop",
    date: "2026-10-08",
    time: "10:00 AM - 04:00 PM",
    venue: "Advanced Computing Lab 4, IT Block",
    organizer: "Center for Artificial Intelligence",
    coordinatorName: "Dr. Sameer Khan",
    coordinatorEmail: "ai.lab@college.edu",
    totalSeats: 80,
    registeredSeats: 72,
    price: "Free",
    status: "Upcoming",
    featured: true,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    description: "An intensive single-day technical bootcamp covering transformer architectures, prompt engineering, Retrieval Augmented Generation (RAG) pipelines, and local open-source models with Python and LangChain.",
    eligibility: "Prior familiarity with Python fundamentals is recommended.",
    rules: "Bring your laptop with Python 3.10+ installed. Certificate awarded upon lab completion.",
    tags: ["Workshop", "GenAI", "Python", "Hands-on"]
  },
  {
    id: "EVT-104",
    title: "Quantum Computing & Cryptography Summit",
    category: "Seminar",
    date: "2026-10-12",
    time: "02:00 PM - 05:00 PM",
    venue: "Dr. APJ Abdul Kalam Memorial Hall",
    organizer: "Dept. of Physics & Cyber Security",
    coordinatorName: "Prof. Vikram Malhotra",
    coordinatorEmail: "quantum.seminar@college.edu",
    totalSeats: 150,
    registeredSeats: 98,
    price: "Free",
    status: "Upcoming",
    featured: false,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
    description: "Distinguished research scientists and industry experts explore the emergence of quantum hardware, quantum supremacy, post-quantum encryption standards, and defending modern financial networks.",
    eligibility: "All undergraduate, masters, and PhD scholars.",
    rules: "Seats allocated on a first-come, first-served basis. Q&A session follows the keynote.",
    tags: ["Seminar", "Quantum", "CyberSecurity", "Research"]
  },
  {
    id: "EVT-105",
    title: "Inter-Department Athletic & Football Championship",
    category: "Sports",
    date: "2026-11-04",
    time: "08:00 AM - 06:00 PM",
    venue: "University Central Sports Complex",
    organizer: "Directorate of Physical Education",
    coordinatorName: "Coach Rakesh Tanwar",
    coordinatorEmail: "sports@college.edu",
    totalSeats: 300,
    registeredSeats: 215,
    price: "Free",
    status: "Upcoming",
    featured: false,
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    description: "Cheer for your department in track & field, 7-a-side football tournament, basketball, and table tennis. Trophies, cash awards, and certificates for winners.",
    eligibility: "Enrolled students with athletic gear and medical fitness clearance.",
    rules: "Team rosters must be verified by department sports captains prior to kickoff.",
    tags: ["Sports", "Football", "Athletics", "Championship"]
  },
  {
    id: "EVT-106",
    title: "Career Catalyst: Technical Interview Mastery & Placement Talk",
    category: "Career",
    date: "2026-10-18",
    time: "11:00 AM - 02:00 PM",
    venue: "Placement Cell Auditorium B",
    organizer: "Training & Placement Cell (T&P)",
    coordinatorName: "Ms. Shalini Iyer",
    coordinatorEmail: "tnp@college.edu",
    totalSeats: 200,
    registeredSeats: 165,
    price: "Free",
    status: "Upcoming",
    featured: false,
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    description: "Distinguished alumni working at top tech firms (Google, Microsoft, Adobe, Atlassian) share real placement secrets, Data Structures & Algorithms roadmap, system design basics, and live mock interview critiques.",
    eligibility: "Pre-final and final year students preparing for campus drives.",
    rules: "Bring printed copies of your resume for 1-on-1 alumni reviews.",
    tags: ["Career", "Placements", "Interviews", "Alumni"]
  }
];

const INITIAL_MOCK_REGISTRATIONS = [
  {
    id: "REG-1001",
    eventId: "EVT-101",
    eventTitle: "HackSphere 2026: 36-Hour National Hackathon",
    eventDate: "2026-10-15",
    eventVenue: "Tech Park Auditorium & Innovation Labs",
    userId: "USR-STU-1",
    studentName: "Aarav Patel",
    studentEmail: "student@college.edu",
    rollNumber: "2024CS1082",
    department: "Computer Science & Engineering",
    phone: "+91 91234 56789",
    status: "Confirmed",
    ticketCode: "TKT-HACK-8912",
    registeredAt: "2026-09-20T10:15:00Z"
  },
  {
    id: "REG-1002",
    eventId: "EVT-103",
    eventTitle: "Hands-on Generative AI & LLM Systems Bootcamp",
    eventDate: "2026-10-08",
    eventVenue: "Advanced Computing Lab 4, IT Block",
    userId: "USR-STU-1",
    studentName: "Aarav Patel",
    studentEmail: "student@college.edu",
    rollNumber: "2024CS1082",
    department: "Computer Science & Engineering",
    phone: "+91 91234 56789",
    status: "Confirmed",
    ticketCode: "TKT-GENAI-4401",
    registeredAt: "2026-09-22T14:30:00Z"
  },
  {
    id: "REG-1003",
    eventId: "EVT-101",
    eventTitle: "HackSphere 2026: 36-Hour National Hackathon",
    eventDate: "2026-10-15",
    eventVenue: "Tech Park Auditorium & Innovation Labs",
    userId: "USR-STU-2",
    studentName: "Priya Sharma",
    studentEmail: "priya.s@college.edu",
    rollNumber: "2024EC2015",
    department: "Electronics & Communication",
    phone: "+91 98111 22334",
    status: "Confirmed",
    ticketCode: "TKT-HACK-3392",
    registeredAt: "2026-09-21T11:00:00Z"
  },
  {
    id: "REG-1004",
    eventId: "EVT-102",
    eventTitle: "Pulse 2026: Annual Inter-College Cultural Gala",
    eventDate: "2026-10-22",
    eventVenue: "Grand Open Air Amphitheatre",
    userId: "USR-STU-2",
    studentName: "Priya Sharma",
    studentEmail: "priya.s@college.edu",
    rollNumber: "2024EC2015",
    department: "Electronics & Communication",
    phone: "+91 98111 22334",
    status: "Confirmed",
    ticketCode: "TKT-PULSE-5519",
    registeredAt: "2026-09-23T09:40:00Z"
  },
  {
    id: "REG-1005",
    eventId: "EVT-105",
    eventTitle: "Inter-Department Athletic & Football Championship",
    eventDate: "2026-11-04",
    eventVenue: "University Central Sports Complex",
    userId: "USR-STU-3",
    studentName: "Rohan Nair",
    studentEmail: "rohan.n@college.edu",
    rollNumber: "2023ME3040",
    department: "Mechanical Engineering",
    phone: "+91 97777 88990",
    status: "Confirmed",
    ticketCode: "TKT-SPORT-7782",
    registeredAt: "2026-09-25T16:20:00Z"
  },
  {
    id: "REG-1006",
    eventId: "EVT-106",
    eventTitle: "Career Catalyst: Technical Interview Mastery & Placement Talk",
    eventDate: "2026-10-18",
    eventVenue: "Placement Cell Auditorium B",
    userId: "USR-STU-3",
    studentName: "Rohan Nair",
    studentEmail: "rohan.n@college.edu",
    rollNumber: "2023ME3040",
    department: "Mechanical Engineering",
    phone: "+91 97777 88990",
    status: "Pending",
    ticketCode: "TKT-CAREER-1190",
    registeredAt: "2026-09-26T12:00:00Z"
  }
];

// Helper to seed localStorage
function initMockData() {
  if (!localStorage.getItem('college_events_users')) {
    localStorage.setItem('college_events_users', JSON.stringify(INITIAL_MOCK_USERS));
  }
  if (!localStorage.getItem('college_events_list')) {
    localStorage.setItem('college_events_list', JSON.stringify(INITIAL_MOCK_EVENTS));
  }
  if (!localStorage.getItem('college_events_registrations')) {
    localStorage.setItem('college_events_registrations', JSON.stringify(INITIAL_MOCK_REGISTRATIONS));
  }
}

// Auto-run initialization
initMockData();
