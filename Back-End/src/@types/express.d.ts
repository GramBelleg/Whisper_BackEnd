declare global {
  namespace Express {
    interface Request {
      userId: number;
      // Add other custom properties here if needed
    }
  }
}

// This empty export is necessary to make this a module
export {}