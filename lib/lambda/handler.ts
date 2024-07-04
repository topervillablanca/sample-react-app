export async function handler(event: string, context: string) {
    console.log('Stage name pipeline currently in: ', process.env.stage);
    return {
        body: 'Hello there',
        statusCode: 200,
    };
}