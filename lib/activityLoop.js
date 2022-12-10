// Create an array of activities
var activities = [ "Yes...", "No...", "Ho Ho Ho...", "Bleurgh...", "Blah Blah Blah..." ];

// Create a function to choose an activity
const chooseActivity = () => {
    // Choose a random number between 0 and the length of the activities array
    var randomIndex = Math.floor(Math.random() * activities.length);
    // Return the activity at the random index
    return activities[randomIndex];
}

async function activityLoop(client) {
    // Set the activity to the first activity in the array
    var activity = activities[0];

    // Loop forever
    while (true) {
        // Set the bot's activity
        await client.user.setActivity(activity);
        // Wait a random amount of time between 10 and 30 seconds
        await new Promise(r => setTimeout(r, Math.floor(Math.random() * 20 + 10) * 1000));
        // Choose a new activity
        activity = chooseActivity();
    }
}

// Export the function
module.exports.activityLoop = activityLoop;