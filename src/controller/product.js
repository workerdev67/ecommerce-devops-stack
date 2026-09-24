import { RedisClient } from '../db/reddis.js';

export const getAggregatedProducts = async (req, res) => {
  try {
    const cacheKey = 'products:aggregated';

    // 1. Redis Cache Check
    if (RedisClient.isOpen) {
      const cachedData = await RedisClient.get(cacheKey);
      if (cachedData) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: JSON.parse(cachedData)
        });
      }
    }

    const url1 = process.env.PRODUCTAPI1;
    const url2 = process.env.PRODUCTAPI2;

    const [proA, proB] = await Promise.all([
      fetch(url1),
      fetch(url2)
    ]);

    const res1 = await proA.json();
    const res2 = await proB.json();

    // 2. Safe Array Extraction (Agar API { products: [...] } bhej rahi ho toh handling)
    const product1 = Array.isArray(res1) ? res1 : (res1.products || res1.data || []);
    const product2 = Array.isArray(res2) ? res2 : (res2.products || res2.data || []);

    const formatProduct = (item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      price: item.price,
      sku: item.sku
    });

    // 3. Map & Combine (Scope issue fixed)
    const combinedData = [
      ...product1.map(formatProduct),
      ...product2.map(formatProduct)
    ];

    // 4. Save to Redis
    if (RedisClient.isOpen && combinedData.length > 0) {
      await RedisClient.setEx(cacheKey, 600, JSON.stringify(combinedData));
    }

    return res.status(200).json({
      success: true,
      source: 'live_api',
      totalItems: combinedData.length,
      data: combinedData
    });

  } catch (error) {
    console.error('Error fetching aggregated products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate products',
      error: error.message
    });
  }
};