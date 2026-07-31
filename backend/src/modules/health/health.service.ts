export const getHealthStatus = () => {
  return {
    success: true,
    message: "Task Automation Platform API is running",
    data: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  };
};
