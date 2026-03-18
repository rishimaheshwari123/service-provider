const Property = require("../models/propertyModel");

/**
 * Update all references to a category name across the system
 * @param {string} oldName - The old category name
 * @param {string} newName - The new category name
 * @returns {Object} - Update results
 */
const updateCategoryReferences = async (oldName, newName) => {
  try {
    console.log(`Updating category references: ${oldName} -> ${newName}`);
    
    // Update properties where category field matches old name
    const categoryUpdateResult = await Property.updateMany(
      { category: oldName },
      { 
        $set: { 
          category: newName,
          title: newName // Also update title if it matches the category name
        }
      }
    );
    
    // Update properties where title matches old name but category might be different
    const titleUpdateResult = await Property.updateMany(
      { 
        title: oldName,
        category: { $ne: newName } // Don't update if category was already updated above
      },
      { 
        $set: { title: newName }
      }
    );
    
    const totalUpdated = categoryUpdateResult.modifiedCount + titleUpdateResult.modifiedCount;
    
    console.log(`Updated ${totalUpdated} properties:`, {
      categoryUpdates: categoryUpdateResult.modifiedCount,
      titleUpdates: titleUpdateResult.modifiedCount
    });
    
    return {
      success: true,
      totalUpdated,
      categoryUpdates: categoryUpdateResult.modifiedCount,
      titleUpdates: titleUpdateResult.modifiedCount
    };
    
  } catch (error) {
    console.error("Error updating category references:", error);
    return {
      success: false,
      error: error.message,
      totalUpdated: 0
    };
  }
};

/**
 * Bulk update multiple category names
 * @param {Array} updates - Array of {oldName, newName} objects
 * @returns {Object} - Bulk update results
 */
const bulkUpdateCategoryReferences = async (updates) => {
  try {
    const results = [];
    let totalUpdated = 0;
    
    for (const { oldName, newName } of updates) {
      const result = await updateCategoryReferences(oldName, newName);
      results.push({ oldName, newName, ...result });
      totalUpdated += result.totalUpdated;
    }
    
    return {
      success: true,
      totalUpdated,
      results
    };
    
  } catch (error) {
    console.error("Error in bulk update:", error);
    return {
      success: false,
      error: error.message,
      totalUpdated: 0
    };
  }
};

module.exports = {
  updateCategoryReferences,
  bulkUpdateCategoryReferences
};