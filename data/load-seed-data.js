const client = require('../lib/client');
// import our seed data:
const doughnuts = require('./donuts.js');
const bakersData = require('./baked-by');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    const bakers = await Promise.all(
      bakersData.map(baker => {
        return client.query(`
              INSERT INTO bakers (baked_by)
              VALUES ($1)
              returning *;`,
        [baker.baked_by]);
      })
    );
    const user = users[0].rows[0];
    // console.log(bakers);
    await Promise.all(
      doughnuts.map(doughnut => {
        return client.query(`
                    INSERT INTO doughnuts (name, baked_by_id, specialty, price, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [
          doughnut.name,
          doughnut.baked_by_id,
          doughnut.specialty,
          doughnut.price,
          user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
