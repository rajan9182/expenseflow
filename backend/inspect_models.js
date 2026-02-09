const mongoose = require('mongoose');
const Expense = require('./src/models/Expense');
const Income = require('./src/models/Income');
const Transaction = require('./src/models/Transaction');
const Budget = require('./src/models/Budget');


function inspectModel(name, model) {
    console.log(`\n--- Inspecting ${name} ---`);
    const categoryPath = model.schema.path('category');
    if (categoryPath) {
        console.log(`Path 'category' found in ${name}`);
        console.log(`  Type: ${categoryPath.instance}`);
        console.log(`  Required: ${categoryPath.options.required}`);
        if (categoryPath.enumValues) {
            console.log(`  Enum values: ${JSON.stringify(categoryPath.enumValues)}`);
        } else {
            console.log(`  No enum values found in categoryPath.enumValues`);
        }
        if (categoryPath.options.enum) {
            console.log(`  Enum options: ${JSON.stringify(categoryPath.options.enum)}`);
        }
    } else {
        console.log(`Path 'category' NOT found in ${name}`);
    }
}

inspectModel('Expense', Expense);
inspectModel('Income', Income);
inspectModel('Transaction', Transaction);
inspectModel('Budget', Budget);


process.exit(0);
