const { setup } = require('./dist/setup.js');

async function runSetup() {
  try {
    await setup();
    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

runSetup(); 