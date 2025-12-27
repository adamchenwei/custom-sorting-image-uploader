I want to develop a react native app that can uplaod images to a server, it should do the following:

1. its for now, a more android focused app, we will think about ios later.
2. make sure this is compatible to as early as android 12 and as latest as latest android.
3. the user can choose which folder this react native app will be watching at all time, user can choose multiple folders. this info will be stored in the app's local storage.
4. when a file is uploading, uploaded, or failed, the app should show a notification to the user, and the notification should be able to be swiped away. when failed, the app will try re-upload the file together with the next new file get added to the watched folder.
5. whenever a file is uploaded successfully, the file will be removed form the watched folder in the device.
6. keep a log file in the app's local storage, and the log file should be able to be read by the user. and the log file should be able to be cleared by the user.
7. the app will have a UI shows below things:
  1. a list of watched folders.
  2. a button to add a new watched folder.
  3. a button to remove a watched folder.
  4. a button to clear the log file.
  5. a button to open the log file.
8. the server the files got uploaded to is to this app's aws storage server: /Users/adamchenwei/www/custom-sorting-image-viewer, look at how its optimizing and then uploading the files, its should be the same approach. let user know if anything need to be added to this react native app that can not be done by the agent and then verify every requirements.


Keep iterate until the app works and build without issue.