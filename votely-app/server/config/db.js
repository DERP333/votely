const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'votely-db.json');

// Initial seed data for vibrant out-of-the-box demonstration
const DEFAULT_SEED_DATA = {
  users: [
    {
      id: 'usr-1',
      name: 'Alex Morgan',
      gender: 'Male',
      mobile: '9876543210',
      email: 'alex.morgan@votely.io',
      voterId: 'VT-2024-8891',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'usr-2',
      name: 'Sophia Chen',
      gender: 'Female',
      mobile: '9123456780',
      email: 'sophia.chen@votely.io',
      voterId: 'VT-2024-1144',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ],
  polls: [
    {
      id: 'poll-101',
      code: 'VOTE-89X2',
      question: 'Who should be elected as the Class Representative for 2024-2025?',
      description: 'Annual election for the University Council. Review candidate manifestos before voting.',
      creatorEmail: 'sophia.chen@votely.io',
      creatorName: 'Sophia Chen',
      options: [
        { id: 'opt-1', text: 'Marcus Vance (Academic Excellence & Tech Workshops)', votes: 14 },
        { id: 'opt-2', text: 'Elena Rostova (Campus Life & Sports Engagement)', votes: 22 },
        { id: 'opt-3', text: 'Liam Gallagher (Student Wellbeing & Mental Health)', votes: 17 }
      ],
      voters: [
        { userId: 'usr-1', email: 'alex.morgan@votely.io', name: 'Alex Morgan', selectedOptionId: 'opt-2', votedAt: new Date(Date.now() - 3600000 * 6).toISOString() },
        { userId: 'usr-guest-1', email: 'david.miller@domain.com', name: 'David Miller', selectedOptionId: 'opt-1', votedAt: new Date(Date.now() - 3600000 * 12).toISOString() },
        { userId: 'usr-guest-2', email: 'priya.sharma@domain.com', name: 'Priya Sharma', selectedOptionId: 'opt-2', votedAt: new Date(Date.now() - 3600000 * 24).toISOString() }
      ],
      feedback: [
        {
          id: 'fb-1',
          voterName: 'Alex Morgan',
          voterEmail: 'alex.morgan@votely.io',
          comment: 'Elena’s proposal for intramural sports leagues and club funding is exactly what our campus needs!',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          id: 'fb-2',
          voterName: 'Priya Sharma',
          voterEmail: 'priya.sharma@domain.com',
          comment: 'All candidates are very strong, but Elena has great leadership experience.',
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ],
      status: 'Active',
      expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(), // 4 days left
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'poll-102',
      code: 'VOTE-7K3A',
      question: 'Which framework should our engineering team adopt for Q3 micro-frontends?',
      description: 'Technical evaluation poll after the sandbox architecture spike.',
      creatorEmail: 'alex.morgan@votely.io',
      creatorName: 'Alex Morgan',
      options: [
        { id: 'opt-1', text: 'React with Vite & Module Federation', votes: 31 },
        { id: 'opt-2', text: 'Next.js App Router Multi-Zones', votes: 19 },
        { id: 'opt-3', text: 'Astro with Islands Architecture', votes: 12 },
        { id: 'opt-4', text: 'SvelteKit Standalone Apps', votes: 8 }
      ],
      voters: [
        { userId: 'usr-2', email: 'sophia.chen@votely.io', name: 'Sophia Chen', selectedOptionId: 'opt-1', votedAt: new Date(Date.now() - 3600000 * 10).toISOString() }
      ],
      feedback: [
        {
          id: 'fb-3',
          voterName: 'Sophia Chen',
          voterEmail: 'sophia.chen@votely.io',
          comment: 'Vite Module Federation offers the fastest build times and smoothest DX for our mono-repo.',
          createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
        }
      ],
      status: 'Active',
      expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
      id: 'poll-103',
      code: 'VOTE-2W9P',
      question: 'Preferred Office Work Schedule Policy for the Fall Term',
      description: 'Quarterly team rhythm feedback vote.',
      creatorEmail: 'admin@votely.io',
      creatorName: 'People Ops',
      options: [
        { id: 'opt-1', text: 'Full Remote (Choice based)', votes: 45 },
        { id: 'opt-2', text: 'Hybrid (2 Days Office / 3 Days Remote)', votes: 38 },
        { id: 'opt-3', text: 'Hybrid (3 Days Office / 2 Days Remote)', votes: 14 }
      ],
      voters: [],
      feedback: [
        {
          id: 'fb-4',
          voterName: 'Samira Khan',
          voterEmail: 'samira@domain.com',
          comment: 'Choice-based remote yields the highest productivity and satisfaction.',
          createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
        }
      ],
      status: 'Expired',
      expiresAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.data = { users: [], polls: [] };
    this.initialized = false;
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
        this.save();
      }
      this.initialized = true;
      console.log('📦 Votely local database loaded successfully.');
    } catch (err) {
      console.error('Error initializing database, using in-memory fallback:', err);
      this.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }
}

const dbInstance = new Database();
dbInstance.init();

module.exports = {
  db: dbInstance
};

