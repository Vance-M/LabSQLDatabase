require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns doughnuts', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'Glazed',
          'baked_by_id': 1,
          'specialty': false,
          'price': '0.50',
          'owner_id': 1,
          'baked_by': 'Juan',
        },
        {
          'id': 2,
          'name': 'Old-Fashioned',
          'baked_by_id': 1,
          'specialty': false,
          'price': '0.60',
          'owner_id': 1,
          'baked_by': 'Juan',
        },
        {
          'id': 3,
          'name': 'Cake',
          'baked_by_id': 2,
          'specialty': false,
          'price': '0.75',
          'owner_id': 1,
          'baked_by': 'Twain',
        },
        {
          'id': 4,
          'name': 'Buttermilk',
          'baked_by_id': 2,
          'specialty': true,
          'price': '1.00',
          'owner_id': 1,
          'baked_by': 'Twain',
        },
        {
          'id': 5,
          'name': 'Bearclaw',
          'baked_by_id': 3,
          'specialty': true,
          'price': '1.50',
          'owner_id': 1,
          'baked_by': 'Tressa',
        },
        {
          'id': 6,
          'name': 'Cruller',
          'baked_by_id': 3,
          'specialty': true,
          'price': '1.00',
          'owner_id': 1,
          'baked_by': 'Tressa',
        },
        {
          'id': 7,
          'name': 'Maple Bar',
          'baked_by_id': 4,
          'specialty': false,
          'price': '0.75',
          'owner_id': 1,
          'baked_by': 'Ivy',
        },
        {
          'id': 8,
          'name': 'Sprinkles',
          'baked_by_id': 4,
          'specialty': false,
          'price': '0.60',
          'owner_id': 1,
          'baked_by': 'Ivy',
        }
      ];

      const data = await fakeRequest(app)
        .get('/doughnuts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns Old Fashioned doughnut', async() => {

      const expectation = 
      {
        'id': 2,
        'name': 'Old-Fashioned',
        'baked_by_id': 1,
        'specialty': false,
        'price': '0.60',
        'owner_id': 1,
        'baked_by': 'Juan',
      }
      ;

      const data = await fakeRequest(app)
        .get('/doughnuts/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // test('adds Jelly-filled doughnut to the list', async() => {
    //   const newDonut = {
    //     id: 9,
    //     name: 'Jelly-filled',
    //     baked_by_id: 4,
    //     specialty: true,
    //     price: '1.00',
    //     owner_id: 1,
    //     baked_by: 'Ivy',
    //   };
    //   const expectation = {
    //     ...newDonut,
    //   };
    //   const data = await fakeRequest(app)
    //     .post('/doughnuts')
    //     .send(newDonut)
    //     .expect('Content-Type', /json/)
    //     .expect(200);
    //   expect(data.body).toEqual(expectation);

    //   const allDoughnuts = await fakeRequest(app)
    //     .get('/doughnuts')
    //     .expect('Content-Type', /json/)
    //     .expect(200);
    //   const jellyFilled = allDoughnuts.body.find(doughnut => doughnut.name === 'Jelly-filled');

    //   expect(jellyFilled).toEqual(expectation);
    // });

    test('updates the price of a doughnut', async() =>{
      const newDoughnut = {
        id: 6,
        name: 'Cruller',
        baked_by_id: 3,
        specialty: true,
        price: '0.75',
        baker: 'Tressa',
      };

      const expectation = {
        ...newDoughnut,
      };

      await fakeRequest(app)
        .put('/doughnuts/6')
        .send(newDoughnut)
        .expect('Content-Type', /json/)
        .expect(200);

      const updatedDoughnut = await fakeRequest(app)
        .get('/doughnuts/6')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(updatedDoughnut.body).toEqual(expectation);
    });

    // test('deletes a doughnut from the list', async() => {
    //   const expectation = {
    //     id: 2,
    //     name: 'Old-Fashioned',
    //     baked_by_id: 1,
    //     specialty: false,
    //     price: '0.60',
    //     owner_id: 1,
    //   };

    //   const data = await fakeRequest(app)
    //     .delete('/doughnuts/2')
    //     .expect('Content-Type', /json/)
    //     .expect(200);
    //   expect(data.body).toEqual(expectation);

    //   const empty = await fakeRequest(app)
    //     .get('/doughnuts/2')
    //     .expect('Content-Type', /json/)
    //     .expect(200);
    //   expect(empty.body).toEqual('');
    // });
  });

});
