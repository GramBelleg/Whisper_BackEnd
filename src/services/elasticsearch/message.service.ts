import esClient from "@ES";
import { MessageIndex } from "@models/es.models";

const createMessagesIndex = async () => {
    const indexExists = await esClient.indices.exists({ index: "messages" });

    if (!indexExists) {
        await esClient.indices.create({
            index: "messages",
            body: {
                mappings: {
                    properties: {
                        messageId: { type: "keyword" },
                        userId: { type: "keyword" },
                        content: { type: "text", analyzer: "standard" },
                        senderId: { type: "integer" },
                        userName: { type: "text" },
                        profilePic: { type: "text" },
                        media: { type: "text" },
                        chatId: { type: "keyword" },
                        time: { type: "date" },
                    },
                },
            },
        });
    }
};

export const indexMessageInES = async (message: MessageIndex) => {
    const documentId = `${message.userId}-${message.messageId}`;
    await esClient.index({
        index: "messages",
        id: documentId,
        document: {
            ...message,
        },
    });
};

export const editMessageInES = async (messageId: number, newContent: string) => {
    return await esClient.updateByQuery({
        index: "messages",
        refresh: true,
        body: {
            script: {
                source: "ctx._source.content = params.newContent",
                params: { newContent },
            },
            query: {
                term: { messageId: messageId },
            },
        },
    });
};

export const deleteMessagesforUserInES = async (userId: number, Ids: number[]) => {
    await esClient.deleteByQuery({
        index: "messages",
        body: {
            query: {
                bool: {
                    must: [{ term: { userId: userId } }, { terms: { messageId: Ids } }],
                },
            },
        },
    });
};

export const deleteMessagesForAllInES = async (Ids: number[]) => {
    await esClient.deleteByQuery({
        index: "messages",
        refresh: true,
        body: {
            query: {
                bool: {
                    must: [{ terms: { messageId: Ids } }],
                },
            },
        },
    });
};

export const searchMessagesInES = async (userId: number, chatId: number, keyword: string) => {
    const result = await esClient.search({
        index: "messages",
        query: {
            bool: {
                must: [{ match: { content: keyword } }],
                filter: [{ match: { chatId } }, { match: { userId } }],
            },
        },
        sort: [
            {
                time: {
                    order: "desc",
                },
            },
        ],
    });
    const ret = result.hits.hits
        .map((hit) => hit._source as MessageIndex)
        .filter((source) => source !== null);
    return ret;
};

createMessagesIndex();
