import { APIGatewayProxyEvent } from 'aws-lambda';
import { getAll } from '../lambda/apiHandlers/get-all';
import { create } from '../lambda/apiHandlers/create';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getAll();
      case 'POST':
        return await create(event.body);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid HTTP method' }),
        };
    }
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: error }),
    };
  }
};