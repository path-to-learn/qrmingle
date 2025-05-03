  // Global analytics for admin dashboard
  adminRoutes.get('/global-analytics', async (req, res) => {
    try {
      // Get all users, profiles, and scan logs
      const allUsers = await storage.getAllUsers();
      const allProfiles = await storage.getAllProfiles();
      const allScanLogs = await storage.getAllScanLogs();
      
      // Calculate total scans
      const totalScans = allScanLogs.length;
      
      // Get top profiles by scan count
      const profileScans = allProfiles.map(profile => ({
        id: profile.id,
        name: profile.name,
        scans: profile.scanCount
      })).sort((a, b) => b.scans - a.scans);
      
      // Calculate device distribution
      const deviceDistribution: Record<string, number> = {};
      
      allScanLogs.forEach((log) => {
        let deviceType = 'Unknown';
        
        if (log.device?.includes('Android')) {
          deviceType = 'Android';
        } else if (log.device?.includes('iPhone') || log.device?.includes('iPad')) {
          deviceType = 'iOS';
        } else if (log.device?.includes('Windows')) {
          deviceType = 'Desktop';
        } else if (log.device?.includes('Mac')) {
          deviceType = 'Mac';
        }
        
        deviceDistribution[deviceType] = (deviceDistribution[deviceType] || 0) + 1;
      });
      
      // Calculate browser distribution
      const browserDistribution: Record<string, number> = {};
      
      allScanLogs.forEach((log) => {
        const browserType = log.browser || 'Unknown';
        browserDistribution[browserType] = (browserDistribution[browserType] || 0) + 1;
      });
      
      // Calculate OS distribution
      const osDistribution: Record<string, number> = {};
      
      allScanLogs.forEach((log) => {
        const osType = log.os || 'Unknown';
        osDistribution[osType] = (osDistribution[osType] || 0) + 1;
      });
      
      // Calculate country distribution
      const countryCounts: Record<string, number> = {};
      const countryCodeMap: Record<string, string> = {}; // Maps country names to country codes
      
      allScanLogs.forEach((log) => {
        if (log.country) {
          const country = log.country;
          countryCounts[country] = (countryCounts[country] || 0) + 1;
          
          // Record country code if available
          if (log.countryCode) {
            countryCodeMap[country] = log.countryCode;
          }
        }
      });
      
      // Create country data for the grid
      const countryData = Object.entries(countryCounts).map(([country, count]) => ({
        country,
        countryCode: countryCodeMap[country] || '',
        visitors: count
      }));
      
      res.json({
        totalScans,
        totalProfiles: allProfiles.length,
        totalUsers: allUsers.length,
        profileScans,
        deviceDistribution,
        browserDistribution,
        osDistribution,
        countryData
      });
    } catch (error) {
      console.error('Error fetching global analytics:', error);
      res.status(500).json({ message: "Failed to fetch global analytics" });
    }
  });