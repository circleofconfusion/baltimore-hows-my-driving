# Baltimore How's My Driving?

This is the source code for the @BadDrivingBmore Twitter bot.

## Features

 - Responds to tweet mentions that include one or more license plates in the form<state-code>:<license-plate-number> ex. MD:ATRAIN
 - Publishes a monthly summary of the previous month's
 violation activity
 - Publishes the worst driver of the previous month

 ## Notes

 Twitter has a rather arcane way of (un)subscribing to account activity.
 All of this has been automated with the scripts in the
 `twitter_scripts` directory.

 Much of this code is specific to the data found in the Open Baltimore
 [Parking Citations](https://data.baltimorecity.gov/Transportation/Parking-Citations/n4ma-fj3m/data) database.

 Tests can be run with `npm test`. This will also generate a test coverage report. Tests can be automatically run on code changes with
 `npm run test-watch`, but no code coverage reports will be generated.