import express from 'express';

const router = express.Router();

// Basic test route
router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Test route is working perfectly!' 
  });
});

export default router;
