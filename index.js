// imports here for express and pg
const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_db');
const app = express();
// static routes here (you only need these for deployment)

// app routes here
app.use(express.json());
app.use(require('morgan')('dev'));
  // GET flavors 
  app.get('/api/flavors', async (req, res, next) => {
    try {
      const SQL = `
      SELECT * from flavors ORDER BY created_at DESC;
      `;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (err) {
        next(err);
    }
  });
  // GET flavors/:id
  app.get('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = `
      SELECT * from flavors
      WHERE id=$1;
      `;
      const response = await client.query(SQL, [req.params.id]);
      res.send(response.rows[0]);
    } catch (err) {
        next(err);
    }
  });
  // POST flavors
  app.post('/api/flavors', async (req, res, next) => {
    try {
      const SQL = `
      INSERT INTO flavors (name, is_favorite)
      VALUES($1, $2)
      RETURNING *;
      `; 
      const response = await client.query(SQL, [req.body.name, req.body.is_favorite]);
      res.send(response.rows[0]);
    } catch (err) {
        next(err);
    }
  });
  // PUT flavors/:id
  app.put('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL = `
      UPDATE flavors 
      SET name=$1, is_favorite=$2, updated_at=now()
      WHERE id=$3 RETURNING *;
      `;
      const response = await client.query(SQL, [req.body.name, req.body.is_favorite, req.params.id]);
      res.send(response.rows[0]);
    } catch (err) {
        next(err);
    }
  });
  // DELETE flavors/:id
  app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
      const SQL =`
      DELETE from flavors
      WHERE id=$1;
      `;
      const response = await client.query(SQL, [req.params.id]);
      res.sendStatus(204);
    } catch (err) {
        next(err);
    }
  });
   
// create your init function
const init = async () =>  {
  await client.connect();
  console.log('connected to database');
  let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
    INSERT INTO flavors(name, is_favorite) VALUES('pistachio', true);
    INSERT INTO flavors(name, is_favorite) VALUES('strawberry', true);
    INSERT INTO flavors(name) VALUES('mango');
    INSERT INTO flavors(name, is_favorite) VALUES('chocolate', false);
    INSERT INTO flavors(name) VAlUES('cherry');
    INSERT INTO flavors(name) VALUES('vanilla');
  `;
  await client.query(SQL);
  console.log('tatbles created');
  SQL = ``;
  await client.query(SQL);
  console.log('data seeded');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};
// init function invocation
init();