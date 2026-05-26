const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDirectory = path.join(__dirname, '..', 'data');
const usersFilePath = path.join(dataDirectory, 'devUsers.json');

const ensureStore = () => {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, '[]\n');
  }
};

const readUsers = () => {
  ensureStore();

  try {
    const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  ensureStore();
  fs.writeFileSync(usersFilePath, `${JSON.stringify(users, null, 2)}\n`);
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const publicUser = (user) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  role: user.role || 'user',
  preferences: user.preferences || {
    currency: 'INR',
    defaultMarket: 'IN',
    riskProfile: 'balanced',
    theme: 'dark',
  },
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createUser = async ({ name, email, password }) => {
  const users = readUsers();
  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();

  if (users.some((user) => user.email === normalizedEmail)) {
    return null;
  }

  const user = {
    _id: `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    name: String(name || '').trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    avatar: '',
    role: 'user',
    preferences: {
      currency: 'INR',
      defaultMarket: 'IN',
      riskProfile: 'balanced',
      theme: 'dark',
    },
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  writeUsers(users);
  return publicUser(user);
};

const verifyUser = async ({ email, password }) => {
  const user = readUsers().find((item) => item.email === normalizeEmail(email));

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null;
  }

  return publicUser(user);
};

const findUserById = (userId) => {
  const user = readUsers().find((item) => item._id === userId);
  return user ? publicUser(user) : null;
};

module.exports = {
  createUser,
  verifyUser,
  findUserById,
};
