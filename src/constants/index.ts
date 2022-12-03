import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 8080;

export const ENDPOINT = '/api/users';

export const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};


