import { readDatabase, restoreDatabase, writeDatabase } from '../database';

import request from 'supertest';

import { server } from '.';
import { TUser, MSG } from '../types';

let initialDatabase = [] as TUser[];
let database = [] as TUser[];

describe('scenario three', () => {
  beforeAll(async () => {
    database = await readDatabase();
    initialDatabase = [...database];
  });

  afterAll(async () => {
    // await writeDatabase(initialDatabase);
    await restoreDatabase();
  });

  it('should get user', async () => {
    const userId = (database.at(-1) as TUser).id;
    const { statusCode, ok } = await request(server).get(`/api/users/${userId}`);

    expect(statusCode).toEqual(200);
    expect(ok).toBeTruthy();
  });

  it('should not get updated user', async () => {
    const userId = (database[0] as TUser).id;
    const user = database.find((user) => user.id === userId);
    const updateUser = {
      username: user?.username,
      age: user?.age,
      hobbies: ['blogging'],
      animal: 'dog',
    };

    const { statusCode, text } = await request(server).put(`/api/users/${userId}`).send(updateUser);

    expect(statusCode).toBe(400);
    expect(text).toMatch(MSG.INCORRECT_FIELDS);
  });

  it('should get updated user', async () => {
    const userId = (database[1] as TUser).id;
    const user = database.find((user) => user.id === userId);
    const index = database.findIndex((item) => item.id === userId);
    const updateUser = {
      username: user?.username,
      age: 50,
      hobbies: ['blogging'],
    };

    const { statusCode, body, ok } = await request(server)
      .put(`/api/users/${userId}`)
      .send(updateUser);

    database[index] = body;

    expect(statusCode).toBe(200);
    expect(ok).toBeTruthy();
    expect(body.age).toEqual(50);
  });

  it('should not get deleted user', async () => {
    const userId = (database.at(-10) as TUser)?.id;
    const { badRequest, statusCode } = await request(server).delete(`/api/users/${userId}`);

    expect(statusCode).toBe(400);
    expect(badRequest).toBeTruthy();
  });

  it('should not get all users', async () => {
    const { statusCode, text } = await request(server).get('/api/allUsers');

    expect(statusCode).toEqual(400);
    expect(text).toMatch(MSG.INCORRECT_URL);
  });
});
