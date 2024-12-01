const { execSync } = require("child_process");

module.exports = async () => {
    console.log("Resetting test database...");

    try {
        // Run the reset script and pass all required answers
        execSync(
            "npm run clearDB:test",
            { stdio: "inherit" }
        );
        console.log("Test database is cleared successfully.");
    } catch (error) {
        console.error("Error clearing test database:", error.message);
        process.exit(1); // Exit with an error code if the script fails
    }
};
