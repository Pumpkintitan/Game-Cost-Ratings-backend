const fastify = require('fastify')();
const cors = require('@fastify/cors');
require('dotenv').config();

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL,
});

fastify.register(cors, {
  origin: ['http://localhost:5173', process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

fastify.get('/prompt/:id', (req, reply) => {
  console.log(`GET /prompt/${req.params.id}`);
  fastify.pg.query(
    'SELECT gameprompt FROM game WHERE id = $1',
    [req.params.id],
    function onResult(err, result) {
      console.log(`Sent ${err || result}`);
      reply.send(err || result);
    }
  );
});

fastify.get('/result/:id', (req, reply) => {
  console.log(`GET /result/${req.params.id}`);
  fastify.pg.query(
    'SELECT gamerating, gameprompt from rating JOIN game ON gameid = game.id WHERE gameid = $1',
    [req.params.id],
    function onResult(err, result) {
      if (err) {
        console.log(`Error: ${err}`);
        return reply.send(err);
      }

      const dataList = [];
      let title = '';

      for (const row of result.rows) {
        dataList.push(parseFloat(row.gamerating));
        title = row.gameprompt;
      }

      console.log(`Sent ${dataList}`);

      reply.send({
        id: req.params.id,
        title: title,
        ratings: dataList,
      });
    }
  );
});

fastify.post('/postPrice', (req, reply) => {
  console.log(`POST /postPrice`);
  const price = req.body;

  fastify.pg.query(
    'INSERT INTO rating (gamerating, gameid) VALUES ($1, $2)',
    [price.price, parseInt(price.id)],
    function onResult(err, result) {
      if (err) {
        console.log(`Error: ${err}`);
        return reply.send(err);
      }
      console.log(`Sent ${price}`);
      reply.send(price);
    }
  );
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
