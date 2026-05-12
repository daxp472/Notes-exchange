import express from 'express';
import {
  advancedSearch,
  getTrending,
  getSearchSuggestions
} from '../controllers/searchController.js';

const router = express.Router();

// Public search routes
router.get('/', advancedSearch);
router.get('/trending', getTrending);
router.get('/suggestions', getSearchSuggestions);

export default router;