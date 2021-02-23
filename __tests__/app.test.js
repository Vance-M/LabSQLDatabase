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
          id: 1,
          name: 'Glazed',
          description: 'Classic Glazed Doughnut',
          specialty: false,
          price: '0.50',
          owner_id: 1
        },
        {
          id: 2,
          name: 'Old-Fashioned',
          description: 'Doughnut made with sour cream and a tapered edge',
          specialty: false,
          price: '0.60',
          owner_id: 1
        },
        {
          id: 3,
          name: 'Cake',
          description: 'Doughnut made from sweetened dough',
          specialty: false,
          price: '0.75',
          owner_id: 1
        },
        {
          id: 4,
          name: 'Buttermilk',
          description: 'Classic doughnut made with buttermilk',
          specialty: true,
          price: '1.00',
          owner_id: 1
        },
        {
          id: 5,
          name: 'Bearclaw',
          description: 'Danish filled with almond paste and raisins',
          specialty: true,
          price: '1.50',
          owner_id: 1
        },
        {
          id: 6,
          name: 'Cruller',
          description: 'French inspired braided doughnut',
          specialty: true,
          price: '1.00',
          owner_id: 1
        },
        {
          id: 7,
          name: 'Maple Bar',
          description: 'Doughnut bar dipped in Maple cream',
          specialty: false,
          price: '0.75',
          owner_id: 1
        },
        {
          id: 8,
          name: 'Sprinkles',
          description: 'Chocolate dipped doughnut with sprinkles',
          specialty: false,
          price: '0.60',
          owner_id: 1
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
          id: 2,
          name: 'Old-Fashioned',
          description: 'Doughnut made with sour cream and a tapered edge',
          specialty: false,
          price: '0.60',
          owner_id: 1
        }
      ;

      const data = await fakeRequest(app)
        .get('/doughnuts/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('adds Jelly-filled doughnut to the list', async() => {
      const newDonut = {
        id: 9,
        name: 'Jelly-filled',
        description: 'Doughnut with raspberry jelly piped into the middle',
        specialty: true,
        price: '1.00',
        owner_id: 1,
      };
      const expectation = {
        ...newDonut,
      };
      const data = await fakeRequest(app)
        .post('/doughnuts')
        .send(newDonut)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);

      const allDoughnuts = await fakeRequest(app)
        .get('/doughnuts')
        .expect('Content-Type', /json/)
        .expect(200);
      const jellyFilled = allDoughnuts.body.find(doughnut => doughnut.name === 'Jelly-filled');

      expect(jellyFilled).toEqual(expectation);
    });

    test('updates the price of a doughnut', async() =>{
      const newDoughnut = {
        id: 6,
        name: 'Cruller',
        description: 'French inspired braided doughnut',
        specialty: true,
        price: '0.75',
        owner_id: 1,
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

    test('deletes a doughnut from the list', async() => {
      const expectation = {
        id: 2,
        name: 'Old-Fashioned',
        description: 'Doughnut made with sour cream and a tapered edge',
        specialty: false,
        price: '0.60',
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .delete('/doughnuts/2')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);

      const empty = await fakeRequest(app)
        .get('/doughnuts/2')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(empty.body).toEqual('');
    });
  });

});
