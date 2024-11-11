import { Client } from "@elastic/elasticsearch";

const globalForElastic = global as unknown as { es: Client };

export const esClient = globalForElastic.es || new Client({ node: process.env.ELASTICSEARCH_URI });

globalForElastic.es = esClient;

export default esClient;
