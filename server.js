const express = require('express');
const { randomUUID: uuidv4 } = require('crypto'); // built into Node.js — no install needed

const app = express();
app.use(express.json());

// ─── In-Memory Storage ───────────────────────────────────────────────────────
let users = [
  { id: uuidv4(), name: 'Alice Johnson', email: 'alice@example.com', role: 'admin',    createdAt: new Date('2024-01-10').toISOString() },
  { id: uuidv4(), name: 'Bob Smith',     email: 'bob@example.com',   role: 'editor',   createdAt: new Date('2024-02-15').toISOString() },
  { id: uuidv4(), name: 'Carol White',   email: 'carol@example.com', role: 'viewer',   createdAt: new Date('2024-03-20').toISOString() },
  { id: uuidv4(), name: 'David Lee',     email: 'david@example.com', role: 'editor',   createdAt: new Date('2024-04-05').toISOString() },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const findUser = (id) => users.find(u => u.id === id);

const validateUser = ({ name, email }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('valid email is required');
  return errors;
};

// ─── GET /users ───────────────────────────────────────────────────────────────
app.get('/users', (req, res) => {
  let result = [...users];

  // ?search=
  const { search, sort, order } = req.query;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  }

  // ?sort=name&order=asc|desc
  if (sort) {
    const validFields = ['name', 'email', 'role', 'createdAt'];
    if (!validFields.includes(sort)) {
      return res.status(400).json({ error: `sort must be one of: ${validFields.join(', ')}` });
    }
    result.sort((a, b) => {
      const av = (a[sort] || '').toLowerCase();
      const bv = (b[sort] || '').toLowerCase();
      return av < bv ? -1 : av > bv ? 1 : 0;
    });
    if (order === 'desc') result.reverse();
  }

  res.json({ total: result.length, users: result });
});

// ─── GET /users/:id ───────────────────────────────────────────────────────────
app.get('/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ─── POST /users ──────────────────────────────────────────────────────────────
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  const errors = validateUser({ name, email });
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role || 'viewer',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// ─── PUT /users/:id ───────────────────────────────────────────────────────────
app.put('/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, email, role } = req.body;

  // Partial validation — only validate if the field is provided
  if (name !== undefined && name.trim().length < 2) {
    return res.status(400).json({ error: 'name must be at least 2 characters' });
  }
  if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'valid email is required' });
  }
  if (email && email !== user.email && users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  if (name  !== undefined) user.name  = name.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();
  if (role  !== undefined) user.role  = role;
  user.updatedAt = new Date().toISOString();

  res.json(user);
});

// ─── DELETE /users/:id ────────────────────────────────────────────────────────
app.delete('/users/:id', (req, res) => {
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const [deleted] = users.splice(idx, 1);
  res.json({ message: 'User deleted', user: deleted });
});

// ─── 404 Fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  User Management API running at http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET    /users           – list / filter / sort users`);
  console.log(`  GET    /users/:id       – get user by id`);
  console.log(`  POST   /users           – create a new user`);
  console.log(`  PUT    /users/:id       – update a user`);
  console.log(`  DELETE /users/:id       – delete a user\n`);
});