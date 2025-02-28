-- CreateEnum
CREATE TYPE "ChatType" AS ENUM ('DM', 'GROUP', 'CHANNEL');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'STICKER', 'GIF', 'VIDEO', 'VM', 'AUDIO', 'IMAGE', 'DOC', 'CALL', 'EVENT');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('Everyone', 'Contacts', 'Nobody');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Offline', 'Online');

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "type" "ChatType" NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "chatId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "maxSize" INTEGER NOT NULL,
    "privacy" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "Channel" (
    "chatId" INTEGER NOT NULL,
    "privacy" TEXT NOT NULL,
    "inviteLink" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "unreadMessageCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageId" INTEGER,
    "isContact" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "GroupParticipant" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "canDelete" BOOLEAN NOT NULL DEFAULT true,
    "canPost" BOOLEAN NOT NULL DEFAULT true,
    "canEdit" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelParticipant" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "canDownload" BOOLEAN NOT NULL DEFAULT true,
    "canComment" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChannelParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "forwardedFromUserId" INTEGER,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "forwarded" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "selfDestruct" BOOLEAN NOT NULL DEFAULT false,
    "isAnnouncement" BOOLEAN NOT NULL DEFAULT false,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "expiresAfter" INTEGER,
    "type" "MessageType" NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "mentions" INTEGER[],
    "media" TEXT[],
    "parentMessageId" INTEGER,
    "parentContent" TEXT,
    "parentMedia" TEXT[],

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageStatus" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "read" TIMESTAMP(3),
    "delivered" TIMESTAMP(3),
    "time" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceMessage" (
    "MessageId" INTEGER NOT NULL,

    CONSTRAINT "VoiceMessage_pkey" PRIMARY KEY ("MessageId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "name" TEXT,
    "password" VARCHAR(256) NOT NULL,
    "phoneNumber" TEXT,
    "loggedInDevices" INTEGER NOT NULL DEFAULT 0,
    "profilePic" TEXT,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasStory" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "status" "Status" NOT NULL DEFAULT 'Online',
    "autoDownloadSize" INTEGER NOT NULL DEFAULT 0,
    "readReceipts" BOOLEAN NOT NULL DEFAULT true,
    "lastSeenPrivacy" "Privacy" NOT NULL DEFAULT 'Everyone',
    "pfpPrivacy" "Privacy" NOT NULL DEFAULT 'Everyone',
    "storyPrivacy" "Privacy" NOT NULL DEFAULT 'Everyone',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "content" TEXT NOT NULL,
    "media" TEXT,
    "type" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "privacy" "Privacy" NOT NULL DEFAULT 'Everyone',

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storyView" (
    "storyId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "liked" BOOLEAN NOT NULL DEFAULT false,
    "viewedAgain" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storyView_pkey" PRIMARY KEY ("storyId","userId")
);

-- CreateTable
CREATE TABLE "Relates" (
    "relatingId" INTEGER NOT NULL,
    "relatedById" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isContact" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Relates_pkey" PRIMARY KEY ("relatingId","relatedById")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_chatId_userId_key" ON "ChatParticipant"("chatId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipant_groupId_userId_key" ON "GroupParticipant"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelParticipant_channelId_userId_key" ON "ChannelParticipant"("channelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageStatus_messageId_userId_key" ON "MessageStatus"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_userName_key" ON "User"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "UserToken_userId_idx" ON "UserToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_userId_token_key" ON "UserToken"("userId", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Story_id_key" ON "Story"("id");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "MessageStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelParticipant" ADD CONSTRAINT "ChannelParticipant_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("chatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelParticipant" ADD CONSTRAINT "ChannelParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentMessageId_fkey" FOREIGN KEY ("parentMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_forwardedFromUserId_fkey" FOREIGN KEY ("forwardedFromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceMessage" ADD CONSTRAINT "VoiceMessage_MessageId_fkey" FOREIGN KEY ("MessageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyView" ADD CONSTRAINT "storyView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyView" ADD CONSTRAINT "storyView_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relates" ADD CONSTRAINT "Relates_relatingId_fkey" FOREIGN KEY ("relatingId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relates" ADD CONSTRAINT "Relates_relatedById_fkey" FOREIGN KEY ("relatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
