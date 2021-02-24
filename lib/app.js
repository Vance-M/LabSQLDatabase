const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/doughnuts', async(req, res) => {
  try {
    const data = await client.query(`
          SELECT 
            doughnuts.id,
            doughnuts.name,
            doughnuts.baked_by_id,
            doughnuts.specialty,
            doughnuts.price,
            bakers.baked_by as baker
        from doughnuts
        JOIN bakers
        ON doughnuts.baked_by_id = bakers.id
        `);
    
    res.json(data.rows);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/bakers', async(req, res) => {
  try {
    const data = await client.query('SELECT * from bakers');

    res.json(data.rows);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/doughnuts/:id', async(req, res) =>{
  try {
    const id = Number(req.params.id);
    const data = await client.query(`
    SELECT 
    doughnuts.id,
    doughnuts.name,
    doughnuts.baked_by_id,
    doughnuts.specialty,
    doughnuts.price,
    bakers.baked_by as baker
    from doughnuts
    JOIN bakers
    ON doughnuts.baked_by_id = bakers.id
    `);
    data.rows.find((doughnut) => doughnut.id === id);
    res.json(data.rows.find((doughnut) => doughnut.id === id));
  } catch (e){
    res.status(500).json({ error: e.message });
  }
});

app.delete('/doughnuts/:id', async(req, res) =>{
  try {
    const id = Number(req.params.id);
    const data = await client.query('DELETE from doughnuts where id=$1 returning *', [id]);
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/doughnuts', async(req, res) =>{
  try {
    const data = await client.query(`INSERT INTO doughnuts (name, baked_by_id, specialty, price, owner_id)
    VALUES ($1, $2, $3, $4, $5) 
    returning *`,
    [
      req.body.name,
      req.body.baked_by_id,
      req.body.specialty,
      req.body.price,
      1]);
    res.json(data.rows[0]);
  } catch (e) {     
    res.status(500).json({ error: e.message });
  }
});

app.put('/doughnuts/:id', async(req, res) =>{
  const id = Number(req.params.id);
  try {
    const data = await client.query(`UPDATE doughnuts SET name = $1, baked_by_id = $2, specialty = $3, price = $4
    WHERE id = $5 
    returning *`,
    [
      req.body.name,
      req.body.baked_by_id,
      req.body.specialty,
      req.body.price,
      id]);

    res.json(data.rows[0]);
  } catch (e) {     
    res.status(500).json({ error: e.message });
  }
});
app.use(require('./middleware/error'));

module.exports = app;

