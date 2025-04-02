// Simple script to run the migration using ESM
import { migrate } from './migrate.js';

migrate()
  .then(() => console.log('Migration complete!'))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });