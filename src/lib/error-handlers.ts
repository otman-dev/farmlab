// Global error handlers for unhandled promise rejections and uncaught exceptions

if (typeof window === 'undefined') {
  // Server-side only
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
    
    // Handle MongoDB connection errors specifically
    if (reason && typeof reason === 'object' && 'code' in reason) {
      if (reason.code === 'ESERVFAIL' || reason.code === 'ENOTFOUND') {
        console.error('MongoDB Atlas DNS resolution failed. This is often temporary.');
        console.error('Possible solutions:');
        console.error('1. Check internet connectivity');
        console.error('2. Try again in a few minutes');
        console.error('3. Verify MongoDB Atlas cluster is accessible');
        return; // Don't crash the process for DNS failures
      }
    }
    
    // For other critical errors, you might want to restart or alert
    // process.exit(1); // Uncomment if you want to crash on unhandled rejections
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Handle MongoDB connection errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      const errorWithCode = error as Error & { code?: string };
      if (errorWithCode.code === 'ESERVFAIL' || errorWithCode.code === 'ENOTFOUND') {
        console.error('MongoDB Atlas DNS resolution failed in uncaught exception.');
        return; // Don't crash the process for DNS failures
      }
    }
    
    // For other critical errors, restart the process
    process.exit(1);
  });
}

export {}; // Make this a module