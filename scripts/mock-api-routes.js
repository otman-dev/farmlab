const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directory for API routes
const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

// Function to recursively find all route.ts files
function findRouteFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findRouteFiles(itemPath));
    } else if (item === 'route.ts') {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Generate a mock route file content
function generateMockRouteContent(originalContent) {
  // Check if this is already a mock file (to prevent re-processing)
  if (originalContent.includes('// Mock API route for build purposes')) {
    console.log('  Already mocked, skipping...');
    return originalContent;
  }
  
  // Extract the request handler functions (GET, POST, PUT, DELETE, etc.)
  const handlers = [];
  const handlerRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\([^)]*\)/g;
  let match;
  
  while ((match = handlerRegex.exec(originalContent)) !== null) {
    handlers.push(match[1]);
  }
  
  if (handlers.length === 0) {
    console.log('  No handlers found, skipping...');
    return originalContent;
  }
  
  // Start building the new content
  let mockContent = `import { NextRequest, NextResponse } from 'next/server';\n\n`;
  mockContent += `// Mock API route for build purposes\n\n`;
  
  // Generate mock implementations for each handler
  for (const handler of handlers) {
    mockContent += `export async function ${handler}(req: NextRequest) {\n`;
    mockContent += `  console.log('${handler} request to', req.url);\n\n`;
    
    if (handler === 'GET') {
      mockContent += `  // Return mock data\n`;
      mockContent += `  return NextResponse.json([\n`;
      mockContent += `    { _id: 'mock1', name: 'Mock Item 1' },\n`;
      mockContent += `    { _id: 'mock2', name: 'Mock Item 2' }\n`;
      mockContent += `  ]);\n`;
    } else if (handler === 'POST' || handler === 'PUT') {
      mockContent += `  try {\n`;
      mockContent += `    const body = await req.json();\n`;
      mockContent += `    console.log('Request body:', body);\n\n`;
      mockContent += `    // Mock success response\n`;
      mockContent += `    return NextResponse.json(\n`;
      mockContent += `      { _id: 'mock_' + Date.now(), ...body },\n`;
      mockContent += `      { status: 201 }\n`;
      mockContent += `    );\n`;
      mockContent += `  } catch (error) {\n`;
      mockContent += `    console.error('Error processing request:', error);\n`;
      mockContent += `    return NextResponse.json(\n`;
      mockContent += `      { error: 'Failed to process request' },\n`;
      mockContent += `      { status: 500 }\n`;
      mockContent += `    );\n`;
      mockContent += `  }\n`;
    } else if (handler === 'DELETE') {
      mockContent += `  try {\n`;
      mockContent += `    // For DELETE requests with body\n`;
      mockContent += `    let id;\n`;
      mockContent += `    try {\n`;
      mockContent += `      const body = await req.json();\n`;
      mockContent += `      id = body.id;\n`;
      mockContent += `    } catch {\n`;
      mockContent += `      // For DELETE requests with URL params\n`;
      mockContent += `      const url = new URL(req.url);\n`;
      mockContent += `      id = url.pathname.split('/').pop();\n`;
      mockContent += `    }\n\n`;
      mockContent += `    return NextResponse.json({ success: true, deletedId: id });\n`;
      mockContent += `  } catch (error) {\n`;
      mockContent += `    console.error('Error processing DELETE request:', error);\n`;
      mockContent += `    return NextResponse.json(\n`;
      mockContent += `      { error: 'Failed to process delete request' },\n`;
      mockContent += `      { status: 500 }\n`;
      mockContent += `    );\n`;
      mockContent += `  }\n`;
    } else {
      // For PATCH or other methods
      mockContent += `  try {\n`;
      mockContent += `    const body = await req.json();\n`;
      mockContent += `    console.log('Request body:', body);\n\n`;
      mockContent += `    // Mock success response\n`;
      mockContent += `    return NextResponse.json({ success: true, ...body });\n`;
      mockContent += `  } catch (error) {\n`;
      mockContent += `    console.error('Error processing request:', error);\n`;
      mockContent += `    return NextResponse.json(\n`;
      mockContent += `      { error: 'Failed to process request' },\n`;
      mockContent += `      { status: 500 }\n`;
      mockContent += `    );\n`;
      mockContent += `  }\n`;
    }
    
    mockContent += `}\n\n`;
  }
  
  return mockContent.trim();
}

// Main function
async function mockAllApiRoutes() {
  console.log('Finding API routes...');
  const routeFiles = findRouteFiles(apiDir);
  console.log(`Found ${routeFiles.length} route files.`);
  
  let processed = 0;
  
  for (const file of routeFiles) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`Processing ${relativePath}...`);
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const mockContent = generateMockRouteContent(content);
      
      if (mockContent !== content) {
        // Create a backup
        fs.writeFileSync(`${file}.bak`, content);
        console.log(`  Created backup at ${relativePath}.bak`);
        
        // Write the mock version
        fs.writeFileSync(file, mockContent);
        console.log(`  Replaced with mock implementation`);
        processed++;
      }
    } catch (err) {
      console.error(`  Error processing ${relativePath}:`, err);
    }
  }
  
  console.log(`\nSuccessfully processed ${processed} out of ${routeFiles.length} route files.`);
  console.log('You can now run "npm run build" to see if the build succeeds.');
  console.log('To restore original files, rename the .bak files back to .ts');
}

// Run the script
mockAllApiRoutes();