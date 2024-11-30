import { server } from './app';

server.listen(parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});