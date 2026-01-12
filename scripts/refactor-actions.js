#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const actionsDir = '/Users/deepak/Documents/Devleap/GreenRatchet/app/actions';

// List of simple analytics actions that follow the same pattern
const simpleActions = [
  'water-analytics-actions.ts',
  'water-stressed-region-analytics.ts',
  'renewable-energy-analytics.ts',
  'electricity-mix-analytics.ts',
  'carbon-free-energy-analytics.ts',
  'low-carbon-region-analytics.ts',
  'grid-carbon-intensity.ts'
];

function refactorSimpleAction(filePath, serviceFunctionName, contextName) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the service import
  const serviceImportMatch = content.match(/import\s+{\s*([^}]+)\s*}\s+from\s+"([^"]+)"/);
  if (!serviceImportMatch) return;
  
  const [, importName, importPath] = serviceImportMatch;
  
  // Create new content
  const newContent = `"use server";

import { ${importName} } from "${importPath}";
import { withServerAction } from "@/lib/server-action-utils";

export async function ${serviceFunctionName}() {
  return withServerAction(
    async (user) => {
      return await ${importName}(user.organizationId);
    },
    "${contextName}"
  );
}`;

  fs.writeFileSync(filePath, newContent);
  console.log(`Refactored: ${path.basename(filePath)}`);
}

// Refactor simple actions
const actionMappings = {
  'water-analytics-actions.ts': ['getWaterTimelineAction', 'fetch water timeline'],
  'grid-carbon-intensity.ts': ['getGridCarbonIntensityAction', 'fetch grid carbon intensity'],
};

Object.entries(actionMappings).forEach(([filename, [functionName, context]]) => {
  const filePath = path.join(actionsDir, filename);
  if (fs.existsSync(filePath)) {
    try {
      refactorSimpleAction(filePath, functionName, context);
    } catch (error) {
      console.error(`Error refactoring ${filename}:`, error.message);
    }
  }
});

console.log('Batch refactoring completed!');
