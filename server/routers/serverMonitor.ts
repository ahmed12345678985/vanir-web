import { adminProcedure, router } from "../_core/trpc";
import os from "os";

export const serverMonitorRouter = router({
  getStats: adminProcedure.query(() => {
    return {
      uptime: process.uptime(),
      osUptime: os.uptime(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      processMem: process.memoryUsage(),
      cpus: os.cpus().map(c => ({ model: c.model, speed: c.speed })),
      loadAvg: os.loadavg(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }),
});
