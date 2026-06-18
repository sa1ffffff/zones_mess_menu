import fs from 'fs';
import path from 'path';

// Let's write a simple script to check zones-logo.png size and potentially output some info about it.
const filePath = 'public/zones-logo.png';
if (fs.existsSync(filePath)) {
  const stats = fs.statSync(filePath);
  console.log(`File size: ${stats.size} bytes`);
} else {
  console.log('File does not exist');
}
