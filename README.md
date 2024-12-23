# Whisper - Backend API

Whisper is a secure and scalable messaging platform designed to allow users to communicate in real-time. The backend API of Whisper handles features like user authentication, messaging, group chats, channels, and more. It is built using modern technologies such as Node.js, Express, and Socket.IO to provide a seamless user experience.

## Table of Contents

- [About Whisper](#about-whisper)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
    - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About Whisper

Whisper is a **Telegram clone** designed to facilitate seamless communication with features like real-time messaging, group chats, and channels. It aims to provide a user-friendly, scalable, and secure messaging platform, allowing users to interact with each other efficiently.

Core features include:

- **Real-time messaging**: Instant message delivery in both private and group chats.
- **Group Chats & Channels**: Create and manage groups, join public channels.
- **User Authentication**: Secure login, registration, and session management using JWT.
- **File Sharing**: Share images, documents, and multimedia messages.
- **Admin Controls**: Group admins can manage users, roles, and permissions.

## Technologies Used

The backend of Whisper is built with the following technologies:

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for building RESTful APIs.
- **Socket.IO**: Real-time bidirectional communication.
- **Prisma ORM**: ORM for interacting with the database.
- **PostgreSQL**: Relational database for persistent data storage.
- **Redis**: Caching and session management.
- **JWT (JSON Web Tokens)**: For secure user authentication and authorization.

## Features

The Whisper backend provides the following features:

- **User Management**: Register, log in, and update user profiles.
- **Real-time Messaging**: Instant messaging using WebSocket connections.
- **Group Management**: Create, update, and delete groups; manage group members.
- **Channel Management**: Join, leave, and manage channels.
- **Media Sharing**: Support for text, images, videos, and documents in chats.
- **Admin Controls**: Grant admin rights, promote/demote members in groups.
- **Security**: JWT authentication, password hashing, and secure communication over HTTPS.

## Getting Started

### Prerequisites

To get started with the Whisper backend, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **PostgreSQL** (or compatible relational database)
- **Redis** (for caching and session management)
- **Git** (for version control)

### Installation

Follow these steps to install and run Whisper's backend API:

1. Clone this repository:

    ```bash
    git clone https://github.com/yourusername/whisper-backend.git
    cd whisper-backend
    ```
