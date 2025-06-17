const fastify = require('fastify')({
  logger: true,
});
const cors = require('@fastify/cors');
const postgres = require('@fastify/postgres');
require('dotenv').config();

fastify.register(postgres, {
  connectionString: process.env.DATABASE_URL,
});

fastify.register(cors, {
  origin: [process.env.FRONTEND_URL],
  methods: ['GET', 'POST'],
});

fastify.get('/prompt/:id', (req, reply) => {
  fastify.log.info(`GET /prompt/${req.params.id}`);
  fastify.pg.query(
    'SELECT gameprompt FROM game WHERE id = $1',
    [req.params.id],
    function onResult(err, result) {
      fastify.log.info(`Sent ${err || result}`);
      reply.send(err || result);
    }
  );
});

fastify.get('/result/:id', (req, reply) => {
  fastify.log.info(`GET /result/${req.params.id}`);
  fastify.pg.query(
    'SELECT gamerating, gameprompt from rating JOIN game ON gameid = game.id WHERE gameid = $1',
    [req.params.id],
    function onResult(err, result) {
      if (err) {
        fastify.log.error(`Error: ${err}`);
        return reply.send(err);
      }

      const dataList = [];
      let title = '';

      for (const row of result.rows) {
        dataList.push(parseFloat(row.gamerating));
        title = row.gameprompt;
      }

      fastify.log.info(`Sent ${dataList}`);

      reply.send({
        id: req.params.id,
        title: title,
        ratings: dataList,
      });
    }
  );
});

fastify.post('/postPrice', (req, reply) => {
  fastify.log.info(`POST /postPrice`);
  const price = req.body;

  fastify.pg.query(
    'INSERT INTO rating (gamerating, gameid) VALUES ($1, $2)',
    [price.price, parseInt(price.id)],
    function onResult(err, result) {
      if (err) {
        fastify.log.error(`Error: ${err}`);
        return reply.send(err);
      }
      fastify.log.info(`Sent ${price}`);
      reply.send(price);
    }
  );
});

fastify.listen(
  { host: '0.0.0.0', port: Number(process.env.PORT) || 3000 },
  (err) => {
    if (err) throw err;
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  }
);
