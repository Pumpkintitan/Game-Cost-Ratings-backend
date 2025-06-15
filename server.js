const fastify = require('fastify')();
require('dotenv').config();

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL,
});

fastify.register(require('@fastify/cors'), { origin: '*' });

fastify.get('/prompt/:id', (req, reply) => {
  fastify.pg.query(
    'SELECT gameprompt FROM game WHERE id = $1',
    [req.params.id],
    function onResult(err, result) {
      reply.send(err || result);
    }
  );
});

fastify.get('/result/:id', (req, reply) => {
  fastify.pg.query(
    'SELECT gamerating, gameprompt from rating JOIN game ON gameid = game.id WHERE gameid = $1',
    [req.params.id],
    function onResult(err, result) {
      if (err) {
        return reply.send(err);
      }

      const dataList = [];
      let title = '';

      for (const row of result.rows) {
        dataList.push(parseFloat(row.gamerating));
        title = row.gameprompt;
      }

      reply.send({
        id: req.params.id,
        title: title,
        ratings: dataList,
      });
    }
  );
});

fastify.post('/postPrice', (req, reply) => {
  const price = req.body;

  fastify.pg.query(
    'INSERT INTO rating (gamerating, gameid) VALUES ($1, $2)',
    [price.price, parseInt(price.id)],
    function onResult(err, result) {
      if (err) {
        return reply.send(err);
      }
      reply.send(price);
    }
  );
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
